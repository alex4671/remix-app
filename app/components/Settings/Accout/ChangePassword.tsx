import {Box, Button, Paper, PasswordInput, Text, Title} from "@mantine/core";
import {Form} from "@remix-run/react";

export const ChangePassword = () => {
  return (
    <Paper shadow="0" withBorder mb={12}>
      <Form method={"post"}>
        <Box p={"lg"}>
          <Title order={2}>Password</Title>
          <Text color={"dimmed"}>Change you password</Text>
          <Box my={12}>
            <PasswordInput
              label="Current password"
              name={"password"}
            />
            <PasswordInput
              label="New password"
              name={"newPassword"}
            />
          </Box>
          <Box py={12}>
            <Button type={"submit"} name="intent" color={"grape"} value="changePassword">Update password</Button>
          </Box>
        </Box>
      </Form>
    </Paper>
  )
}
