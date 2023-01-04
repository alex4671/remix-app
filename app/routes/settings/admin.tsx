import { Box, Group, Paper, Text, Title } from '@mantine/core';
import type { ActionArgs, LoaderArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { requireUser } from '~/server/session.server';

export const meta: MetaFunction = () => {
	return {
		title: 'Settings | Admin',
	};
};

export const loader = async ({ request }: LoaderArgs) => {
	const user = await requireUser(request);

	return json({});
};

export const action = async ({ request }: ActionArgs) => {
	const formData = await request.formData();
	const intent = formData.get('intent');

	return json({ success: false, intent });
};

export default function Admin() {
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
					<Box py={12}>Box</Box>
				</Box>
			</Paper>
		</>
	);
}
