import {
	Box,
	Grid,
	Group,
	SimpleGrid,
	Switch,
	TextInput,
	Title,
} from '@mantine/core';
import { useInputState } from '@mantine/hooks';
import type { LoaderArgs, SerializeFrom } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { GenericCatchBoundary } from '~/components/Errors/GenericCatchBoundary';
import { GenericErrorBoundary } from '~/components/Errors/GenericErrorBoundary';
import { CreateNewWorkspace } from '~/components/Settings/Workspaces/CreateNewWorkspace';
import { WorkspacesListItem } from '~/components/Workspaces/WorkspacesListItem';
import { EventType, useSubscription } from '~/hooks/useSubscription';
import { getAllowedWorkspaces } from '~/models/workspace.server';
import { requireUser } from '~/server/session.server';

dayjs.extend(relativeTime);

export type WorkspacesLoader = SerializeFrom<typeof loader>;

export const loader = async ({ request }: LoaderArgs) => {
	const user = await requireUser(request);

	const workspaces = await getAllowedWorkspaces(user.id);

	return json({
		user,
		workspaces: workspaces?.sort((a, b) =>
			a.sortIndex < b.sortIndex ? -1 : a.sortIndex > b.sortIndex ? 1 : 0,
		),
	});
};

// todo maybe add valtio for state management

export default function WorkspacesIndex() {
	const { user, workspaces } = useLoaderData<typeof loader>();
	const [checked, setChecked] = useState(false);

	const [searchValue, setSearchValue] = useInputState('');

	useSubscription(`/api/subscriptions/workspaces/${user.id}`, [
		EventType.CREATE_WORKSPACE,
		EventType.DELETE_WORKSPACE,
		EventType.INVITE_MEMBER,
		EventType.REMOVE_ACCESS,
		EventType.REORDER_WORKSPACE,
		EventType.UPDATE_NAME_WORKSPACE,
	]);

	const filteredWorkspaces = workspaces
		?.filter((workspace) =>
			workspace.name.toLowerCase().includes(searchValue.toLowerCase()),
		)
		?.filter((workspace) => (checked ? workspace.ownerId === user.id : true));

	return (
		<Box>
			<Grid>
				<Grid.Col
					xs={12}
					sm={6}
				>
					<TextInput
						placeholder={'Search workspace'}
						value={searchValue}
						onChange={setSearchValue}
					/>
				</Grid.Col>
				<Grid.Col
					xs={12}
					sm={6}
				>
					<CreateNewWorkspace />
				</Grid.Col>
			</Grid>
			<Group
				position={'right'}
				my={12}
			>
				<Switch
					label="Only my workspaces"
					checked={checked}
					onChange={(event) => setChecked(event.currentTarget.checked)}
				/>
			</Group>
			{filteredWorkspaces?.length ? (
				<SimpleGrid
					cols={4}
					my={24}
					breakpoints={[
						{ maxWidth: 'md', cols: 3 },
						{ maxWidth: 'sm', cols: 2 },
						{ maxWidth: 'xs', cols: 1 },
					]}
				>
					<AnimatePresence
						initial={false}
						mode={'popLayout'}
					>
						{filteredWorkspaces?.map((w) => (
							<WorkspacesListItem
								key={w.id}
								workspace={w}
							/>
						))}
					</AnimatePresence>
				</SimpleGrid>
			) : (
				<Title
					order={3}
					align={'center'}
					mt={'50px'}
				>
					Nothing found, create you first workspace
				</Title>
			)}
		</Box>
	);
}

export {
	GenericCatchBoundary as CatchBoundary,
	GenericErrorBoundary as ErrorBoundary,
};
