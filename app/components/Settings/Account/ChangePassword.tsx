import {Box, Button, Grid, Group, Paper, PasswordInput, Stack, Text, Title} from "@mantine/core";
import {Form} from "@remix-run/react";
import {InfoTooltip} from "~/components/Utils/InfoTooltip";

export const ChangePassword = () => {
  return (
    <Paper shadow="0" withBorder mb={12}>
      <Form method={"post"}>
        <Box p={"lg"}>
          <Title order={2}>Password</Title>
          <Group spacing={6}>
            <Text color={"dimmed"}>Change you password</Text>
            <InfoTooltip label={"Password mast be at least 8 characters."}/>
          </Group>
          <Box my={12}>
            <Grid align={"center"}>
              <Grid.Col xs={12} sm={6}>
                <Stack>
                  <PasswordInput
                    placeholder="Current password"
                    name={"password"}
                  />
                  <PasswordInput
                    placeholder="New password"
                    name={"newPassword"}
                  />
                </Stack>
              </Grid.Col>
            </Grid>
          </Box>
          <Box py={12}>
            <Button type={"submit"} name="intent" color={"emerald"} value="changePassword">Update password</Button>
          </Box>
        </Box>
      </Form>
    </Paper>
  )
}
