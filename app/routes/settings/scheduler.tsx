import { Box, Button, Group, Paper, Text, Title } from '@mantine/core';
import type { ActionArgs, LoaderArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useFetcher, useLoaderData } from '@remix-run/react';
import { notifierQueue } from '~/queues/notifier.server';
import { requireUser } from '~/server/session.server';

export const meta: MetaFunction = () => {
	return {
		title: 'Settings | Scheduler',
	};
};

export const loader = async ({ request }: LoaderArgs) => {
	const user = await requireUser(request);
	const active = await notifierQueue.getJobs(['active']);
	const delayed = await notifierQueue.getJobs(['delayed']);
	const waiting = await notifierQueue.getJobs(['waiting']);
	const wait = await notifierQueue.getJobs(['wait']);
	const repeat = await notifierQueue.getJobs(['repeat']);
	const counts = await notifierQueue.getJobCounts(
		'active',
		'delayed',
		'waiting',
		'wait',
		'completed',
		'repeat',
		'failed',
		'paused',
	);
	return json({ active, delayed, waiting, wait, repeat, counts });
};

export const action = async ({ request }: ActionArgs) => {
	const formData = await request.formData();
	const intent = formData.get('intent');

	if (intent === 'addJob') {
		try {
			// await queue.removeRepeatableByKey('notification email::::2000');
			await notifierQueue.add(
				'notification email',
				{
					emailAddress: 'email',
				},
				{
					delay: 60000,
					// repeat: {
					// 	every: 3000,
					// 	limit: 10,
					// },
				},
			);
			return json({
				success: true,
				intent,
				message: 'Job added',
			});
		} catch (e) {
			return json({ success: false, intent, message: 'Error adding job' });
		}
	}

	return json({ success: false, intent });
};

export default function Scheduler() {
	const { active, delayed, waiting, wait, repeat, counts } =
		useLoaderData<typeof loader>();
	const fetcher = useFetcher();
	console.log('active', active);
	console.log('delayed', delayed);
	console.log('waiting', waiting);
	console.log('wait', wait);
	console.log('repeat', repeat);
	console.log('counts', counts);

	return (
		<>
			<Paper
				shadow="0"
				withBorder
				mb={12}
			>
				<Box p={'lg'}>
					<Group spacing={6}>
						<Title order={2}>Title</Title>
					</Group>
					<Text color={'dimmed'}>Subtitle</Text>
					<Box my={12}>
						<fetcher.Form method={'post'}>
							<Button
								type={'submit'}
								name={'intent'}
								value={'addJob'}
							>
								Add job
							</Button>
						</fetcher.Form>
					</Box>
					<Box py={12}>Box</Box>
				</Box>
			</Paper>
		</>
	);
}
