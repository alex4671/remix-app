import { Box } from '@mantine/core';
import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData, useNavigate } from '@remix-run/react';
import { requireUser } from '~/server/session.server';

export const loader = async ({ request, params }: LoaderArgs) => {
	const user = await requireUser(request);

	return json({ user });
};

export default function User() {
	const { user } = useLoaderData<typeof loader>();
	const navigate = useNavigate();

	const handleGoBack = () => {
		navigate('/settings/admin');
	};

	return <Box my={12}>App changelog</Box>;
}
