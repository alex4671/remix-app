import { ActionIcon, Box, Button, Group, Text, Title } from '@mantine/core';
import type { ActionArgs, LoaderArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useFetcher, useLoaderData } from '@remix-run/react';
import { IconX } from '@tabler/icons-react';
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
	const getActive = await notifierQueue.getDelayed();
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
	return json({ active, getActive, delayed, waiting, wait, repeat, counts });
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
					delay: 3000,
					// repeat: {
					// 	every: 5000,
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

	if (intent === 'removeJob') {
		const jobId = formData.get('jobId')?.toString() ?? '';
		const repeatJobKey = formData.get('repeatJobKey')?.toString() ?? '';
		try {
			if (jobId.includes('repeat')) {
				await notifierQueue.removeRepeatableByKey(repeatJobKey);
			} else {
				await notifierQueue.remove(jobId);
			}

			return json({
				success: true,
				intent,
				message: 'Job removed',
			});
		} catch (e) {
			return json({ success: false, intent, message: 'Error removing job' });
		}
	}

	return json({ success: false, intent });
};

export default function Scheduler() {
	const { active, delayed, waiting, wait, repeat, counts, getActive } =
		useLoaderData<typeof loader>();

	const fetcher = useFetcher();

	// useSubscription(`/api/subscriptions/notifier`, [EventType.NOTIFIER]);

	console.log('active', active);
	console.log('delayed', delayed);
	console.log('waiting', waiting);
	console.log('wait', wait);
	console.log('repeat', repeat);
	console.log('counts', counts);
	console.log('getActive', getActive);

	return (
		<>
			<Box p={'lg'}>
				<Group spacing={6}>
					<Title order={2}>Scheduler</Title>
				</Group>
				<Text color={'dimmed'}>Testing task scheduler</Text>
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
				<Box py={12}>
					{getActive?.map((active) => (
						<Group
							key={active.id}
							my={'sm'}
						>
							<Text>
								{active.id} - {active.name}
							</Text>
							<fetcher.Form method={'post'}>
								<input
									type="hidden"
									name={'jobId'}
									value={active.id}
								/>
								<input
									type="hidden"
									name={'repeatJobKey'}
									value={active.repeatJobKey}
								/>
								<ActionIcon
									color="red"
									variant="light"
									type={'submit'}
									name={'intent'}
									value={'removeJob'}
								>
									<IconX size={14} />
								</ActionIcon>
							</fetcher.Form>
						</Group>
					))}
				</Box>
			</Box>
		</>
	);
}
