import {Box, Group, Paper, Text, Title} from "@mantine/core";
import {showNotification} from "@mantine/notifications";
import {IconCheck, IconX} from "@tabler/icons";
import {useEffect} from "react";
import type {ActionArgs, LoaderArgs, MetaFunction} from "@remix-run/node";
import {json} from "@remix-run/node";
import {requireUser} from "~/server/session.server";
import {Link, Outlet, useActionData} from "@remix-run/react";
import {createWorkspace, getUserWorkspacesById, updateWorkspaceSortOrder} from "~/models/workspace.server";
import {emitter} from "~/server/emitter.server";
import {EventType} from "~/hooks/useSubscription";
import {generateKeyBetween} from "~/utils/generateIndex";
import {CreateNewWorkspace} from "~/components/Settings/Workspaces/CreateNewWorkspace";

export const meta: MetaFunction = () => {
  return {
    title: "Settings | Workspaces"
  };
};


export const loader = async ({request}: LoaderArgs) => {
  await requireUser(request)

  return json({})
}

export const action = async ({request}: ActionArgs) => {
  const user = await requireUser(request)

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "createWorkspace") {
    const workspaceName = formData.get("workspaceName")?.toString() ?? "";

    const workspaces = await getUserWorkspacesById(user.id)

    const lastSortIndexValue = workspaces
      ?.sort((a, b) => a.sortIndex < b.sortIndex ? -1 : a.sortIndex > b.sortIndex ? 1 : 0)
      ?.at(-1)?.sortIndex

    try {
      const nextSortIndex = !lastSortIndexValue
        ? generateKeyBetween(null, null)
        : generateKeyBetween(lastSortIndexValue, null);

      await createWorkspace(user.id, workspaceName, nextSortIndex)

      emitter.emit(EventType.CREATE_WORKSPACE)

      return json({success: true, intent, message: `Workspace ${workspaceName} created`})
    } catch (e) {
      return json({success: false, intent, message: "Error creating workspace"})
    }
  }


  if (intent === "changeSortOrder") {
    const workspaceId = formData.get("workspaceId")?.toString() ?? "";
    const newSortIndex = formData.get("newSortIndex")?.toString() ?? "";

    try {

      await updateWorkspaceSortOrder(workspaceId, newSortIndex)

      emitter.emit(EventType.REORDER_WORKSPACE)

      return json({success: true, intent, message: `REMOVE Sort index updated`})
    } catch (e) {
      return json({success: false, intent, message: "Error creating workspace"})
    }
  }


  return json({success: false, intent, message: "Some error"})
}


export default function Workspaces() {
  const data = useActionData<typeof action>()


  useEffect(() => {
    if (data) {
      showNotification({
        title: data?.message,
        message: undefined,
        color: data?.success ? "green" : "red",
        autoClose: 2000,
        icon: data?.success ? <IconCheck/> : <IconX/>
      })
    }
  }, [data])



  return (
    <>
      <Paper shadow="0" p="md" withBorder mb={24}>
        <Title order={2}>Manage workspaces</Title>
        <Text mt={6} mb={12}>Manage your workspaces and invite members</Text>
        <CreateNewWorkspace />
      </Paper>
      <Paper shadow="0" p="md" withBorder mb={24}>
        <Group spacing={0}>
          <Box
            component={Link}
            to="./my"
            sx={theme => ({
              display: 'block',
              lineHeight: 1,
              padding: '8px 16px',
              textDecoration: 'none',
              color: theme.colorScheme === 'dark' ? theme.white : theme.colors.dark[5],
              fontSize: theme.fontSizes.lg,
              fontWeight: 500,

              '&:hover': {
                backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
              },
            })}
          >
            My Workspaces
          </Box>
          <Box
            component={Link}
            to="./collaborated"
            sx={theme => ({
              display: 'block',
              lineHeight: 1,
              padding: '8px 16px',
              textDecoration: 'none',
              color: theme.colorScheme === 'dark' ? theme.white : theme.colors.dark[5],
              fontSize: theme.fontSizes.lg,
              fontWeight: 500,

              '&:hover': {
                backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
              },
            })}
          >
            Collaborated
          </Box>
        </Group>
        <Outlet/>
      </Paper>

    </>
  )
}
