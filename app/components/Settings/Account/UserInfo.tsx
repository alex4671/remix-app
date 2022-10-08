import {Badge, Box, Button, Grid, Group, Paper, Text, TextInput, Title} from "@mantine/core";
import {useUser} from "~/utils/utils";

export const UserInfo = () => {
  const user = useUser()

  const isConfirmed = user.isConfirmed

  return (
    <Paper shadow="0" withBorder mb={12}>
      <Box p={"lg"}>
        <Title order={2}>Account</Title>
        <Text color={"dimmed"}>Change you email</Text>
        <Box my={12}>
          <Grid align={"center"}>
            <Grid.Col xs={12} sm={6}>
              <TextInput
                placeholder={user?.email}
                name={"email"}
                disabled={!isConfirmed}
              />
            </Grid.Col>
            <Grid.Col xs={12} sm={6}>
              <Group position={"right"}>
                <Badge color={isConfirmed ? "emerald" : "red"}>{isConfirmed ? "Confirmed" : "Unconfirmed"}</Badge>
                {!isConfirmed ? <Button color={"emerald"} compact>Resend confirmation</Button> : null}
              </Group>
            </Grid.Col>
          </Grid>

        </Box>
        <Box py={12}>
          <Button color={"emerald"}>Update email</Button>
        </Box>
      </Box>
    </Paper>
  )
}
