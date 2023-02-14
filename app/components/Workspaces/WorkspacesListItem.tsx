import {
	ActionIcon,
	Avatar,
	Badge,
	Group,
	Paper,
	Text,
	Tooltip,
} from '@mantine/core';
import { useLoaderData, useLocation, useNavigate } from '@remix-run/react';
import { IconFiles, IconSettings } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { motion } from 'framer-motion';
import type { SyntheticEvent } from 'react';
import type { loader, WorkspacesLoader } from '~/routes';

interface Props {
	workspace: WorkspacesLoader['workspaces'][0];
}

export const WorkspacesListItem = ({ workspace }: Props) => {
	const { user } = useLoaderData<typeof loader>();
	const navigate = useNavigate();
	const location = useLocation();

	const handleGoWorkspace = (workspaceId: string) => {
		navigate(`./media/${workspaceId}`);
	};

	const handleGoSettings = (event: SyntheticEvent, workspaceId: string) => {
		event.stopPropagation();
		navigate(`/settings/workspaces/${workspaceId}`, {
			state: location.pathname,
		});
	};

	return (
		<Paper
			component={motion.div}
			layout
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{ opacity: { duration: 0.3 } }}
			p="md"
			withBorder
			onClick={() => handleGoWorkspace(workspace.id)}
			sx={{ cursor: 'pointer' }}
		>
			<Group position={'apart'}>
				<Text
					size={'lg'}
					truncate
					w={'80%'}
				>
					{workspace.name}
				</Text>
				<ActionIcon onClick={(event) => handleGoSettings(event, workspace.id)}>
					<IconSettings size={16} />
				</ActionIcon>
			</Group>
			<Group
				mt={12}
				position={'apart'}
			>
				{user.email === workspace.owner.email ? (
					<Badge color={'emerald'}>You</Badge>
				) : (
					<Badge color={'blue'}>{workspace.owner.email}</Badge>
				)}
				<Text
					size={'sm'}
					color={'dimmed'}
				>
					{dayjs().to(dayjs(workspace.createdAt))}
				</Text>
			</Group>
			<Group
				mt={12}
				position={'apart'}
			>
				<Group spacing={4}>
					<IconFiles
						size={16}
						stroke={1}
					/>
					<Text
						size={'sm'}
						color={'dimmed'}
					>
						{workspace.media.length}
					</Text>
				</Group>
				{workspace.collaborator.length ? (
					<Tooltip.Group
						openDelay={300}
						closeDelay={100}
					>
						<Avatar.Group spacing="sm">
							{workspace.collaborator
								.filter((c) => c.user.email !== user.email)
								.slice(0, 2)
								.map((c) => (
									<Tooltip
										key={c.id}
										label={c.user.email}
										withArrow
									>
										<Avatar
											src={c.user.avatarUrl}
											radius="xl"
											size={'sm'}
										/>
									</Tooltip>
								))}
							{workspace.collaborator
								.filter((c) => c.user.email !== user.email)
								.slice(2).length ? (
								<Tooltip
									withArrow
									label={
										<>
											{workspace.collaborator
												.filter((c) => c.user.email !== user.email)
												.slice(2)
												.map((c) => (
													<div key={c.id}>{c.user.email}</div>
												))}
										</>
									}
								>
									<Avatar
										radius="xl"
										size={'sm'}
									>
										+
										{
											workspace.collaborator
												.filter((c) => c.user.email !== user.email)
												.slice(2).length
										}
									</Avatar>
								</Tooltip>
							) : null}
						</Avatar.Group>
					</Tooltip.Group>
				) : null}
			</Group>
		</Paper>
	);
};
