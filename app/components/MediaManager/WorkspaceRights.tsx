import {
	ActionIcon,
	Badge,
	Button,
	Group,
	Popover,
	Stack,
	Switch,
	Text,
} from '@mantine/core';
import { useFetcher } from '@remix-run/react';
import { IconEdit } from '@tabler/icons-react';
import { nanoid } from 'nanoid';
import { useState } from 'react';
import type { action } from '~/routes/media/$workspaceId';

type Rights = {
	delete: boolean;
	upload: boolean;
	comment: boolean;
};

interface Props {
	rights: any;
	collaboratorId: string;
	isOwner: boolean;
}

export const WorkspaceRights = ({ rights, collaboratorId, isOwner }: Props) => {
	const fetcher = useFetcher<typeof action>();
	const [workspaceRights, setWorkspaceRights] = useState({
		delete: rights?.delete,
		upload: rights?.upload,
		comment: rights?.comment,
	});
	const [opened, setOpened] = useState(false);

	const handleUpdateRights = () => {
		fetcher.submit(
			{
				workspaceRights: JSON.stringify(workspaceRights),
				collaboratorId,
				intent: 'updateRights',
				sessionId: sessionStorage.getItem('sessionId') ?? nanoid(),
			},
			{
				method: 'post',
			},
		);
		setOpened(false);
	};

	return (
		<>
			<Group spacing={8}>
				<Group spacing={0}>
					<Text>Upload: </Text>
					<Badge color={rights.upload ? 'emerald' : 'red'}>
						{rights.upload ? 'Yes' : 'No'}
					</Badge>
				</Group>
				<Group spacing={0}>
					<Text>Delete: </Text>
					<Badge color={rights.delete ? 'emerald' : 'red'}>
						{rights.delete ? 'Yes' : 'No'}
					</Badge>
				</Group>
				<Group spacing={0}>
					<Text>Comment: </Text>
					<Badge color={rights.comment ? 'emerald' : 'red'}>
						{rights.comment ? 'Yes' : 'No'}
					</Badge>
				</Group>
				{isOwner ? (
					<Popover
						width={250}
						withArrow
						position="top"
						shadow={'sm'}
						withinPortal
						opened={opened}
						onChange={setOpened}
					>
						<Popover.Target>
							<ActionIcon onClick={() => setOpened((o) => !o)}>
								<IconEdit size={14} />
							</ActionIcon>
						</Popover.Target>
						<Popover.Dropdown>
							<Stack
								align={'start'}
								spacing={0}
							>
								<Text>Edit rules</Text>
								<Switch
									label="Upload"
									name={'rightsUpload'}
									mt={'sm'}
									checked={workspaceRights.upload}
									onChange={(event) =>
										setWorkspaceRights({
											delete: workspaceRights.delete,
											comment: workspaceRights.comment,
											upload: event.currentTarget.checked,
										})
									}
									color={'emerald'}
								/>
								<Switch
									label="Delete"
									name={'rightsDelete'}
									mt={'sm'}
									checked={workspaceRights.delete}
									onChange={(event) =>
										setWorkspaceRights({
											upload: workspaceRights.upload,
											comment: workspaceRights.comment,
											delete: event.currentTarget.checked,
										})
									}
									color={'emerald'}
								/>
								<Switch
									label="Comment"
									name={'rightsComment'}
									mt={'sm'}
									checked={workspaceRights.comment}
									onChange={(event) =>
										setWorkspaceRights({
											upload: workspaceRights.upload,
											delete: workspaceRights.delete,
											comment: event.currentTarget.checked,
										})
									}
									color={'emerald'}
								/>
								<Button
									mt={12}
									onClick={handleUpdateRights}
									variant={'light'}
									color={'emerald'}
								>
									Save
								</Button>
							</Stack>
						</Popover.Dropdown>
					</Popover>
				) : null}
			</Group>
		</>
	);
};
