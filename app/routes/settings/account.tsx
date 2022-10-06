import {Paper, Title} from "@mantine/core";
import type {MetaFunction} from "@remix-run/node";

export const meta: MetaFunction = () => {
  return {
    title: "Account"
  };
};


export default function Account() {
  return (
    <Paper shadow="0" p="md" withBorder mb={12}>
      <Title order={2}>Account Settings</Title>

    </Paper>)
}
