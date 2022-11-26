import { Center, Title } from '@mantine/core';
import type { LoaderArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { GenericCatchBoundary } from '~/components/Errors/GenericCatchBoundary';
import { GenericErrorBoundary } from '~/components/Errors/GenericErrorBoundary';
import { requireProUser } from '~/server/session.server';

export const meta: MetaFunction = () => {
	return {
		title: 'Pro',
	};
};

export const loader = async ({ request }: LoaderArgs) => {
	await requireProUser(request);

	return json({});
};
export default function Pro() {
	return (
		<Center>
			<Title
				order={2}
				align={'center'}
				mt={48}
			>
				Route for pro
			</Title>
		</Center>
	);
}

export {
	GenericCatchBoundary as CatchBoundary,
	GenericErrorBoundary as ErrorBoundary,
};
