import {
	ActionIcon,
	Box,
	Group,
	Modal,
	ScrollArea,
	Table,
	Text,
	Textarea,
	Title,
} from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useFetcher, useLoaderData } from '@remix-run/react';
import { IconPencil, IconTrash } from '@tabler/icons';
import dayjs from 'dayjs';
import { useState } from 'react';
import { PrimaryButton } from '~/components/Buttons/PrimaryButton';
import { SecondaryButton } from '~/components/Buttons/SecondaryButton';
import { HiddenSessionId } from '~/components/Utils/HiddenSessionId';
import {
	createChangelogEntry,
	deleteChangelogEntry,
	getChangelog,
	updateChangelogEntry,
} from '~/models/changelog.server';
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

	if (intent === 'updateChangelogEntry') {
		const changelogId = formData.get('changelogId')?.toString() ?? '';
		const content = formData.get('content')?.toString() ?? '';
		const publishDate = formData.get('publishDate')?.toString() ?? '';

		try {
			await updateChangelogEntry(changelogId, content, new Date(publishDate));
			return json({
				success: true,
				intent,
				message: 'Changelog entry updated',
			});
		} catch (e) {
			return json({
				success: false,
				intent,
				message: 'Error updating changelog entry',
			});
		}
	}

	if (intent === 'createChangelogEntry') {
		const newEntryContent = formData.get('newEntryContent')?.toString() ?? '';
		const newEntryDate = formData.get('newEntryDate')?.toString() ?? '';

		try {
			await createChangelogEntry(newEntryContent, new Date(newEntryDate));
			return json({
				success: true,
				intent,
				message: 'Changelog entry created',
			});
		} catch (e) {
			return json({
				success: false,
				intent,
				message: 'Error creating changelog entry',
			});
		}
	}

	return json({});
};
export default function User() {
	const { changelog } = useLoaderData<typeof loader>();
	const fetcher = useFetcher();
	const [opened, setOpened] = useState<string | null>(null);
	const [newOpened, { open, close }] = useDisclosure(false);

	const rows = changelog.map((ch) => (
		<tr key={ch.id}>
			<td>{dayjs(ch.date).format('MMM DD, YYYY')}</td>
			<td>{ch.image}</td>
			<td>
				<Group>
					<Text
						truncate
						maw={400}
					>
						{ch.content}
					</Text>
					<ActionIcon
						onClick={() => setOpened(ch.id)}
						color={'blue'}
					>
						<IconPencil size={16} />
					</ActionIcon>
					<Modal
						opened={opened === ch.id}
						onClose={() => setOpened(null)}
						title="Edit changelog"
						size="xl"
					>
						<fetcher.Form method={'post'}>
							<input
								type="hidden"
								name={'changelogId'}
								value={ch.id}
							/>
							<DatePicker
								label="Publish Date"
								defaultValue={new Date(ch.date)}
								name={'publishDate'}
								my={12}
							/>
							<Textarea
								defaultValue={ch.content}
								autosize
								minRows={10}
								name={'content'}
							/>

							<Group
								position={'right'}
								my={24}
							>
								<PrimaryButton
									type={'submit'}
									name={'intent'}
									value={'updateChangelogEntry'}
									onClick={() => setOpened(null)}
								>
									Save
								</PrimaryButton>
							</Group>
						</fetcher.Form>
					</Modal>
				</Group>
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
		<>
			<Box my={12}>
				<Group my={24}>
					<SecondaryButton onClick={open}>New changelog entry</SecondaryButton>
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
			<Modal
				opened={newOpened}
				onClose={close}
				title="Create changelog entry"
				size="xl"
			>
				<fetcher.Form method={'post'}>
					<DatePicker
						label="Publish Date"
						name={'newEntryDate'}
						defaultValue={new Date()}
						my={12}
					/>
					<Textarea
						autosize
						minRows={10}
						name={'newEntryContent'}
					/>

					<Group
						position={'right'}
						my={24}
					>
						<PrimaryButton
							type={'submit'}
							name={'intent'}
							value={'createChangelogEntry'}
							onClick={close}
						>
							Save
						</PrimaryButton>
					</Group>
				</fetcher.Form>
			</Modal>
		</>
	);
}
