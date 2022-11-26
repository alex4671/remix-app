import {
	ActionIcon,
	AspectRatio,
	Card,
	Group,
	Image,
	SimpleGrid,
} from '@mantine/core';
import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Link, useFetcher, useLoaderData } from '@remix-run/react';
import { IconTrash } from '@tabler/icons';
import { PrimaryButton } from '~/components/Buttons/PrimaryButton';
import { getAllUserNotes } from '~/models/notes.server';
import { requireUser } from '~/server/session.server';

export const loader = async ({ request }: LoaderArgs) => {
	const user = await requireUser(request);
	const notes = await getAllUserNotes(user.id);

	return json({
		notes,
	});
};

export default function NotesIndex() {
	const { notes } = useLoaderData<typeof loader>();
	const fetcher = useFetcher();
	return (
		<>
			<Group
				position={'right'}
				my={24}
			>
				<PrimaryButton
					component={Link}
					to={'/notes/new'}
				>
					New note
				</PrimaryButton>
			</Group>
			<SimpleGrid
				cols={4}
				breakpoints={[
					{ maxWidth: 'md', cols: 3 },
					{ maxWidth: 'sm', cols: 2 },
					{ maxWidth: 'xs', cols: 1 },
				]}
			>
				{notes?.map((note) => {
					return (
						<Card
							p="lg"
							withBorder
							key={note.id}
						>
							<Card.Section>
								<AspectRatio ratio={16 / 9}>
									<Image src={note.preview} />
								</AspectRatio>
							</Card.Section>
							<Link
								to={`./${note.id}`}
								key={note.id}
							>
								Note
							</Link>
							<fetcher.Form method={'post'}>
								<input
									type="hidden"
									name={'noteId'}
									value={note.id}
								/>
								<ActionIcon
									type={'submit'}
									name={'intent'}
									value={'deleteNote'}
								>
									<IconTrash size={18} />
								</ActionIcon>
							</fetcher.Form>
						</Card>
					);
				})}
			</SimpleGrid>
		</>
	);
}
