import { render } from '@react-email/render';
import type { ActionArgs, LoaderArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { AvatarUpload } from '~/components/Settings/Account/AvatarUpload';
import { ChangePassword } from '~/components/Settings/Account/ChangePassword';
import { UserInfo } from '~/components/Settings/Account/UserInfo';
import WelcomeEmail from '~/emails/WelcomeEmail';
import { deleteFileFromS3, generateSignedUrl } from '~/models/storage.server';
import {
	deleteAvatar,
	generateInviteLink,
	updateAvatar,
	updatePassword,
	verifyLogin,
} from '~/models/user.server';
import { postmarkClient } from '~/server/postmark.server';
import { requireUser } from '~/server/session.server';
import { getFileKey } from '~/utils/utils';

export const meta: MetaFunction = () => {
	return {
		title: 'Settings | Account',
	};
};

export async function loader({ request }: LoaderArgs) {
	const user = await requireUser(request);
	return json({ user });
}

export const action = async ({ request }: ActionArgs) => {
	const user = await requireUser(request);
	const { CLOUDFLARE_PUBLIC_FILE_URL } = process.env;

	const formData = await request.formData();
	const intent = formData.get('intent');

	if (intent === 'uploadAvatar') {
		const file = formData.get('file') as File;

		const key = `${user.id}/avatar/${Date.now()}--${file.name}`;

		try {
			const signedUrl = await generateSignedUrl(file.type, key);
			await fetch(signedUrl, { method: 'PUT', body: file });
			const avatarUrl = `${CLOUDFLARE_PUBLIC_FILE_URL}/${key}`;

			if (user.avatarUrl) {
				await deleteFileFromS3(getFileKey(user.avatarUrl));
			}

			await updateAvatar(user.id, avatarUrl);

			return json({ success: true, intent, message: 'Avatar uploaded' });
		} catch (e) {
			return json({
				success: false,
				intent,
				message: 'Error uploading avatar',
			});
		}
	}

	if (intent === 'deleteAvatar') {
		try {
			await deleteAvatar(user.id);

			if (user.avatarUrl) {
				await deleteFileFromS3(getFileKey(user.avatarUrl));
			}

			return json({ success: true, intent, message: 'Avatar deleted' });
		} catch (e) {
			return json({ success: false, intent, message: 'Error deleting avatar' });
		}
	}

	if (intent === 'changePassword') {
		try {
			const password = formData.get('password')?.toString() ?? '';
			const newPassword = formData.get('newPassword')?.toString() ?? '';

			// invariant(email, "Email must be set")
			// invariant(password, "Password must be set")
			// invariant(newPassword, "New password must be set")

			if (!password || !newPassword) {
				return json({
					intent,
					success: false,
					message: 'Password and new password must be set',
				});
			}

			if (password === newPassword) {
				return json({
					intent,
					success: false,
					message: "Old and new password can't be same",
				});
			}

			if (password?.length < 8) {
				return json({
					intent,
					success: false,
					message: 'Password is to short',
				});
			}

			const isValid = await verifyLogin(user.email, String(password));

			if (!isValid) {
				return json({ intent, success: false, message: 'Wrong old password' });
			}

			await updatePassword(user.email, String(password), String(newPassword));

			return json({ intent, success: true, message: 'Password updated' });
		} catch (e) {
			return json({
				success: false,
				intent,
				message: 'Error updating password',
			});
		}
	}

	if (intent === 'sendInvite') {
		try {
			const inviteLink = await generateInviteLink(request.url, user.id);

			console.log('inviteLink', inviteLink);

			const emailHtml = render(<WelcomeEmail url={inviteLink} />);

			const options = {
				From: 'hi@alexkulchenko.com',
				To: user.email,
				Subject: 'Activate your account',
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

			// await postmarkClient.sendEmailWithTemplate({
			// 	From: 'hi@alexkulchenko.com',
			// 	// To: user.email,
			// 	To: 'hi@alexkulchenko.com',
			// 	TemplateAlias: 'welcome',
			// 	TemplateModel: {
			// 		product_url: 'https://files.alexkulchenko.com/',
			// 		product_name: 'Files App',
			// 		name: user.email,
			// 		action_url: inviteLink,
			// 	},
			// 	Headers: [
			// 		{
			// 			// Set this to prevent Gmail from threading emails.
			// 			// See https://stackoverflow.com/questions/23434110/force-emails-not-to-be-grouped-into-conversations/25435722.
			// 			Name: 'X-Entity-Ref-ID',
			// 			Value: new Date().getTime() + '',
			// 		},
			// 	],
			// });

			return json({ success: true, intent, message: 'Invite sent' });
		} catch (e) {
			console.log('error', e);
			return json({ success: false, intent, message: 'Error sending invite' });
		}
	}

	return json({ success: false, intent, message: 'Some error' });
};

export default function Account() {
	const { user } = useLoaderData<typeof loader>();

	return (
		<>
			<UserInfo
				email={user.email}
				isConfirmed={user.isConfirmed}
			/>
			<AvatarUpload />
			<ChangePassword />
		</>
	);
}
