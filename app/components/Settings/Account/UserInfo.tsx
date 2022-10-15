import {Badge, Box, Button, Grid, Group, Paper, Text, TextInput, Title} from "@mantine/core";
import {Form} from "@remix-run/react";

interface Props {
  email: string;
  isConfirmed: boolean;
}

export const UserInfo = ({email, isConfirmed}: Props) => {
  return (
    <Paper shadow="0" withBorder mb={12}>
      <Box p={"lg"}>
        <Group>
          <Title order={2}>Account</Title>
          <Badge color={isConfirmed ? "emerald" : "red"}>{isConfirmed ? "Confirmed" : "Unconfirmed"}</Badge>
        </Group>
        <Text color={"dimmed"}>Change you email</Text>
        <Box my={12}>
          <Grid align={"center"}>
            <Grid.Col xs={12} sm={6}>
              <TextInput
                placeholder={email}
                name={"email"}
                disabled={!isConfirmed}
              />
            </Grid.Col>
            {!isConfirmed ? (
              <Grid.Col xs={12} sm={6}>
                <Group position={"right"}>
                  <Form method={"post"}>
                    <Button type={"submit"} name={"intent"} value={"sendInvite"} color={"emerald"} compact>Resend confirmation</Button>
                  </Form>
                </Group>
              </Grid.Col>
            ) : null}

          </Grid>

        </Box>
        <Box py={12}>
          <Button color={"emerald"}>Update email</Button>
        </Box>
      </Box>
    </Paper>
  )
}
