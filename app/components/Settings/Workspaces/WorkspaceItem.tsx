import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ActionIcon, Badge, Group, Paper, Text } from '@mantine/core';
import { useFetcher, useLocation, useNavigate } from '@remix-run/react';
import {
	IconGripVertical,
	IconMessage2,
	IconTrash,
	IconUpload,
} from '@tabler/icons';
import dayjs from 'dayjs';
import { nanoid } from 'nanoid';
import { DangerButton } from '~/components/Buttons/DangerButtom';
import { useUser } from '~/utils/utils';

export const WorkspaceItem = ({ workspace }: { workspace: any }) => {
	const user = useUser();
	const navigate = useNavigate();
	const location = useLocation();
	const fetcher = useFetcher();

	const isMyWorkspaces = workspace.ownerId === user.id;

	const collaborator = isMyWorkspaces
		? null
		: workspace?.collaborator.find(
				(c: { userId: string }) => c.userId === user.id,
		  );

	const handleNavigate = (workspaceId: string) => {
		navigate(`/settings/workspaces/${workspaceId}`, {
			state: location.pathname,
		});
	};

	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: workspace.id });

	const style = {
		transform: CSS.Translate.toString(transform),
		transition,
	};

	const handleDelete = (e: any, workspaceId: string) => {
		e.stopPropagation();
		fetcher.submit(
			{
				intent: 'deleteWorkspace',
				sessionId: sessionStorage.getItem('sessionId') ?? nanoid(),
			},
			{
				method: 'post',
				action: `/settings/workspaces/${workspaceId}`,
			},
		);
	};

	const handleLeave = (e: any, workspaceId: string) => {
		e.stopPropagation();

		const collaborator = workspace?.collaborator.find(
			(c: { userId: string }) => c.userId === user.id,
		);

		fetcher.submit(
			{
				intent: 'leaveWorkspace',
				collaboratorId: collaborator.id,
				sessionId: sessionStorage.getItem('sessionId') ?? nanoid(),
			},
			{
				method: 'post',
				action: `/settings/workspaces/${workspaceId}`,
			},
		);
	};

	console.log('workspace', workspace);

	return (
		<Paper
			ref={setNodeRef}
			style={style}
			onClick={() => handleNavigate(workspace.id)}
			sx={{
				cursor: 'pointer',
				position: 'relative',
				zIndex: isDragging ? 1 : 0,
			}}
			withBorder
			my={12}
			py={12}
			px={12}
		>
			<Group position={'apart'}>
				<Group>
					{isMyWorkspaces ? (
						<ActionIcon
							size="sm"
							color={'zinc'}
							{...listeners}
							{...attributes}
						>
							<IconGripVertical />
						</ActionIcon>
					) : null}
					<Text>{workspace.name}</Text>
				</Group>
				{isMyWorkspaces ? (
					<DangerButton
						compact
						onClick={(e: any) => handleDelete(e, workspace.id)}
					>
						Delete
					</DangerButton>
				) : (
					<DangerButton
						compact
						onClick={(e: any) => handleLeave(e, workspace.id)}
					>
						Leave
					</DangerButton>
				)}
			</Group>
			<Group>
				<Text
					size={'sm'}
					color={'dimmed'}
				>
					{dayjs(workspace.createdAt).format('DD/MM/YYYY')}
				</Text>
				{collaborator?.rights ? (
					<Group>
						<Badge
							pl={3}
							color={collaborator?.rights?.upload ? 'emerald' : 'red'}
							leftSection={<IconUpload size={10} />}
						>
							{collaborator?.rights?.upload ? 'Yes' : 'No'}
						</Badge>
						<Badge
							pl={3}
							color={collaborator?.rights?.comment ? 'emerald' : 'red'}
							leftSection={<IconMessage2 size={10} />}
						>
							{collaborator?.rights?.comment ? 'Yes' : 'No'}
						</Badge>
						<Badge
							pl={3}
							color={collaborator?.rights?.delete ? 'emerald' : 'red'}
							leftSection={<IconTrash size={10} />}
						>
							{collaborator?.rights?.delete ? 'Yes' : 'No'}
						</Badge>
					</Group>
				) : null}
			</Group>
		</Paper>
	);
};
