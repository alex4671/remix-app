import { Box, Title } from '@mantine/core';
import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { WorkspaceItem } from '~/components/Settings/Workspaces/WorkspaceItem';
import { getUserCollaboratorWorkspacesById } from '~/models/workspace.server';
import { requireUser } from '~/server/session.server';

export const loader = async ({ request }: LoaderArgs) => {
	const user = await requireUser(request);
	const collaborators = await getUserCollaboratorWorkspacesById(user.id);

	return json({ collaborators });
};

export default function CollaboratedWorkspaces() {
	const { collaborators } = useLoaderData<typeof loader>();

	return (
		<Box>
			{collaborators.length ? (
				collaborators.map((c) => (
					<WorkspaceItem
						key={c.id}
						workspace={c}
					/>
				))
			) : (
				<Title
					order={5}
					align={'center'}
					my={24}
				>
					You currently not invited in any workspace
				</Title>
			)}
		</Box>
	);
}
