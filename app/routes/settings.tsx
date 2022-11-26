import { Grid, Title } from '@mantine/core';
import type { ActionArgs, LoaderArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Outlet } from '@remix-run/react';
import { GenericCatchBoundary } from '~/components/Errors/GenericCatchBoundary';
import { GenericErrorBoundary } from '~/components/Errors/GenericErrorBoundary';
import { Feedback } from '~/components/Settings/Feedback';
import { SettingsLinks } from '~/components/Settings/SettingsLinks';
import { saveFeedback } from '~/models/feedback.server';
import { requireUser } from '~/server/session.server';

export const meta: MetaFunction = () => {
	return {
		title: 'Settings',
	};
};

export async function loader({ request }: LoaderArgs) {
	await requireUser(request);
	return json({});
}

export const action = async ({ request }: ActionArgs) => {
	const user = await requireUser(request);
	const formData = await request.formData();
	const feedback = formData.get('feedback')?.toString() ?? '';

	if (feedback.length) {
		try {
			await saveFeedback(user.id, user.email, feedback);
			return json({
				success: true,
				intent: 'sendFeedback',
				message: 'Feedback send',
			});
		} catch (e) {
			return json({
				success: false,
				intent: 'sendFeedback',
				message: 'Error sending feedback',
			});
		}
	} else {
		return json({
			success: false,
			intent: 'sendFeedback',
			message: "Feedback can't be empty",
		});
	}
};

export default function Settings() {
	return (
		<>
			<Title
				order={1}
				my={24}
			>
				Settings
			</Title>
			<Grid>
				<Grid.Col
					xs={12}
					sm={2}
				>
					<SettingsLinks />
				</Grid.Col>
				<Grid.Col
					xs={12}
					sm={10}
				>
					<Outlet />
				</Grid.Col>
			</Grid>
			<Feedback />
		</>
	);
}

export {
	GenericCatchBoundary as CatchBoundary,
	GenericErrorBoundary as ErrorBoundary,
};
