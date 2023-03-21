import { ActionIcon, Box, Paper, Table, Text, Title } from '@mantine/core';
import type { ActionArgs, LoaderArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useFetcher, useLoaderData } from '@remix-run/react';
import { IconTrash } from '@tabler/icons';
import dayjs from 'dayjs';
import { HiddenSessionId } from '~/components/Utils/HiddenSessionId';
import {
	deleteSecurityLogEntry,
	getUserSecurityLog,
} from '~/models/security.server';
import { logout, requireUser, requireUserId } from '~/server/session.server';

export const meta: MetaFunction = () => {
	return {
		title: 'Settings | Security log',
	};
};

export const loader = async ({ request }: LoaderArgs) => {
	const user = await requireUser(request);
	const userSecurityLog = await getUserSecurityLog(user.id);

	return json({
		userSecurityLog,
	});
};

export const action = async ({ request }: ActionArgs) => {
	await requireUserId(request);

	const formData = await request.formData();
	const intent = formData.get('intent');

	if (intent === 'deleteLogEntry') {
		const logId = formData.get('logId')?.toString() ?? '';

		try {
			await deleteSecurityLogEntry(logId);
			return json({ success: true, intent, message: 'Log entry deleted' });
		} catch (e) {
			return json({
				success: false,
				intent,
				message: 'Error deleting log entry',
			});
		}
	}

	return logout(request);
};

export default function SecurityLog() {
	const { userSecurityLog } = useLoaderData<typeof loader>();
	const fetcher = useFetcher();

	const rows = userSecurityLog.map((log) => (
		<tr key={log.id}>
			<td>{log.user.email}</td>
			<td>{log.action}</td>
			<td>{log.ipAddress}</td>
			<td>{dayjs(log.createdAt).format('YY-MM-DD H:mm:ss')}</td>
			<td>
				<fetcher.Form method={'post'}>
					<input
						type="hidden"
						name={'logId'}
						value={log.id}
					/>
					<HiddenSessionId />
					<ActionIcon
						type={'submit'}
						name={'intent'}
						value={'deleteLogEntry'}
						color={'red'}
					>
						<IconTrash size={16} />
					</ActionIcon>
				</fetcher.Form>
			</td>
		</tr>
	));

	return (
		<Paper
			shadow="0"
			withBorder
			mb={12}
		>
			<Box p={'lg'}>
				<Title order={2}>Security log</Title>
				<Text color={'dimmed'}>
					Recent authentication and other security-related activity for your
					account.
				</Text>
				<Box my={12}>
					<Table withBorder>
						<thead>
							<tr>
								<th>Actor</th>
								<th>Action</th>
								<th>IP address</th>
								<th>Date</th>
								<th>Delete</th>
							</tr>
						</thead>
						<tbody>{rows}</tbody>
					</Table>
				</Box>
			</Box>
		</Paper>
	);
}
