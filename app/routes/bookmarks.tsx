import type { ActionArgs, LoaderArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Outlet } from '@remix-run/react';
import { GenericCatchBoundary } from '~/components/Errors/GenericCatchBoundary';
import { GenericErrorBoundary } from '~/components/Errors/GenericErrorBoundary';
import { createBookmark, deleteBookmark } from '~/models/bookmarks.server';
import { requireUser } from '~/server/session.server';
import { getArticle, isValidHttpUrl } from '~/utils/parser.server';

export const meta: MetaFunction = () => {
	return {
		title: 'Bookmarks',
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

	if (intent === 'createBookmark') {
		const bookmarkUrl = formData.get('bookmarkUrl')?.toString() ?? '';

		if (!isValidHttpUrl(bookmarkUrl)) {
			return json({
				success: false,
				intent,
				message: 'It is not correct URL',
			});
		}

		try {
			const article = await getArticle(bookmarkUrl);

			await createBookmark(user.id, bookmarkUrl, article?.title);
			return json({ success: true, intent, message: 'Bookmark created' });
		} catch (e) {
			return json({
				success: false,
				intent,
				message: 'Error creating bookmark',
			});
		}
	}
	if (intent === 'deleteBookmark') {
		const bookmarkId = formData.get('bookmarkId')?.toString() ?? '';

		try {
			await deleteBookmark(bookmarkId);
			return json({ success: true, intent, message: 'Bookmark deleted' });
		} catch (e) {
			return json({
				success: false,
				intent,
				message: 'Error deleting bookmark',
			});
		}
	}

	return json({ success: false, intent: null, message: 'Some error' });
};

export default function Bookmarks() {
	return <Outlet />;
}

export {
	GenericCatchBoundary as CatchBoundary,
	GenericErrorBoundary as ErrorBoundary,
};
