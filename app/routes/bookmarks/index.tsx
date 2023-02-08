import {
	ActionIcon,
	Card,
	Group,
	SimpleGrid,
	Text,
	TextInput,
	Title,
} from '@mantine/core';
import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Link, useFetcher, useLoaderData } from '@remix-run/react';
import { IconTrash } from '@tabler/icons-react';
import { PrimaryButton } from '~/components/Buttons/PrimaryButton';
import { getAllUserBookmarks } from '~/models/bookmarks.server';
import { requireUser } from '~/server/session.server';

export const loader = async ({ request }: LoaderArgs) => {
	const user = await requireUser(request);
	const bookmarks = await getAllUserBookmarks(user.id);

	return json({
		bookmarks,
	});
};

export default function BookmarksIndex() {
	const { bookmarks } = useLoaderData<typeof loader>();
	const fetcher = useFetcher();
	return (
		<>
			<fetcher.Form
				method={'post'}
				action={'/bookmarks'}
			>
				<Group
					position={'right'}
					my={24}
				>
					<TextInput
						placeholder={'Bookmark URL'}
						name={'bookmarkUrl'}
					/>
					<PrimaryButton
						type={'submit'}
						name={'intent'}
						value={'createBookmark'}
					>
						Save
					</PrimaryButton>
				</Group>
			</fetcher.Form>
			{bookmarks.length ? (
				<SimpleGrid
					cols={4}
					breakpoints={[
						{ maxWidth: 'md', cols: 3 },
						{ maxWidth: 'sm', cols: 2 },
						{ maxWidth: 'xs', cols: 1 },
					]}
				>
					{bookmarks?.map((bookmark) => {
						return (
							<Card
								p="lg"
								withBorder
								key={bookmark.id}
							>
								<Text
									component={Link}
									to={`./${bookmark.id}`}
									key={bookmark.id}
									fz={'md'}
								>
									{bookmark.title}
								</Text>
								<fetcher.Form
									method={'post'}
									action={'/bookmarks'}
								>
									<input
										type="hidden"
										name={'bookmarkId'}
										value={bookmark.id}
									/>
									<ActionIcon
										type={'submit'}
										name={'intent'}
										value={'deleteBookmark'}
									>
										<IconTrash size={18} />
									</ActionIcon>
								</fetcher.Form>
							</Card>
						);
					})}
				</SimpleGrid>
			) : (
				<Title
					order={3}
					align={'center'}
				>
					Nothing found
				</Title>
			)}
		</>
	);
}
