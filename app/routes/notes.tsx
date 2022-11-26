import type { ActionArgs, LoaderArgs, MetaFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Outlet } from '@remix-run/react';
import { GenericCatchBoundary } from '~/components/Errors/GenericCatchBoundary';
import { GenericErrorBoundary } from '~/components/Errors/GenericErrorBoundary';
import { createNote, deleteNote, updateNote } from '~/models/notes.server';
import { requireUser } from '~/server/session.server';

export const meta: MetaFunction = () => {
	return {
		title: 'Notes',
	};
};

export const loader = async ({ request }: LoaderArgs) => {
	await requireUser(request);

	return json({});
};

export const action = async ({ request }: ActionArgs) => {
	const user = await requireUser(request);
	const formData = await request.formData();

	const intent = formData.get('intent')?.toString() ?? '';

	if (intent === 'createNote') {
		const note = formData.get('note')?.toString() ?? '';
		const image = formData.get('image')?.toString() ?? '';

		try {
			await createNote(user.id, note, image);
			return redirect('/notes');
		} catch (e) {
			return json({ success: false, intent, message: 'Error creating note' });
		}
	}
	if (intent === 'updateNote') {
		const noteId = formData.get('noteId')?.toString() ?? '';
		const note = formData.get('note')?.toString() ?? '';

		try {
			await updateNote(noteId, note);
			return json({ success: true, intent, message: 'Note updated' });
		} catch (e) {
			return json({ success: false, intent, message: 'Error updating note' });
		}
	}

	if (intent === 'deleteNote') {
		const noteId = formData.get('noteId')?.toString() ?? '';

		try {
			await deleteNote(noteId);
			return redirect('/notes');
		} catch (e) {
			return json({ success: false, intent, message: 'Error deleting note' });
		}
	}

	return json({ success: false, intent: null, message: 'Some error' });
};

export default function Notes() {
	return <Outlet />;
}

export {
	GenericCatchBoundary as CatchBoundary,
	GenericErrorBoundary as ErrorBoundary,
};
