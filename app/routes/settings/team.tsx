import {
  ActionIcon,
  Button,
  CopyButton,
  Grid,
  Group,
  Mark,
  Menu,
  Paper,
  ScrollArea,
  Select,
  Table,
  Tabs,
  Text,
  TextInput,
  Title,
  Tooltip
} from "@mantine/core";
import {showNotification} from "@mantine/notifications";
import {IconCheck, IconCopy, IconDots, IconNote, IconReport, IconSend, IconTrash} from "@tabler/icons";
import {useState} from "react";
import type {MetaFunction} from "@remix-run/node";

export const meta: MetaFunction = () => {
  return {
    title: "Settings | Team"
  };
};

const members = [
  {id: "1", name: "Alex Kul", email: "alex@alex.com", role: 'Admin'},
  {id: "2", name: "John Milli", email: "john@gmail.com", role: 'Member'},
];

const invitations = [
  {
    id: "1",
    email: "newUser@alex.com",
    role: 'Admin',
    sendDate: new Date(),
    inviteLink: "http://localhost:3000/invite/123123-123123-qweqwe"
  },
  {
    id: "2",
    email: "secondnewUser@gmail.com",
    role: 'Member',
    sendDate: new Date(),
    inviteLink: "http://localhost:3000/invite/4553455-2344234-rewerrwe"
  },
];


export default function Team() {
  const [inviteLink, setInviteLink] = useState<string | null>(null)


  const memberRows = members.map((member) => (
    <tr key={member.id}>
      <td>{member.name}</td>
      <td>{member.email}</td>
      <td>{member.role}</td>
      <td>
        <Menu transition="pop" withArrow position="bottom-end" withinPortal>
          <Menu.Target>
            <ActionIcon>
              <IconDots size={16} stroke={1.5}/>
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item icon={<IconSend size={16} stroke={1.5}/>}>Send message</Menu.Item>
            <Menu.Item icon={<IconNote size={16} stroke={1.5}/>}>Add note</Menu.Item>
            <Menu.Item icon={<IconReport size={16} stroke={1.5}/>}>Analytics</Menu.Item>
            <Menu.Item icon={<IconTrash size={16} stroke={1.5}/>} color="red">Delete team member</Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </td>
    </tr>
  ));

  const invitationRows = invitations.map((invitation) => (
    <tr key={invitation.id}>
      <td>{invitation.email}</td>
      <td>{invitation.role}</td>
      <td>{invitation.sendDate.toISOString()}</td>
      <td>
        <Group spacing={0}>
          <Mark>{invitation.inviteLink}</Mark>
          <CopyButton value={invitation.inviteLink} timeout={2000}>
            {({copied, copy}) => (
              <Tooltip label={copied ? 'Copied' : 'Copy'} withArrow position="right">
                <ActionIcon color={copied ? 'teal' : 'gray'} onClick={copy}>
                  {copied ? <IconCheck size={16}/> : <IconCopy size={16}/>}
                </ActionIcon>
              </Tooltip>
            )}
          </CopyButton>

        </Group>
      </td>
    </tr>
  ));


  const handleSendInvite = () => {
    const invite = `${window.location.origin}/invite/${Math.random()}`
    setInviteLink(invite)

    showNotification({
      title: 'You invite generated',
      message: 'You can send link or send by email',
      color: "green",
      autoClose: 3000,
      icon: <IconCheck size={16}/>
    })
  }

  const handleLinkCopied = () => {
    showNotification({
      title: 'Link copied',
      message: 'You can send link to team member',
      color: "green",
      autoClose: 3000,
      icon: <IconCheck size={16}/>
    })
  }

  const handleSendEmail = () => {
    showNotification({
      title: 'Email sended',
      message: 'You can send link to team member',
      color: "green",
      autoClose: 3000,
      icon: <IconCheck size={16}/>
    })
  }


  return (
    <>
      <Paper shadow="0" p="md" withBorder mb={24}>
        <Title order={2}>Invite Team Member</Title>
        <Text mt={6} mb={12}>Enter the email of a team member you'd like to invite to the Alex Team team</Text>
        {inviteLink ? (
          <Group>
            <CopyButton value={inviteLink} timeout={2000}>
              {({copied, copy}) => (
                <Button variant={"filled"} color={"dark"} onClick={() => {
                  handleLinkCopied()
                  copy()
                }}>
                  {copied ? 'Copied url' : 'Copy URL and send to team member'}
                </Button>
              )}
            </CopyButton>

            <Text>Or</Text>
            <Button variant={"filled"} color={"dark"} onClick={handleSendEmail}>Send email to alex@alex.com</Button>
          </Group>
        ) : (
          <Grid align={"center"}>
            <Grid.Col xs={12} sm={6}>
              <TextInput
                placeholder="john@doe.com"
                label="Email"
              />
            </Grid.Col>
            <Grid.Col xs={12} sm={6}>
              <Group grow>
                <Select
                  label="Role"
                  data={[
                    {value: 'member', label: 'Member'},
                    {value: 'admin', label: 'Admin'},
                  ]}
                  defaultValue={"member"}
                />
                <Button variant={"filled"} color={"dark"} mt={25} onClick={handleSendInvite}>Generate invite</Button>
              </Group>
            </Grid.Col>
          </Grid>
        )}


      </Paper>

      <Paper shadow="0" p="md" withBorder mb={24}>
        <Tabs color="dark" variant="pills" radius="xs" defaultValue="members">
          <Tabs.List>
            <Tabs.Tab value="members">Members</Tabs.Tab>
            <Tabs.Tab value="invitations">Invitations</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="members" pt="xs">
            <ScrollArea>
              <Table
                sx={{minWidth: 400}}
                highlightOnHover
              >
                <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th></th>
                </tr>
                </thead>
                <tbody>{memberRows}</tbody>
              </Table>
            </ScrollArea>
          </Tabs.Panel>

          <Tabs.Panel value="invitations" pt="xs">
            <ScrollArea>
              <Table
                sx={{minWidth: 400}}
                highlightOnHover
              >
                <thead>
                <tr>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Send Date</th>
                  <th>Invite</th>
                </tr>
                </thead>
                <tbody>{invitationRows}</tbody>
              </Table>
            </ScrollArea>
          </Tabs.Panel>
        </Tabs>
      </Paper>

    </>

  )
}
