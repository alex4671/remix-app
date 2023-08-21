import { Box, Group, Paper } from '@mantine/core';
import type { LoaderArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Outlet, useLoaderData, useNavigate } from '@remix-run/react';
import { IconChevronLeft } from '@tabler/icons-react';
import { SecondaryButton } from '~/components/Buttons/SecondaryButton';
import { TabLink } from '~/components/Settings/TabLink';
import { prisma } from '~/server/db.server';
import { requireUser } from '~/server/session.server';

export const loader = async ({ request, params }: LoaderArgs) => {
	await requireUser(request);
	const userId = params.userId;
	const user = await prisma.user.findUnique({
		where: {
			id: userId,
		},
	});

	if (!user) {
		return redirect('./'); // todo ???
	}

	return json({ user });
};

export default function User() {
	const { user } = useLoaderData<typeof loader>();
	const navigate = useNavigate();

	const handleGoBack = () => {
		navigate('/settings/admin');
	};

	return (
		<Paper
			shadow="0"
			withBorder
			mb={12}
			p="md"
		>
			<Group>
				<SecondaryButton
					onClick={handleGoBack}
					leftIcon={<IconChevronLeft size={14} />}
					compact
				>
					Go back
				</SecondaryButton>
			</Group>
			<Box my={12}>
				{user.email}
				User card with all information and usage
			</Box>
			<Group>
				<TabLink
					to={'/payment'}
					title={'Payment'}
				/>
				<TabLink
					to={'/other'}
					title={'Other staff'}
					disabled
				/>
			</Group>
			<Outlet />
		</Paper>
	);
}
