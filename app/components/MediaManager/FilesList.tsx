import {
	ActionIcon,
	AspectRatio,
	Badge,
	Box,
	Button,
	Checkbox,
	CopyButton,
	Group,
	Image,
	Paper,
	Popover,
	Stack,
	Switch,
	Text,
	Title,
} from '@mantine/core';
import { upperFirst } from '@mantine/hooks';
import { useFetcher, useLoaderData } from '@remix-run/react';
import {
	IconClipboard,
	IconDownload,
	IconShare,
	IconTrash,
} from '@tabler/icons-react';
import { nanoid } from 'nanoid';
import type { Dispatch, SetStateAction } from 'react';
import { HiddenSessionId } from '~/components/Utils/HiddenSessionId';
import type { loader, WorkspaceLoader } from '~/routes/media/$workspaceId';
import { formatBytes } from '~/utils/utils';
import { FileComments } from './FileComments';

interface Props {
	setSelectedFiles: Dispatch<SetStateAction<string[]>>;
	setSelectedFilesUrls: Dispatch<SetStateAction<string[]>>;
	filteredUserFiles: WorkspaceLoader['userFiles'];
	selectedFiles: string[];
}

export const FilesList = ({
	setSelectedFiles,
	setSelectedFilesUrls,
	filteredUserFiles,
	selectedFiles,
}: Props) => {
	const { rights, origin } = useLoaderData<typeof loader>();
	const fetcher = useFetcher();

	const handlePickFile = (id: string, url: string) => {
		setSelectedFiles((prevState) =>
			prevState.includes(id)
				? prevState.filter((el) => el !== id)
				: [...prevState, id],
		);
		setSelectedFilesUrls((prevState) =>
			prevState.includes(url)
				? prevState.filter((el) => el !== url)
				: [...prevState, url],
		);
	};

	const handleMakePublic = (event: any, fileId: string) => {
		const { checked } = event.currentTarget;

		fetcher.submit(
			{
				intent: 'togglePublic',
				fileId,
				checked,
				sessionId: sessionStorage.getItem('sessionId') ?? nanoid(),
			},
			{ method: 'post', replace: true },
		);
	};

	const handleDownloadFile = async (fileUrl: string, fileName: string) => {
		const response = await fetch(fileUrl, { mode: 'no-cors' });
		const blob = await response.blob();

		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');

		a.href = url;
		a.download = fileName;

		const handleOnDownload = () => {
			setTimeout(() => {
				URL.revokeObjectURL(url);
				a.removeEventListener('click', handleOnDownload);
			}, 200);
		};

		a.addEventListener('click', handleOnDownload, false);
		a.click();
	};
	// todo refactor component
	// todo add type
	return (
		<Stack my={24}>
			{filteredUserFiles?.length ? (
				filteredUserFiles.map((file) => (
					<Paper
						withBorder
						p={'sm'}
						key={file.id}
					>
						<Group
							position={'apart'}
							align={'center'}
						>
							<Group>
								<Checkbox
									mt={'6px'}
									color={'gray'}
									onChange={() => handlePickFile(file.id, file.fileUrl)}
									checked={selectedFiles.includes(file.id)}
								/>
								<Box
									h={'36px'}
									w={'64px'}
								>
									<AspectRatio ratio={16 / 9}>
										{file.type.includes('image') ? (
											<Image
												src={file.fileUrl}
												alt={file.fileUrl}
												fit={'cover'}
											/>
										) : file.type.includes('video') ? (
											<video
												controls
												preload="metadata"
											>
												<source
													src={`${file.fileUrl}#t=0.5`}
													type={file.type}
												/>
											</video>
										) : file.type.includes('audio') ? (
											<Box
												sx={(theme) => ({
													background:
														theme.colorScheme === 'dark'
															? theme.colors.dark[4]
															: theme.colors.gray[2],
												})}
											>
												<audio controls>
													<source
														src={file.fileUrl}
														type={file.type}
													/>
												</audio>
											</Box>
										) : file.type.includes('pdf') ? (
											<embed
												type={file.type}
												src={file.fileUrl}
											/>
										) : (
											<Box
												sx={(theme) => ({
													background:
														theme.colorScheme === 'dark'
															? theme.colors.dark[4]
															: theme.colors.gray[2],
												})}
											>
												<Text align={'center'}>
													{upperFirst(file.type.split('/')[1])}
												</Text>
											</Box>
										)}
									</AspectRatio>
								</Box>
								<Text
									color={'dimmed'}
									size={'sm'}
								>
									{formatBytes(file.size)}
								</Text>
								<Badge
									color="gray"
									variant="outline"
								>
									{file.type.split('/')[1]}
								</Badge>
								<Text
									color={'dimmed'}
									size={'sm'}
								>
									{file.name}
								</Text>
							</Group>
							<Group>
								<fetcher.Form method={'post'}>
									<input
										type="hidden"
										name={'fileId'}
										value={file.id}
									/>
									<HiddenSessionId />
									<Group spacing={4}>
										<Popover
											width={250}
											withArrow
											position="bottom"
											shadow={'sm'}
										>
											<Popover.Target>
												<ActionIcon>
													<IconShare size={18} />
												</ActionIcon>
											</Popover.Target>
											<Popover.Dropdown>
												<Stack
													align={'start'}
													spacing={0}
												>
													<Text>Share this file</Text>
													<Switch
														label="Make this file public"
														name={'isPublic'}
														checked={file.public}
														onChange={(event) =>
															handleMakePublic(event, file.id)
														}
														mb={20}
														color={'emerald'}
													/>
													<CopyButton
														value={`${origin}/media/share/${file.id}`}
													>
														{({ copied, copy }) => (
															<Button
																color={copied ? 'lime' : 'emerald'}
																leftIcon={<IconClipboard size={18} />}
																onClick={copy}
																disabled={!file.public}
																variant={'light'}
															>
																{copied ? 'Copied link' : 'Copy link'}
															</Button>
														)}
													</CopyButton>
												</Stack>
											</Popover.Dropdown>
										</Popover>

										<ActionIcon
											onClick={() =>
												handleDownloadFile(file.fileUrl, file.name)
											}
										>
											<IconDownload size={18} />
										</ActionIcon>
										<ActionIcon
											type={'submit'}
											name={'intent'}
											value={'deleteFile'}
											disabled={!rights?.delete}
										>
											<IconTrash size={18} />
										</ActionIcon>
										<FileComments
											disabled={!rights?.comment}
											comments={file.comments}
											mediaId={file.id}
										/>
									</Group>
								</fetcher.Form>
							</Group>
						</Group>
					</Paper>
				))
			) : (
				<Title
					order={3}
					align={'center'}
				>
					Nothing found
				</Title>
			)}
		</Stack>
	);
};
