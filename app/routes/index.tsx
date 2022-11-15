import type {LoaderArgs} from "@remix-run/node";
import {json} from "@remix-run/node";
import {requireUser} from "~/server/session.server";
import {useInputState} from "@mantine/hooks";
import {useLoaderData, useLocation, useNavigate} from "@remix-run/react";
import {getAllowedWorkspaces} from "~/models/workspace.server";
import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Grid,
  Group,
  Paper,
  SimpleGrid,
  Switch,
  Text,
  TextInput,
  Title,
  Tooltip
} from "@mantine/core";
import {IconFiles, IconSettings} from "@tabler/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime"
import {CreateNewWorkspace} from "~/components/Settings/Workspaces/CreateNewWorkspace";
import {useWorkspaceSubscription} from "~/hooks/useWorkspaceSubscription";
import {EventType} from "~/hooks/useSubscription";
import {useState} from "react";

dayjs.extend(relativeTime)

export const loader = async ({request}: LoaderArgs) => {
  const user = await requireUser(request)

  const workspaces = await getAllowedWorkspaces(user.id)

  return json({
    user,
    workspaces: workspaces?.sort((a, b) => a.sortIndex < b.sortIndex ? -1 : a.sortIndex > b.sortIndex ? 1 : 0)
  })
}


// todo maybe add valtio for state management

export default function WorkspacesIndex() {
  const {user, workspaces} = useLoaderData<typeof loader>()
  const [checked, setChecked] = useState(false);
  const navigate = useNavigate()
  const location = useLocation()

  const [searchValue, setSearchValue] = useInputState('');

  useWorkspaceSubscription(
    `/api/subscriptions/workspaces/${user.id}`,
    [
      EventType.CREATE_WORKSPACE,
      EventType.DELETE_WORKSPACE,
      EventType.INVITE_MEMBER,
      EventType.REMOVE_ACCESS,
      EventType.REORDER_WORKSPACE,
      EventType.UPDATE_NAME_WORKSPACE
    ])

  const handleGoWorkspace = (workspaceId: string) => {
    navigate(`./media/${workspaceId}`)
  }

  const handleGoSettings = (event: any, workspaceId: string) => {
    event.stopPropagation()
    navigate(`/settings/workspaces/${workspaceId}`, {state: location.pathname})
  }

  const filteredWorkspaces = workspaces
    ?.filter(workspace => workspace.name.toLowerCase().includes(searchValue.toLowerCase()))
    ?.filter(workspace => checked ? workspace.ownerId === user.id : true)

  return (
    <Box>
      <Grid>
        <Grid.Col xs={12} sm={6}>
          <TextInput placeholder={"Search workspace"} value={searchValue} onChange={setSearchValue}/>
        </Grid.Col>
        <Grid.Col xs={12} sm={6}>
          <CreateNewWorkspace/>
        </Grid.Col>
      </Grid>
      <Group position={"right"} my={12}>
        <Switch
          label="Only my workspaces"
          checked={checked}
          onChange={(event) => setChecked(event.currentTarget.checked)}
        />
      </Group>
      {filteredWorkspaces?.length ? (
        <SimpleGrid
          cols={4}
          my={24}
          breakpoints={[
            {maxWidth: 'md', cols: 3},
            {maxWidth: 'sm', cols: 2},
            {maxWidth: 'xs', cols: 1},
          ]}
        >
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
                              {w.collaborator.filter(c => c.user.email !== user.email).slice(2).map(c => <div
                                key={c.id}>{c.user.email}</div>)}
                            </>
                          }
                        >
                          <Avatar radius="xl"
                                  size={"sm"}>+{w.collaborator.filter(c => c.user.email !== user.email).slice(2).length}</Avatar>
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
        <Title order={3} align={"center"} mt={"50px"}>Nothing found, create you first workspace</Title>
      )}
    </Box>
  )
}

