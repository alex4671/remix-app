import {Paper, Title, Text, Button, Group} from "@mantine/core";
import type {MetaFunction} from "@remix-run/node";

export const meta: MetaFunction = () => {
  return {
    title: "Danger"
  };
};


export default function Danger() {
  return (
    <Paper shadow="0" p="md" withBorder mb={12}>
      <Title order={2}>Delete Account</Title>
      <Text color={"dimmed"}>Delete account and all associated data</Text>
      <Group my={12}>
        <Button color={"red"}>Delete</Button>
      </Group>
    </Paper>
  )
}