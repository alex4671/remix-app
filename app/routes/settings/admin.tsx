import { Anchor, Box, Group, Paper, Table, Text, Title } from '@mantine/core';
import type { ActionArgs, LoaderArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Link, Outlet, useLoaderData } from '@remix-run/react';
import dayjs from 'dayjs';
import { TabLink } from '~/components/Settings/TabLink';
import { prisma } from '~/server/db.server';
import { requireUser } from '~/server/session.server';

export const meta: MetaFunction = () => {
	return {
		title: 'Settings | Admin',
	};
};

export const loader = async ({ request }: LoaderArgs) => {
	const user = await requireUser(request);

	const users = await prisma.user.findMany({ include: { payment: true } });

	return json({ users });
};

export const action = async ({ request }: ActionArgs) => {
	const formData = await request.formData();
	const intent = formData.get('intent');

	return json({ success: false, intent });
};

export default function Admin() {
	const { users } = useLoaderData<typeof loader>();

	console.log('users', users);

	const rows = users.map((user) => (
		<tr key={user.id}>
			<td>
				<Anchor
					component={Link}
					to={`./${user.id}`}
				>
					{user.email}
				</Anchor>
			</td>
			<td>{dayjs(user.createdAt).format('DD/MM/YYYY')}</td>
			<td>{user.payment ? 'Pro' : 'Basic'}</td>
		</tr>
	));

	return (
		<>
			<Paper
				shadow="0"
				withBorder
				mb={12}
			>
				<Box p={'lg'}>
					<Group spacing={6}>
						<Title order={2}>Admin area</Title>
					</Group>
					<Text color={'dimmed'}>Manage app settings</Text>
				</Box>
			</Paper>

			<Paper
				shadow="0"
				withBorder
				mb={12}
			>
				<Box p={'lg'}>
					<Group spacing={6}>
						<Title order={2}>App</Title>
					</Group>
					<Text color={'dimmed'}>App settings</Text>

					<Box py={12}>
						<Group>
							<TabLink
								to={'/feedback'}
								title={'Feedback'}
							/>
							<TabLink
								to={'/changelog'}
								title={'Changelog'}
							/>
							<TabLink
								to={'/scheduler'}
								title={'Scheduler'}
							/>
						</Group>
						<Outlet />
					</Box>
				</Box>
			</Paper>

			<Paper
				shadow="0"
				withBorder
				mb={12}
			>
				<Box p={'lg'}>
					<Group spacing={6}>
						<Title order={2}>Users</Title>
					</Group>
					<Text color={'dimmed'}>List of all users</Text>

					<Box py={12}>
						<Table>
							<thead>
								<tr>
									<th>User</th>
									<th>Created</th>
									<th>Subscription</th>
								</tr>
							</thead>
							<tbody>{rows}</tbody>
						</Table>
					</Box>
				</Box>
			</Paper>
		</>
	);
}
