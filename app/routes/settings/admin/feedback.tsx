import { ActionIcon, Box, ScrollArea, Table, Title } from '@mantine/core';
import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useFetcher, useLoaderData } from '@remix-run/react';
import { IconTrash } from '@tabler/icons';
import dayjs from 'dayjs';
import { HiddenSessionId } from '~/components/Utils/HiddenSessionId';
import { deleteFeedbackEntry, getFeedback } from '~/models/feedback.server';
import { requireUser, requireUserId } from '~/server/session.server';

export const loader = async ({ request, params }: LoaderArgs) => {
	const user = await requireUser(request);

	const feedback = await getFeedback();

	return json({ user, feedback });
};

export const action = async ({ request }: ActionArgs) => {
	await requireUserId(request);

	const formData = await request.formData();
	const intent = formData.get('intent');

	if (intent === 'deleteFeedbackEntry') {
		const feedbackId = formData.get('feedbackId')?.toString() ?? '';

		try {
			await deleteFeedbackEntry(feedbackId);
			return json({ success: true, intent, message: 'Feedback entry deleted' });
		} catch (e) {
			return json({
				success: false,
				intent,
				message: 'Error deleting feedback entry',
			});
		}
	}

	return json({});
};

export default function User() {
	const { user, feedback } = useLoaderData<typeof loader>();
	const fetcher = useFetcher();

	console.log('feedback', feedback);

	const rows = feedback.map((fb) => (
		<tr key={fb.id}>
			<td>{fb.userEmail}</td>
			<td>{fb.type}</td>
			<td>{fb.feedback}</td> {/* todo add truncate and modal */}
			<td>{dayjs(fb.createdAt).format('YY-MM-DD H:mm:ss')}</td>
			<td>
				<fetcher.Form method={'post'}>
					<input
						type="hidden"
						name={'feedbackId'}
						value={fb.id}
					/>
					<HiddenSessionId />
					<ActionIcon
						type={'submit'}
						name={'intent'}
						value={'deleteFeedbackEntry'}
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
			{feedback.length ? (
				<ScrollArea>
					<Table
						withBorder
						sx={{ minWidth: 576 }}
					>
						<thead>
							<tr>
								<th>User</th>
								<th>Type</th>
								<th>Feedback</th>
								<th>Date</th>
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
					Currently no log data
				</Title>
			)}
		</Box>
	);
}
