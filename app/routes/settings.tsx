import { Grid, Title } from '@mantine/core';
import { render } from '@react-email/render';
import type { ActionArgs, LoaderArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Outlet } from '@remix-run/react';
import { GenericCatchBoundary } from '~/components/Errors/GenericCatchBoundary';
import { GenericErrorBoundary } from '~/components/Errors/GenericErrorBoundary';
import { Feedback } from '~/components/Settings/Feedback';
import { SettingsLinks } from '~/components/Settings/SettingsLinks';
import FeedbackEmail from '~/emails/FeedbackEmail';
import { saveFeedback } from '~/models/feedback.server';
import { postmarkClient } from '~/server/postmark.server';
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
	const type = formData.get('type')?.toString() ?? '';

	if (feedback.length) {
		try {
			await saveFeedback(user.id, user.email, feedback, type);

			const emailHtml = render(
				<FeedbackEmail
					userEmail={user.email}
					feedback={feedback}
					type={type}
				/>,
			);

			const options = {
				From: 'hi@alexkulchenko.com',
				To: 'al.kulchenko@gmail.com',
				Subject: 'Feedback from user',
				HtmlBody: emailHtml,
				Headers: [
					{
						// Set this to prevent Gmail from threading emails.
						// See https://stackoverflow.com/questions/23434110/force-emails-not-to-be-grouped-into-conversations/25435722.
						Name: 'X-Entity-Ref-ID',
						Value: new Date().getTime() + '',
					},
				],
			};

			await postmarkClient.sendEmail(options);

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
