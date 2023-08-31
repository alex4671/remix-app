import {
	ActionIcon,
	AspectRatio,
	Badge,
	Box,
	Button,
	Card,
	Checkbox,
	CopyButton,
	Group,
	Image,
	Popover,
	SimpleGrid,
	Stack,
	Switch,
	Text,
	Title,
	Tooltip,
} from '@mantine/core';
import { upperFirst } from '@mantine/hooks';
import { useFetcher, useFetchers, useLoaderData } from '@remix-run/react';
import {
	IconClipboard,
	IconDownload,
	IconMessage2,
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
	filterTypeValue: string[];
	selectedFiles: string[];
}

export const FilesGrid = ({
	setSelectedFiles,
	setSelectedFilesUrls,
	filteredUserFiles,
	filterTypeValue,
	selectedFiles,
}: Props) => {
	const { rights, origin } = useLoaderData<typeof loader>();
	const fetcher = useFetcher();
	const fetchers = useFetchers();

	const filesUploadFetcher = fetchers.find(
		(f) => f.submission?.formData.get('intent') === 'uploadFiles',
	);

	const isSubmitting = filesUploadFetcher?.submission;

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
	return (
		<Group
			grow
			my={24}
		>
			{filteredUserFiles?.length ? (
				<SimpleGrid
					cols={4}
					breakpoints={[
						{ maxWidth: 'md', cols: 3 },
						{ maxWidth: 'sm', cols: 2 },
						{ maxWidth: 'xs', cols: 1 },
					]}
				>
					{filteredUserFiles.map((file) => (
						<Card
							p="lg"
							withBorder
							key={file.id}
							sx={(theme) => ({
								outline: selectedFiles.includes(file.id)
									? `2px solid ${theme.colors.gray[6]}`
									: 'none',
							})}
						>
							<Card.Section>
								<Tooltip
									label={file.name}
									position={'top'}
									withinPortal={true}
									multiline
									disabled
								>
									<AspectRatio ratio={16 / 9}>
										{file.type.includes('image') ? (
											<Image
												src={file.fileUrl}
												alt={file.fileUrl}
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
								</Tooltip>
							</Card.Section>

							<Card.Section
								py="lg"
								px={'md'}
							>
								<Group
									position={'apart'}
									align={'baseline'}
								>
									<Group align={'flex-start'}>
										<Checkbox
											color={'gray'}
											onChange={() => handlePickFile(file.id, file.fileUrl)}
											checked={selectedFiles.includes(file.id)}
										/>
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
									</Group>
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
														my={'lg'}
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
										<fetcher.Form method={'post'}>
											<input
												type="hidden"
												name={'fileId'}
												value={file.id}
											/>
											<HiddenSessionId />
											<ActionIcon
												type={'submit'}
												name={'intent'}
												value={'deleteFile'}
												disabled={!rights?.delete}
											>
												<IconTrash size={18} />
											</ActionIcon>
										</fetcher.Form>
										<FileComments
											disabled={!rights?.comment}
											comments={file.comments}
											mediaId={file.id}
										/>
									</Group>
								</Group>
							</Card.Section>
						</Card>
					))}
					{isSubmitting && filterTypeValue.length === 0
						? (
								filesUploadFetcher?.submission?.formData.getAll(
									'file',
								) as File[]
						  ).map((file) => (
								<Card
									p="lg"
									withBorder
									key={file.name}
									style={{ opacity: '0.5' }}
								>
									<Card.Section>
										<AspectRatio ratio={16 / 9}>
											{file.type.includes('image') ? (
												<Image
													src={URL.createObjectURL(file)}
													alt={'Test'}
												/>
											) : file.type.includes('video') ? (
												<video
													controls={false}
													preload="metadata"
												>
													<source
														src={`${URL.createObjectURL(file)}#t=0.5`}
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
															src={URL.createObjectURL(file)}
															type={file.type}
														/>
													</audio>
												</Box>
											) : (
												<Box
													sx={(theme) => ({
														background:
															theme.colorScheme === 'dark'
																? theme.colors.dark[5]
																: theme.colors.gray[2],
													})}
												>
													<Text align={'center'}>
														{file.type.split('/')[1]}
													</Text>
												</Box>
											)}
										</AspectRatio>
									</Card.Section>

									<Card.Section
										py="lg"
										px={'md'}
									>
										<Group
											position={'apart'}
											align={'baseline'}
										>
											<Group align={'flex-start'}>
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
											</Group>
											<Group spacing={4}>
												<ActionIcon disabled>
													<IconShare size={18} />
												</ActionIcon>
												<ActionIcon disabled>
													<IconDownload size={18} />
												</ActionIcon>
												<ActionIcon disabled>
													<IconTrash size={18} />
												</ActionIcon>
												<ActionIcon disabled>
													<IconMessage2 size={18} />
												</ActionIcon>
											</Group>
										</Group>
									</Card.Section>
								</Card>
						  ))
						: null}
				</SimpleGrid>
			) : (
				<Title
					order={3}
					align={'center'}
				>
					Nothing found
				</Title>
			)}
		</Group>
	);
};
