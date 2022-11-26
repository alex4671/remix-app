import { Button, Center, Stack, Title } from '@mantine/core';
import type { LoaderArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useNavigate } from '@remix-run/react';
import { GenericCatchBoundary } from '~/components/Errors/GenericCatchBoundary';
import { GenericErrorBoundary } from '~/components/Errors/GenericErrorBoundary';
import { requireUser } from '~/server/session.server';

export const meta: MetaFunction = () => {
	return {
		title: 'Pro required',
	};
};

export const loader = async ({ request }: LoaderArgs) => {
	await requireUser(request);

	return json({});
};

export default function RequirePro() {
	const navigate = useNavigate();

	const handleRedirect = () => {
		navigate('/settings/pro');
	};

	return (
		<Center>
			<Stack align={'flex-start'}>
				<Title
					order={2}
					align={'center'}
					mt={48}
				>
					This page only for pro subscribers
				</Title>
				<Button
					color={'emerald'}
					onClick={handleRedirect}
				>
					Go pro!
				</Button>
			</Stack>
		</Center>
	);
}

export {
	GenericCatchBoundary as CatchBoundary,
	GenericErrorBoundary as ErrorBoundary,
};
