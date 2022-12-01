import type { ActionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Outlet } from '@remix-run/react';
import invariant from 'tiny-invariant';
import { GenericCatchBoundary } from '~/components/Errors/GenericCatchBoundary';
import { GenericErrorBoundary } from '~/components/Errors/GenericErrorBoundary';
import { saveFile } from '~/models/media.server';
import { generateSignedUrl } from '~/models/storage.server';
import { requireUser } from '~/server/session.server';

export const action = async ({ request }: ActionArgs) => {
	const user = await requireUser(request);
	const formData = await request.formData();

	const intent = formData.get('intent')?.toString() ?? '';

	if (intent === 'uploadRecording') {
		const { CLOUDFLARE_PUBLIC_FILE_URL } = process.env;

		invariant(
			CLOUDFLARE_PUBLIC_FILE_URL,
			'CLOUDFLARE_PUBLIC_FILE_URL must be set',
		);

		const file = formData.get('file') as File;

		const key = `${user.id}/records/${Date.now()}--${file.name}`;

		try {
			const signedUrl = await generateSignedUrl(file.type, key);
			await fetch(signedUrl, { method: 'PUT', body: file });
			const fileUrl = `${CLOUDFLARE_PUBLIC_FILE_URL}/${key}`;

			await saveFile({
				userId: user.id,
				fileUrl,
				name: file.name,
				size: file.size,
				type: file.type,
			});

			return json({ success: true, intent, message: 'Record uploaded' });
		} catch (e) {
			console.log('e', e);
			return json({
				success: false,
				intent,
				message: 'Error uploading record',
			});
		}
	}

	return json({ success: false, intent: null, message: 'Some error' });
};

export default function Recorder() {
	return <Outlet />;
}

export {
	GenericCatchBoundary as CatchBoundary,
	GenericErrorBoundary as ErrorBoundary,
};
