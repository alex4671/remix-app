import {
	ActionIcon,
	Avatar,
	Drawer,
	Group,
	Paper,
	ScrollArea,
	Stack,
	Text,
	Textarea,
	Title,
} from '@mantine/core';
import type { SerializeFrom } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { IconMessage2 } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useEffect, useRef, useState } from 'react';
import { DangerButton } from '~/components/Buttons/DangerButtom';
import { PrimaryButton } from '~/components/Buttons/PrimaryButton';
import { HiddenSessionId } from '~/components/Utils/HiddenSessionId';
import type { loader } from '~/routes/media/$workspaceId';
import { useUser } from '~/utils/utils';

interface Props {
	disabled: boolean;
	comments: SerializeFrom<typeof loader>['userFiles'][0]['comments'];
	mediaId: string;
}

export const FileComments = ({ disabled, comments, mediaId }: Props) => {
	const user = useUser();
	const fetcher = useFetcher();
	const [opened, setOpened] = useState(false);
	const formRef = useRef<HTMLFormElement>(null);

	useEffect(() => {
		if (fetcher?.data) {
			formRef?.current?.reset();
		}
	}, [fetcher?.data]);

	return (
		<>
			<Drawer
				opened={opened}
				onClose={() => setOpened(false)}
				title="Comments"
				padding="xl"
				size="xl"
				position={'right'}
				styles={{
					body: {
						height: '100%',
					},
				}}
			>
				<Stack
					justify="space-between"
					h={'100%'}
				>
					<ScrollArea offsetScrollbars>
						<Stack>
							{comments?.length ? (
								comments?.map((c) => {
									if (c.user.email === user.email) {
										return (
											<Paper
												withBorder
												p={'sm'}
												mr={36}
												key={c.id}
											>
												<Group position={'apart'}>
													<Group>
														<Avatar
															src={c.user.avatarUrl}
															alt={c.user.email}
															radius="xl"
														/>
														<div>
															<Text size="sm">{c.user.email}</Text>
															<Text
																size="xs"
																color="dimmed"
															>
																{dayjs(c.createdAt).format('DD/MM/YYYY')}
															</Text>
														</div>
													</Group>
													<fetcher.Form method={'post'}>
														<input
															type="hidden"
															name={'commentId'}
															value={c.id}
														/>
														<HiddenSessionId />
														<DangerButton
															compact
															type={'submit'}
															name={'intent'}
															value={'deleteComment'}
														>
															Delete
														</DangerButton>
													</fetcher.Form>
												</Group>
												<p>{c.comment}</p>
											</Paper>
										);
									} else {
										return (
											<Paper
												withBorder
												p={'sm'}
												ml={36}
												key={c.id}
											>
												<Group position={'right'}>
													<div>
														<Text size="sm">{c.user.email}</Text>
														<Text
															size="xs"
															color="dimmed"
														>
															{dayjs(c.createdAt).format('DD/MM/YYYY')}
														</Text>
													</div>
													<Avatar
														src={c.user.avatarUrl}
														alt={c.user.email}
														radius="xl"
													/>
												</Group>
												<Group position={'right'}>
													<p>{c.comment}</p>
												</Group>
											</Paper>
										);
									}
								})
							) : (
								<Title
									order={4}
									align={'center'}
									mt={24}
								>
									No comments
								</Title>
							)}
						</Stack>
					</ScrollArea>
					<fetcher.Form
						method={'post'}
						style={{ marginBottom: '2rem' }}
						ref={formRef}
					>
						<Stack>
							<HiddenSessionId />
							<input
								type="hidden"
								name={'mediaId'}
								value={mediaId}
							/>
							<Textarea
								placeholder="Your comment"
								name={'comment'}
							/>
							<PrimaryButton
								type={'submit'}
								name={'intent'}
								value={'createComment'}
							>
								Post comment
							</PrimaryButton>
						</Stack>
					</fetcher.Form>
				</Stack>
			</Drawer>

			<Group spacing={0}>
				<ActionIcon
					onClick={() => setOpened(true)}
					disabled={disabled}
				>
					<IconMessage2 size={18} />
				</ActionIcon>
				<Text
					size={'xs'}
					color={'dimmed'}
				>
					{comments?.length}
				</Text>
			</Group>
		</>
	);
};
