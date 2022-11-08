import type {MetaFunction} from "@remix-run/node";
import {Box, Checkbox, Paper, Stack, Text, Title} from "@mantine/core";
import {useEffect, useState} from "react";
import {PrimaryButton} from "~/components/Buttons/PrimaryButton";
import {ActionArgs, json, LoaderArgs} from "@remix-run/node";
import {requireUser} from "~/server/session.server";
import {getAllUserFiles} from "~/models/media.server";
import {getUserNotifications, saveUserNotifications} from "~/models/notification.server";
import {Form, useActionData, useLoaderData} from "@remix-run/react";
import {saveFeedback} from "~/models/feedback.server";
import {showNotification} from "@mantine/notifications";
import {IconCheck, IconX} from "@tabler/icons";
import {getDefaultValue} from "@mantine/core/lib/Box/style-system-props/value-getters/get-default-value";

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

    return json({success: true, message: "Notification settings updated"})
  } catch (e) {
    return json({success: false, message: "Error updating notifications"})
  }
};

export default function Notifications() {
  const {userNotifications} = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()

  useEffect(() => {
    if (actionData) {
      showNotification({
        title: actionData?.message,
        message: undefined,
        color: actionData?.success ? "green" : "red",
        autoClose: 2000,
        icon: actionData?.success ? <IconCheck/> : <IconX/>
      })

    }
  }, [actionData])

  return (
    <Paper shadow="0" p="md" withBorder mb={24}>
      <Title order={2}>Notifications</Title>
      <Text mt={6} mb={12}>Manage you email notifications settings</Text>
      <Box>
        <Form method={"post"}>
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
        </Form>
      </Box>
    </Paper>
  )
}
