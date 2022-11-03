import type {LoaderArgs} from "@remix-run/node";
import {json} from "@remix-run/node";
import {requireUser} from "~/server/session.server";
import {useInputState} from "@mantine/hooks";
import {useFetcher, useLoaderData, useNavigate} from "@remix-run/react";
import {getAllowedWorkspaces} from "~/models/workspace.server";
import {ActionIcon, Avatar, Badge, Box, Group, Paper, SimpleGrid, Text, TextInput, Title, Tooltip} from "@mantine/core";
import {IconFiles, IconSettings} from "@tabler/icons";
import {PrimaryButton} from "~/components/Buttons/PrimaryButton";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime"
import {LoadingProgress} from "~/components/Utils/LoadingProgress";

dayjs.extend(relativeTime)

export const loader = async ({request}: LoaderArgs) => {
  const user = await requireUser(request)

  const workspaces = await getAllowedWorkspaces(user.id)

  return json({user, workspaces})
}


// todo maybe add valtio for state managment

export default function Workspaces() {
  const {user, workspaces} = useLoaderData<typeof loader>()
  const navigate = useNavigate()
  const fetcher = useFetcher()

  const [value, setValue] = useInputState('');
  const [searchValue, setSearchValue] = useInputState('');

  const handleGoWorkspace = (workspaceId: string) => {
    navigate(`./${workspaceId}`)
  }

  const handleCreateWorkspace = () => {
    fetcher.submit({intent: "createWorkspace", workspaceName: value}, {method: "post", action: "/settings/workspaces"})
    setValue("")
  }

  const handleGoSettings = (event: any, workspaceId: string) => {
    event.stopPropagation()
    navigate(`/settings/workspaces/${workspaceId}`)
  }

  const filteredWorkspaces = workspaces
    ?.filter(workspace => workspace.name.toLowerCase().includes(searchValue.toLowerCase()))

  return (
    <Box>
      <LoadingProgress state={fetcher.state}/>
      <Group position={"apart"} spacing={"xs"} my={24}>
        <TextInput placeholder={"Search workspace"} value={searchValue} onChange={setSearchValue}/>
        <Group>
          <TextInput placeholder={"Workspace name"} value={value} onChange={setValue}/>
          <PrimaryButton onClick={handleCreateWorkspace}>Create new workspace</PrimaryButton>
        </Group>
      </Group>
      {filteredWorkspaces?.length ? (
        <SimpleGrid cols={4}>
          {filteredWorkspaces?.map(w => (
            <Paper p="md" withBorder key={w.id} onClick={() => handleGoWorkspace(w.id)} sx={{cursor: "pointer"}}>
              <Group position={"apart"}>
                <Text size={"lg"}>{w.name}</Text>
                <ActionIcon onClick={(event: any) => handleGoSettings(event, w.id)}>
                  <IconSettings size={16}/>
                </ActionIcon>
              </Group>
              <Group mt={12} position={"apart"}>
                {user.email === w.owner.email ? (
                  <Badge color={"emerald"}>You</Badge>
                ) : (
                  <Badge color={"blue"}>{w.owner.email}</Badge>
                )}
                <Text size={"sm"} color={"dimmed"}>{dayjs().to(dayjs(w.createdAt))}</Text>
              </Group>
              <Group mt={12} position={"apart"}>
                <Group spacing={4}>
                  <IconFiles size={16} stroke={1}/>
                  <Text size={"sm"} color={"dimmed"}>{w.media.length}</Text>
                </Group>
                {w.collaborator.length ? (
                  <Tooltip.Group openDelay={300} closeDelay={100}>
                    <Avatar.Group spacing="sm">
                      {w.collaborator.filter(c => c.user.email !== user.email).slice(0, 2).map((c) => (
                        <Tooltip key={c.id} label={c.user.email} withArrow>
                          <Avatar src={c.user.avatarUrl} radius="xl" size={"sm"}/>
                        </Tooltip>
                      ))}
                      {w.collaborator.filter(c => c.user.email !== user.email).slice(2).length ? (
                        <Tooltip
                          withArrow
                          label={
                            <>
                              {w.collaborator.filter(c => c.user.email !== user.email).slice(2).map(c => <div key={c.id}>{c.user.email}</div>)}
                            </>
                          }
                        >
                          <Avatar radius="xl" size={"sm"}>+{w.collaborator.filter(c => c.user.email !== user.email).slice(2).length}</Avatar>
                        </Tooltip>
                      ) : null}
                    </Avatar.Group>
                  </Tooltip.Group>
                ) : null}
              </Group>
            </Paper>
          ))}
        </SimpleGrid>
      ) : (
        <Title order={3} align={"center"}>Nothing found, create you first workspace</Title>
      )}
    </Box>
  )
}

