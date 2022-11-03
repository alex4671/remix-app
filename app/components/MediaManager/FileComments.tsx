import {ActionIcon, Avatar, Drawer, Group, Paper, ScrollArea, Stack, Text, Textarea, Title} from "@mantine/core";
import {IconMessage2} from "@tabler/icons";
import {useState} from "react";
import {PrimaryButton} from "~/components/Buttons/PrimaryButton";
import {useUser} from "~/utils/utils";
import dayjs from "dayjs";
import {useFetcher} from "@remix-run/react";
import {LoadingProgress} from "~/components/Utils/LoadingProgress";
import {DangerButton} from "~/components/Buttons/DangerButtom";

interface Props {
  comments: any;
  mediaId: string;
}

export const FileComments = ({comments, mediaId}: Props) => {
  const user = useUser()
  const fetcher = useFetcher()
  const [opened, setOpened] = useState(false);

  return (
    <>
      <LoadingProgress state={fetcher.state}/>
      <Drawer
        opened={opened}
        onClose={() => setOpened(false)}
        title="Comments"
        padding="xl"
        size="xl"
        position={"right"}
      >
        <ScrollArea style={{height: "75%"}} offsetScrollbars>
          <Stack>
            {comments?.length ?
              comments?.map(c => {
                if (c.user.email === user.email) {
                  return (
                    <Paper withBorder p={"sm"} mr={36} key={c.id}>
                      <Group position={"apart"}>
                        <Group>
                          <Avatar src={c.user.avatarUrl} alt={c.user.email} radius="xl"/>
                          <div>
                            <Text size="sm">{c.user.email}</Text>
                            <Text size="xs" color="dimmed">{dayjs(c.createdAt).format("DD/MM/YYYY")}</Text>
                          </div>
                        </Group>
                        <fetcher.Form method={"post"}>
                          <input type="hidden" name={"commentId"} value={c.id}/>
                          <DangerButton
                            compact
                            type={"submit"}
                            name={"intent"}
                            value={"deleteComment"}
                          >
                            Delete
                          </DangerButton>
                        </fetcher.Form>
                      </Group>
                      <p>{c.comment}</p>
                    </Paper>
                  )
                } else {
                  return (
                    <Paper withBorder p={"sm"} ml={36} key={c.id}>
                      <Group position={"right"}>
                        <div>
                          <Text size="sm">{c.user.email}</Text>
                          <Text size="xs" color="dimmed">{dayjs(c.createdAt).format("DD/MM/YYYY")}</Text>
                        </div>
                        <Avatar src={c.user.avatarUrl} alt={c.user.email} radius="xl"/>
                      </Group>
                      <Group position={"right"}>
                        <p>{c.comment}</p>
                      </Group>
                    </Paper>
                  )
                }
              })
              : (
                <Title order={4} align={"center"} mt={24}>No comments</Title>
              )}

          </Stack>
        </ScrollArea>
        <fetcher.Form method={"post"}>
          <Stack my={12}>
            <input type="hidden" name={"mediaId"} value={mediaId}/>
            <Textarea
              placeholder="Your comment"
              name={"comment"}
            />
            <PrimaryButton type={"submit"} name={"intent"} value={"createComment"}>Post comment</PrimaryButton>
          </Stack>
        </fetcher.Form>
      </Drawer>

      <Group spacing={0}>
        <ActionIcon onClick={() => setOpened(true)}>
          <IconMessage2 size={18}/>
        </ActionIcon>
        <Text size={"xs"} color={"dimmed"}>{comments?.length}</Text>
      </Group>
    </>
  )
}
