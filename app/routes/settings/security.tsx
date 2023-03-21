import { Box, Paper, Table, Text, Title } from '@mantine/core';
import type { LoaderArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import dayjs from 'dayjs';
import { getUserSecurityLog } from '~/models/security.server';
import { requireUser } from '~/server/session.server';

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

export default function SecurityLog() {
	const { userSecurityLog } = useLoaderData<typeof loader>();

	console.log('userSecurityLog', userSecurityLog);

	const rows = userSecurityLog.map((log) => (
		<tr key={log.id}>
			<td>{log.user.email}</td>
			<td>{log.action}</td>
			<td>{log.ipAddress}</td>
			<td>{dayjs(log.createdAt).format('YY-MM-DD H:mm:ss')}</td>
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
							</tr>
						</thead>
						<tbody>{rows}</tbody>
					</Table>
				</Box>
			</Box>
		</Paper>
	);
}
