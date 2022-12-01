import {
	ActionIcon,
	AspectRatio,
	Badge,
	Box,
	Card,
	Group,
	SimpleGrid,
	Text,
} from '@mantine/core';
import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Link, useFetcher, useLoaderData, useNavigate } from '@remix-run/react';
import { IconPencil, IconTrash, IconVideo } from '@tabler/icons';
import { PrimaryButton } from '~/components/Buttons/PrimaryButton';
import { getRecordings } from '~/models/media.server';
import { requireUser } from '~/server/session.server';
import { formatBytes } from '~/utils/utils';

export const loader = async ({ request }: LoaderArgs) => {
	const user = await requireUser(request);
	const recordings = await getRecordings(user.id);

	return json({
		recordings,
	});
};

export default function RecorderIndex() {
	const { recordings } = useLoaderData<typeof loader>();
	const navigate = useNavigate();
	const fetcher = useFetcher();

	const handleNavigate = (id: string) => {
		navigate(`./${id}`);
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
								<Group align={'flex-start'}>
									<Text
										color={'dimmed'}
										size={'sm'}
									>
										{formatBytes(recording.size)}
									</Text>
									<Badge
										color="gray"
										variant="outline"
									>
										{recording.type.split('/')[1]}
									</Badge>
								</Group>
								<Group spacing={4}>
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
								{/*<fetcher.Form method={'post'}>*/}
								{/*	<input*/}
								{/*		type="hidden"*/}
								{/*		name={'fileId'}*/}
								{/*		value={file.id}*/}
								{/*	/>*/}
								{/*	<HiddenSessionId />*/}
								{/*	<Group spacing={4}>*/}
								{/*		<Popover*/}
								{/*			width={250}*/}
								{/*			withArrow*/}
								{/*			position="bottom"*/}
								{/*			shadow={'sm'}*/}
								{/*		>*/}
								{/*			<Popover.Target>*/}
								{/*				<ActionIcon>*/}
								{/*					<IconShare size={18} />*/}
								{/*				</ActionIcon>*/}
								{/*			</Popover.Target>*/}
								{/*			<Popover.Dropdown>*/}
								{/*				<Stack*/}
								{/*					align={'start'}*/}
								{/*					spacing={0}*/}
								{/*				>*/}
								{/*					<Text>Share this file</Text>*/}
								{/*					<Switch*/}
								{/*						label="Make this file public"*/}
								{/*						name={'isPublic'}*/}
								{/*						checked={file.public}*/}
								{/*						onChange={(event) =>*/}
								{/*							handleMakePublic(event, file.id)*/}
								{/*						}*/}
								{/*						mb={20}*/}
								{/*						color={'emerald'}*/}
								{/*					/>*/}
								{/*					<CopyButton*/}
								{/*						value={`${origin}/media/share/${file.id}`}*/}
								{/*					>*/}
								{/*						{({ copied, copy }) => (*/}
								{/*							<Button*/}
								{/*								color={copied ? 'lime' : 'emerald'}*/}
								{/*								leftIcon={<IconClipboard size={18} />}*/}
								{/*								onClick={copy}*/}
								{/*								disabled={!file.public}*/}
								{/*								variant={'light'}*/}
								{/*							>*/}
								{/*								{copied ? 'Copied link' : 'Copy link'}*/}
								{/*							</Button>*/}
								{/*						)}*/}
								{/*					</CopyButton>*/}
								{/*				</Stack>*/}
								{/*			</Popover.Dropdown>*/}
								{/*		</Popover>*/}

								{/*		<ActionIcon*/}
								{/*			component={'a'}*/}
								{/*			href={file.fileUrl}*/}
								{/*			download*/}
								{/*			target={'_blank'}*/}
								{/*		>*/}
								{/*			<IconDownload size={18} />*/}
								{/*		</ActionIcon>*/}
								{/*		<ActionIcon*/}
								{/*			type={'submit'}*/}
								{/*			name={'intent'}*/}
								{/*			value={'deleteFile'}*/}
								{/*			disabled={!rights?.delete}*/}
								{/*		>*/}
								{/*			<IconTrash size={18} />*/}
								{/*		</ActionIcon>*/}
								{/*		<FileComments*/}
								{/*			disabled={!rights?.comment}*/}
								{/*			comments={file.comments}*/}
								{/*			mediaId={file.id}*/}
								{/*		/>*/}
								{/*	</Group>*/}
								{/*</fetcher.Form>*/}
							</Group>
						</Card.Section>
					</Card>
				))}
			</SimpleGrid>
		</>
	);
}
