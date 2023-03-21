import {
	ActionIcon,
	Box,
	Group,
	ScrollArea,
	Table,
	Text,
	Title,
} from '@mantine/core';
import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useFetcher, useLoaderData } from '@remix-run/react';
import { IconTrash } from '@tabler/icons';
import dayjs from 'dayjs';
import { PrimaryButton } from '~/components/Buttons/PrimaryButton';
import { HiddenSessionId } from '~/components/Utils/HiddenSessionId';
import { deleteChangelogEntry, getChangelog } from '~/models/changelog.server';
import { requireUser, requireUserId } from '~/server/session.server';

export const loader = async ({ request, params }: LoaderArgs) => {
	const user = await requireUser(request);

	const changelog = await getChangelog();

	return json({ user, changelog });
};

export const action = async ({ request }: ActionArgs) => {
	await requireUserId(request);

	const formData = await request.formData();
	const intent = formData.get('intent');

	if (intent === 'deleteChangelogEntry') {
		const changelogId = formData.get('changelogId')?.toString() ?? '';

		try {
			await deleteChangelogEntry(changelogId);
			return json({
				success: true,
				intent,
				message: 'Changelog entry deleted',
			});
		} catch (e) {
			return json({
				success: false,
				intent,
				message: 'Error deleting changelog entry',
			});
		}
	}

	return json({});
};
export default function User() {
	const { user, changelog } = useLoaderData<typeof loader>();
	const fetcher = useFetcher();

	const rows = changelog.map((ch) => (
		<tr key={ch.id}>
			<td>{dayjs(ch.date).format('MMM DD, YYYY')}</td>
			<td>{ch.image}</td>
			<td>
				<Box maw={400}>
					<Text truncate>{ch.content}</Text>
				</Box>
			</td>
			<td>{dayjs(ch.createdAt).format('YY-MM-DD H:mm:ss')}</td>
			<td>
				<fetcher.Form method={'post'}>
					<input
						type="hidden"
						name={'changelogId'}
						value={ch.id}
					/>
					<HiddenSessionId />
					<ActionIcon
						type={'submit'}
						name={'intent'}
						value={'deleteChangelogEntry'}
						color={'red'}
					>
						<IconTrash size={16} />
					</ActionIcon>
				</fetcher.Form>
			</td>
		</tr>
	));
	return (
		<Box my={12}>
			<Group
				position={'right'}
				my={12}
			>
				<PrimaryButton>New changelog entry</PrimaryButton>
			</Group>
			{changelog.length ? (
				<ScrollArea>
					<Table
						withBorder
						sx={{ minWidth: 576 }}
					>
						<thead>
							<tr>
								<th>Publish Date</th>
								<th>Image</th>
								<th>Changelog</th>
								<th>Created At</th>
								<th>Delete</th>
							</tr>
						</thead>
						<tbody>{rows}</tbody>
					</Table>
				</ScrollArea>
			) : (
				<Title
					order={5}
					align={'center'}
					my={24}
				>
					Currently no changelog data
				</Title>
			)}
		</Box>
	);
}
