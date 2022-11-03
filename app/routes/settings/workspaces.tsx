import {Group, Paper, Tabs, Text, TextInput, Title} from "@mantine/core";
import {showNotification} from "@mantine/notifications";
import {IconCheck, IconMessageCircle, IconPhoto, IconX} from "@tabler/icons";
import {useEffect} from "react";
import type {MetaFunction} from "@remix-run/node";
import {ActionArgs, json, LoaderArgs} from "@remix-run/node";
import {requireUser} from "~/server/session.server";
import {Form, Outlet, useActionData} from "@remix-run/react";
import {PrimaryButton} from "~/components/Buttons/PrimaryButton";
import {createWorkspace} from "~/models/workspace.server";

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

    try {
      await createWorkspace(user.id, workspaceName)

      return json({success: true, intent, message: `Workspace ${workspaceName} created`})
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
        <Tabs defaultValue="you" color={"gray"}>
          <Tabs.List>
            <Tabs.Tab value="you" icon={<IconPhoto size={14}/>}>Yours workspaces</Tabs.Tab>
            <Tabs.Tab value="collaborate" icon={<IconMessageCircle size={14}/>}>Workspaces your member</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="you" pt="xs">
            <Outlet context={"workspaces"}/>
            <Form method={"post"}>
              <Group position={"right"} spacing={"xs"} mt={24}>
                <TextInput placeholder={"Workspace name"} name={"workspaceName"}/>
                <PrimaryButton type={"submit"} name={"intent"} value={"createWorkspace"}>Create new
                  workspace</PrimaryButton>
              </Group>
            </Form>
          </Tabs.Panel>

          <Tabs.Panel value="collaborate" pt="xs">
            <Outlet context={"collaborator"}/>
          </Tabs.Panel>

        </Tabs>
      </Paper>
    </>
  )
}
