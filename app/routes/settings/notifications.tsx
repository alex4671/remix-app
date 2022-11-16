import type {MetaFunction,ActionArgs, LoaderArgs} from "@remix-run/node";
import { json} from "@remix-run/node";
import {Box, Checkbox, Paper, Stack, Text, Title} from "@mantine/core";
import {PrimaryButton} from "~/components/Buttons/PrimaryButton";
import {requireUser} from "~/server/session.server";
import {getUserNotifications, saveUserNotifications} from "~/models/notification.server";
import {useFetcher, useLoaderData} from "@remix-run/react";

export const meta: MetaFunction = () => {
  return {
    title: "Settings | Notifications"
  };
};

export const loader = async ({request}: LoaderArgs) => {
  const user = await requireUser(request)
  const userNotifications = await getUserNotifications(user.id)

  return json({
    userNotifications,
  })
}

export const action = async ({request}: ActionArgs) => {
  const user = await requireUser(request)
  const formData = await request.formData();

  const data = Object.fromEntries(formData)

  const notifications: Record<string, boolean> = {
    outOfSpace: false,
    deleteLargeNumberOfFiles: false,
    newCollaborator: false,
    newFeaturesAndUpdates: false,
    tips: false,
    sharedActivity: false,
    comments: false,
  }
  Object.keys(data)?.map(key => notifications[key] = true)

  try {
    await saveUserNotifications(user.id, notifications)

    return json({success: true, intent: "updateNotification", message: "Notification settings updated"})
  } catch (e) {
    return json({success: false, intent: "updateNotification", message: "Error updating notifications"})
  }
};

export default function Notifications() {
  const {userNotifications} = useLoaderData<typeof loader>()
  const fetcher = useFetcher()

  return (
    <Paper shadow="0" p="md" withBorder mb={24}>
      <Title order={2}>Notifications</Title>
      <Text mt={6} mb={12}>Manage you email notifications settings</Text>
      <Box>
        <fetcher.Form method={"post"}>
          <Stack align={"start"}>
            <Checkbox
              defaultChecked={userNotifications?.outOfSpace}
              name={"outOfSpace"}
              color={"dark"}
              label="I'm running out of space"
            />
            <Checkbox
              defaultChecked={userNotifications?.deleteLargeNumberOfFiles}
              name={"deleteLargeNumberOfFiles"}
              color={"dark"}
              label="I delete a large number of files"
            />
            <Checkbox
              defaultChecked={userNotifications?.newCollaborator}
              name={"newCollaborator"}
              color={"dark"}
              label="New collaborator added"
            />
            <Checkbox
              defaultChecked={userNotifications?.newFeaturesAndUpdates}
              name={"newFeaturesAndUpdates"}
              color={"dark"}
              label="New features and updates"
            />
            <Checkbox
              defaultChecked={userNotifications?.tips}
              name={"tips"}
              color={"dark"}
              label="Tips on using Files app"
            />
            <Checkbox
              defaultChecked={userNotifications?.sharedActivity}
              name={"sharedActivity"}
              color={"dark"}
              label="Activity in shared folders (weekly digest)"
            />
            <Checkbox
              defaultChecked={userNotifications?.comments}
              name={"comments"}
              color={"dark"}
              label="Comments, @mentions, to-dos"
            />
            <PrimaryButton type={"submit"} mt={12}>Save</PrimaryButton>
          </Stack>
        </fetcher.Form>
      </Box>
    </Paper>
  )
}
