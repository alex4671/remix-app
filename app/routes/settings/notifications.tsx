import type {MetaFunction} from "@remix-run/node";
import {Box, Checkbox, Paper, Text, Title} from "@mantine/core";
import {useState} from "react";
import {PrimaryButton} from "~/components/Buttons/PrimaryButton";

export const meta: MetaFunction = () => {
  return {
    title: "Settings | Notifications"
  };
};

export default function Notifications() {
  const [value, setValue] = useState<string[]>([]);
  return (
    <Paper shadow="0" p="md" withBorder mb={24}>
      <Title order={2}>Notifications</Title>
      <Text mt={6} mb={12}>Manage you email notifications settings</Text>
      <Box>
        <Checkbox.Group
          orientation="vertical"
          value={value}
          onChange={setValue}
        >
          <Checkbox color={"dark"} value="outOfSpace" label="I'm running out of space" />
          <Checkbox color={"dark"} value="deleteLargeNumberOfFiles" label="I delete a large number of files" />
          <Checkbox color={"dark"} value="newCollaborator" label="New collaborator added" />
          <Checkbox color={"dark"} value="newFeaturesAndUpdates" label="New features and updates" />
          <Checkbox color={"dark"} value="tips" label="Tips on using Files app" />
          <Checkbox color={"dark"} value="sharedActivity" label="Activity in shared folders (weekly digest)" />
          <Checkbox color={"dark"} value="comments" label="Comments, @mentions, to-dos" />
        </Checkbox.Group>
        <PrimaryButton mt={12}>Save</PrimaryButton>
      </Box>
    </Paper>
  )
}
