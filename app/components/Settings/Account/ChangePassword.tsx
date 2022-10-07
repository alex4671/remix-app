import {Box, Button, Paper, PasswordInput, Stack, Text, Title} from "@mantine/core";
import {Form} from "@remix-run/react";

export const ChangePassword = () => {
  return (
    <Paper shadow="0" withBorder mb={12}>
      <Form method={"post"}>
        <Box p={"lg"}>
          <Title order={2}>Password</Title>
          <Text color={"dimmed"}>Change you password</Text>
          <Box my={12}>
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
          </Box>
          <Box py={12}>
            <Button type={"submit"} name="intent" color={"emerald"} value="changePassword">Update password</Button>
          </Box>
        </Box>
      </Form>
    </Paper>
  )
}
