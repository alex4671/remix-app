import { Box, Group, Paper, Text, Title } from '@mantine/core';
import type { ActionArgs, LoaderArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Link, Outlet, useLocation } from '@remix-run/react';
import { CreateNewWorkspace } from '~/components/Settings/Workspaces/CreateNewWorkspace';
import { EventType, useSubscription } from '~/hooks/useSubscription';
import {
	createWorkspace,
	getAllowedWorkspaces,
	updateWorkspaceSortOrder,
} from '~/models/workspace.server';
import { emitter } from '~/server/emitter.server';
import { requireUser } from '~/server/session.server';
import { generateKeyBetween } from '~/utils/generateIndex';
import { useUser } from '~/utils/utils';

export const meta: MetaFunction = () => {
	return {
		title: 'Settings | Workspaces',
	};
};

export const loader = async ({ request }: LoaderArgs) => {
	await requireUser(request);

	return json({});
};

export const action = async ({ request }: ActionArgs) => {
	const user = await requireUser(request);

	const formData = await request.formData();
	const intent = formData.get('intent');

	if (intent === 'createWorkspace') {
		try {
			const workspaceName = formData.get('workspaceName')?.toString() ?? '';
			const sessionId = formData.get('sessionId')?.toString() ?? '';

			const workspaces = await getAllowedWorkspaces(user.id);

			const lastSortIndexValue = workspaces
				?.sort((a, b) =>
					a.sortIndex < b.sortIndex ? -1 : a.sortIndex > b.sortIndex ? 1 : 0,
				)
				?.at(-1)?.sortIndex;

			const nextSortIndex = !lastSortIndexValue
				? generateKeyBetween(null, null)
				: generateKeyBetween(lastSortIndexValue, null);

			await createWorkspace(user.id, workspaceName, nextSortIndex);

			emitter.emit(EventType.CREATE_WORKSPACE, [user.id], sessionId);

			return json({
				success: true,
				intent,
				message: `Workspace ${workspaceName} created`,
			});
		} catch (e) {
			return json({
				success: false,
				intent,
				message: 'Error creating workspace',
			});
		}
	}

	if (intent === 'changeSortOrder') {
		const workspaceId = formData.get('workspaceId')?.toString() ?? '';
		const newSortIndex = formData.get('newSortIndex')?.toString() ?? '';
		const sessionId = formData.get('sessionId')?.toString() ?? '';

		try {
			const workspaceToUpdate = await updateWorkspaceSortOrder(
				workspaceId,
				newSortIndex,
			);

			emitter.emit(
				EventType.REORDER_WORKSPACE,
				[workspaceToUpdate.ownerId],
				sessionId,
			);

			return json({ success: true, intent, message: `Sort order updated` });
		} catch (e) {
			return json({ success: false, intent, message: 'Error updating order' });
		}
	}

	return json({ success: false, intent, message: 'Some error' });
};

export default function Workspaces() {
	const user = useUser();
	const location = useLocation();

	useSubscription(`/api/subscriptions/workspaces/${user.id}`, [
		EventType.CREATE_WORKSPACE,
		EventType.DELETE_WORKSPACE,
		EventType.INVITE_MEMBER,
		EventType.REMOVE_ACCESS,
		EventType.REORDER_WORKSPACE,
		EventType.UPDATE_NAME_WORKSPACE,
		EventType.UPDATE_RIGHTS,
	]);

	return (
		<>
			<Paper
				shadow="0"
				p="md"
				withBorder
				mb={24}
			>
				<Title order={2}>Manage workspaces</Title>
				<Text
					mt={6}
					mb={12}
				>
					Manage your workspaces and invite members
				</Text>
				<CreateNewWorkspace />
			</Paper>
			<Paper
				shadow="0"
				p="md"
				withBorder
				mb={24}
			>
				<Group spacing={0}>
					<Box
						component={Link}
						to="./my"
						sx={(theme) => ({
							display: 'block',
							lineHeight: 1,
							padding: '8px 16px',
							textDecoration: 'none',
							color:
								theme.colorScheme === 'dark'
									? theme.white
									: theme.colors.dark[5],
							backgroundColor: location.pathname.includes('/my')
								? theme.colorScheme === 'dark'
									? theme.colors.dark[4]
									: theme.colors.gray[1]
								: 'inherit',
							fontSize: theme.fontSizes.lg,
							fontWeight: 500,

							'&:hover': {
								backgroundColor: location.pathname.includes('/my')
									? theme.colorScheme === 'dark'
										? theme.colors.dark[4]
										: theme.colors.gray[1]
									: theme.colorScheme === 'dark'
									? theme.colors.dark[6]
									: theme.colors.gray[0],
							},
						})}
					>
						My Workspaces
					</Box>
					<Box
						component={Link}
						to="./collaborated"
						sx={(theme) => ({
							display: 'block',
							lineHeight: 1,
							padding: '8px 16px',
							textDecoration: 'none',
							color:
								theme.colorScheme === 'dark'
									? theme.white
									: theme.colors.dark[5],
							backgroundColor: location.pathname.includes('/collaborated')
								? theme.colorScheme === 'dark'
									? theme.colors.dark[4]
									: theme.colors.gray[1]
								: 'inherit',
							fontSize: theme.fontSizes.lg,
							fontWeight: 500,

							'&:hover': {
								backgroundColor: location.pathname.includes('/collaborated')
									? theme.colorScheme === 'dark'
										? theme.colors.dark[4]
										: theme.colors.gray[1]
									: theme.colorScheme === 'dark'
									? theme.colors.dark[6]
									: theme.colors.gray[0],
							},
						})}
					>
						Collaborated
					</Box>
				</Group>
				<Outlet />
			</Paper>
		</>
	);
}
