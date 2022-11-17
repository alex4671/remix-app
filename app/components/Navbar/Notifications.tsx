import {ActionIcon, Box, Button, Group, Indicator, Paper, Popover, ScrollArea, Text} from "@mantine/core";
import {IconBell} from "@tabler/icons";

export const Notifications = () => {
  return (
    <Popover position="bottom-end" withArrow shadow="md" >
      <Popover.Target>
        <Indicator size={8} offset={1} color="sky" mr={"xs"} >
          <ActionIcon>
            <IconBell size={18}/>
          </ActionIcon>
        </Indicator>
      </Popover.Target>
      <Popover.Dropdown maw={"400px"}>
        <Text mb={"sm"}>Notifications</Text>
        <ScrollArea offsetScrollbars>
          <Box h={"300px"}>

            <Paper withBorder p="md" mb={"lg"}>
              <Text>Paper is the most basic ui component</Text>
              <Group position={"right"} mt={"md"}>
                <Button color={"emerald"} compact>Ok</Button>
              </Group>
            </Paper>
            <Paper withBorder p="md" mb={"lg"}>
              <Text>Paper is the most basic ui component</Text>
              <Group position={"right"} mt={"md"}>
                <Button color={"emerald"} compact>Ok</Button>
              </Group>
            </Paper>
            <Paper withBorder p="md" mb={"lg"}>
              <Text>Paper is the most basic ui component</Text>
              <Group position={"right"} mt={"md"}>
                <Button color={"emerald"} compact>Ok</Button>
              </Group>
            </Paper>
            <Paper withBorder p="md" mb={"lg"}>
              <Text>Paper is the most basic ui component</Text>
              <Group position={"right"} mt={"md"}>
                <Button color={"emerald"} compact>Ok</Button>
              </Group>
            </Paper>
            <Paper withBorder p="md" mb={"lg"}>
              <Text>Paper is the most basic ui component</Text>
              <Group position={"right"} mt={"md"}>
                <Button color={"emerald"} compact>Ok</Button>
              </Group>
            </Paper>
            <Paper withBorder p="md" mb={"lg"}>
              <Text>Paper is the most basic ui component</Text>
              <Group position={"right"} mt={"md"}>
                <Button color={"emerald"} compact>Ok</Button>
              </Group>
            </Paper>
            <Paper withBorder p="md" mb={"lg"}>
              <Text>Paper is the most basic ui component</Text>
              <Group position={"right"} mt={"md"}>
                <Button color={"emerald"} compact>Ok</Button>
              </Group>
            </Paper>
            <Paper withBorder p="md" mb={"lg"}>
              <Text>Paper is the most basic ui component</Text>
              <Group position={"right"} mt={"md"}>
                <Button color={"emerald"} compact>Ok</Button>
              </Group>
            </Paper>
            <Paper withBorder p="md" mb={"lg"}>
              <Text>Paper is the most basic ui component</Text>
              <Group position={"right"} mt={"md"}>
                <Button color={"emerald"} compact>Ok</Button>
              </Group>
            </Paper>
            <Paper withBorder p="md" mb={"lg"}>
              <Text>Paper is the most basic ui component</Text>
              <Group position={"right"} mt={"md"}>
                <Button color={"emerald"} compact>Ok</Button>
              </Group>
            </Paper>
            <Paper withBorder p="md" mb={"lg"}>
              <Text>Paper is the most basic ui component</Text>
              <Group position={"right"} mt={"md"}>
                <Button color={"emerald"} compact>Ok</Button>
              </Group>
            </Paper>
            <Paper withBorder p="md" mb={"lg"}>
              <Text>Paper is the most basic ui component</Text>
              <Group position={"right"} mt={"md"}>
                <Button color={"emerald"} compact>Ok</Button>
              </Group>
            </Paper>
            <Paper withBorder p="md" mb={"lg"}>
              <Text>Paper is the most basic ui component</Text>
              <Group position={"right"} mt={"md"}>
                <Button color={"emerald"} compact>Ok</Button>
              </Group>
            </Paper>
            <Paper withBorder p="md" mb={"lg"}>
              <Text>Paper is the most basic ui component</Text>
              <Group position={"right"} mt={"md"}>
                <Button color={"emerald"} compact>Ok</Button>
              </Group>
            </Paper>
            <Paper withBorder p="md" mb={"lg"}>
              <Text>Paper is the most basic ui component</Text>
              <Group position={"right"} mt={"md"}>
                <Button color={"emerald"} compact>Ok</Button>
              </Group>
            </Paper>
            <Paper withBorder p="md" mb={"lg"}>
              <Text>Paper is the most basic ui component</Text>
              <Group position={"right"} mt={"md"}>
                <Button color={"emerald"} compact>Ok</Button>
              </Group>
            </Paper>
            <Paper withBorder p="md" mb={"lg"}>
              <Text>Paper is the most basic ui component</Text>
              <Group position={"right"} mt={"md"}>
                <Button color={"emerald"} compact>Ok</Button>
              </Group>
            </Paper>

          </Box>
        </ScrollArea>
      </Popover.Dropdown>
    </Popover>

  )
}
