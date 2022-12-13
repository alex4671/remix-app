import {
	ActionIcon,
	AspectRatio,
	Box,
	Button,
	Card,
	CopyButton,
	Group,
	Popover,
	SimpleGrid,
	Stack,
	Switch,
	Text,
	Title,
} from '@mantine/core';
import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Link, useFetcher, useLoaderData, useNavigate } from '@remix-run/react';
import {
	IconClipboard,
	IconPencil,
	IconShare,
	IconTrash,
	IconVideo,
} from '@tabler/icons';
import { nanoid } from 'nanoid';
import { PrimaryButton } from '~/components/Buttons/PrimaryButton';
import { getRecordings } from '~/models/media.server';
import { requireUser } from '~/server/session.server';
import { formatBytes } from '~/utils/utils';

export const loader = async ({ request }: LoaderArgs) => {
	const user = await requireUser(request);
	const recordings = await getRecordings(user.id);
	const url = new URL(request.url);
	return json({
		recordings,
		origin: url.origin,
	});
};

export default function RecorderIndex() {
	const { recordings, origin } = useLoaderData<typeof loader>();
	const navigate = useNavigate();
	const fetcher = useFetcher();

	const handleNavigate = (id: string) => {
		navigate(`./${id}`);
	};

	const handleMakePublic = (event: any, recordingId: string) => {
		const { checked } = event.currentTarget;

		fetcher.submit(
			{
				intent: 'togglePublic',
				recordingId,
				checked,
				sessionId: sessionStorage.getItem('sessionId') ?? nanoid(),
			},
			{ method: 'post', action: '/recorder' },
		);
	};

	return (
		<>
			<Group
				position={'right'}
				my={24}
			>
				<PrimaryButton
					component={Link}
					to={'/recorder/new'}
					leftIcon={<IconVideo size={18} />}
				>
					New recording
				</PrimaryButton>
			</Group>

			{recordings.length ? (
				<SimpleGrid
					cols={4}
					breakpoints={[
						{ maxWidth: 'md', cols: 3 },
						{ maxWidth: 'sm', cols: 2 },
						{ maxWidth: 'xs', cols: 1 },
					]}
				>
					{recordings.map((recording) => (
						<Card
							p="lg"
							withBorder
							key={recording.id}
						>
							<Card.Section>
								<AspectRatio ratio={16 / 9}>
									{recording.type.includes('video') ? (
										<video
											controls
											preload="metadata"
										>
											<source
												src={`${recording.fileUrl}#t=0.5`}
												type={recording.type}
											/>
										</video>
									) : (
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
													src={recording.fileUrl}
													type={recording.type}
												/>
											</audio>
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
									<Group>
										<Text
											color={'dimmed'}
											size={'sm'}
										>
											{formatBytes(recording.size)}
										</Text>
									</Group>
									<Group spacing={4}>
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
														<Text>Share this recording</Text>
														<Switch
															label="Make this file public"
															name={'isPublic'}
															checked={recording.public}
															onChange={(event) =>
																handleMakePublic(event, recording.id)
															}
															my={'lg'}
															color={'emerald'}
														/>
														<CopyButton
															value={`${origin}/media/share/${recording.id}`}
														>
															{({ copied, copy }) => (
																<Button
																	color={copied ? 'lime' : 'emerald'}
																	leftIcon={<IconClipboard size={18} />}
																	onClick={copy}
																	disabled={!recording.public}
																	variant={'light'}
																>
																	{copied ? 'Copied link' : 'Copy link'}
																</Button>
															)}
														</CopyButton>
													</Stack>
												</Popover.Dropdown>
											</Popover>
										</Group>
										<ActionIcon onClick={() => handleNavigate(recording.id)}>
											<IconPencil size={18} />
										</ActionIcon>
										<fetcher.Form
											method={'post'}
											action={'/recorder'}
										>
											<input
												type="hidden"
												name={'recordId'}
												value={recording.id}
											/>
											<ActionIcon
												type={'submit'}
												name={'intent'}
												value={'deleteRecord'}
											>
												<IconTrash size={18} />
											</ActionIcon>
										</fetcher.Form>
									</Group>
								</Group>
							</Card.Section>
						</Card>
					))}
				</SimpleGrid>
			) : (
				<Title
					order={3}
					align={'center'}
				>
					Nothing found
				</Title>
			)}
		</>
	);
}
