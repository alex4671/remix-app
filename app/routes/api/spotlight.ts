import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { getAllUserNotes } from '~/models/notes.server';
import { getAllowedWorkspaces } from '~/models/workspace.server';
import { requireUser } from '~/server/session.server';

export const loader = async ({ request, params }: LoaderArgs) => {
	const user = await requireUser(request);
	const url = new URL(request.url);

	const searchType = url.searchParams.get('search');

	switch (searchType) {
		case 'notes':
			const notes = await getAllUserNotes(user.id);
			return json({ search: 'notes', data: notes });

		case 'workspaces':
			const workspaces = await getAllowedWorkspaces(user.id);
			return json({ search: 'workspaces', data: workspaces });
	}

	return json({});
};
