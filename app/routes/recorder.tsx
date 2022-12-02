import type { ActionArgs, MetaFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Outlet } from '@remix-run/react';
import invariant from 'tiny-invariant';
import { GenericCatchBoundary } from '~/components/Errors/GenericCatchBoundary';
import { GenericErrorBoundary } from '~/components/Errors/GenericErrorBoundary';
import { deleteFile, saveFile, togglePublic } from '~/models/media.server';
import { deleteFileFromS3, generateSignedUrl } from '~/models/storage.server';
import { requireUser } from '~/server/session.server';
import { getFileKey } from '~/utils/utils';

export const meta: MetaFunction = () => {
	return {
		title: 'Recorder',
	};
};

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

			const record = await saveFile({
				userId: user.id,
				fileUrl,
				name: file.name,
				size: file.size,
				type: file.type,
			});

			return redirect(`./${record.id}`);
		} catch (e) {
			console.log('e', e);
			return json({
				success: false,
				intent,
				message: 'Error uploading record',
			});
		}
	}

	if (intent === 'deleteRecord') {
		const recordId = formData.get('recordId')?.toString() ?? '';

		try {
			const file = await deleteFile(recordId);

			await deleteFileFromS3(getFileKey(file.fileUrl));

			return json({ success: true, intent, message: 'Record deleted' });
		} catch (e) {
			console.log('e', e);
			return json({
				success: false,
				intent,
				message: 'Error uploading record',
			});
		}
	}

	if (intent === 'togglePublic') {
		const checked = formData.get('checked')?.toString() ?? '';
		const recordingId = formData.get('recordingId')?.toString() ?? '';

		try {
			await togglePublic(recordingId, checked === 'true');

			return json({
				success: true,
				intent,
				message: `Recording now ${checked === 'true' ? 'public' : 'private'}`,
			});
		} catch (e) {
			return json({
				success: false,
				intent,
				message: `Error making recording ${checked ? 'Public' : 'Private'}`,
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
