import { Box, Group, Paper, Text, Title } from '@mantine/core';
import type { ActionArgs, LoaderArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import dayjs from 'dayjs';
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
					<Box my={12}>Box</Box>
					<Box py={12}>
						{users?.map((user) => (
							<Box key={user.id}>
								{user.email} {user.payment ? 'Pro' : 'Free'}{' '}
								{dayjs(user.createdAt).format('DD/MM/YYYY')}
							</Box>
						))}
					</Box>
				</Box>
			</Paper>
		</>
	);
}
