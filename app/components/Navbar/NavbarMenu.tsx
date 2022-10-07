import {Avatar, createStyles, Group, Indicator, Menu, Text, UnstyledButton} from "@mantine/core";
import {
  IconChevronDown,
  IconHeart,
  IconLogout,
  IconMessage,
  IconPlayerPause,
  IconSettings,
  IconStar,
  IconSwitchHorizontal,
  IconTrash
} from "@tabler/icons";
import {useState} from "react";
import {useUser} from "~/utils/utils";
import {Link, useSubmit} from "@remix-run/react";

const useStyles = createStyles((theme) => ({
  user: {
    color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.black,
    padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
    transition: 'background-color 100ms ease',

    '&:hover': {
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[1],
    },
  },

  userActive: {
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.white,
  },
}));

export const NavbarMenu = () => {
  const user = useUser()
  const submit = useSubmit()
  const {classes, theme, cx} = useStyles();
  const [userMenuOpened, setUserMenuOpened] = useState(false);

  const handleLogout = () => {
    submit(null, {method: "post", action: "/logout"});
  };

  // @ts-ignore
  const isPro = user?.payment

  return (
    <Menu
      width={260}
      position="bottom-end"
      transition="pop-top-right"
      onClose={() => setUserMenuOpened(false)}
      onOpen={() => setUserMenuOpened(true)}
    >
      <Menu.Target>
        <UnstyledButton
          className={cx(classes.user, {[classes.userActive]: userMenuOpened})}
        >
          <Group spacing={7}>
            <Indicator size={8} offset={1} color="grape" disabled={!isPro}>
              <Avatar
                src={user.avatarUrl}
                alt={user.email}
                radius="xl"
                size={24}
              />
            </Indicator>

            <Text weight={500} size="sm" sx={{lineHeight: 1}} mr={3}>
              {user.email}
            </Text>
            <IconChevronDown size={12} stroke={1.5}/>
          </Group>
        </UnstyledButton>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item icon={<IconHeart size={14} color={theme.colors.red[6]} stroke={1.5}/>} disabled>
          Liked posts
        </Menu.Item>
        <Menu.Item icon={<IconStar size={14} color={theme.colors.yellow[6]} stroke={1.5}/>} disabled>
          Saved posts
        </Menu.Item>
        <Menu.Item icon={<IconMessage size={14} color={theme.colors.blue[6]} stroke={1.5}/>} disabled>
          Your comments
        </Menu.Item>

        <Menu.Label>Settings</Menu.Label>
        <Menu.Item component={Link} to={"/settings/account"} icon={<IconSettings size={14} stroke={1.5}/>}>Account
          settings</Menu.Item>
        <Menu.Item icon={<IconSwitchHorizontal size={14} stroke={1.5}/>} disabled>
          Change account
        </Menu.Item>

        <Menu.Divider/>

        <Menu.Label>Danger zone</Menu.Label>
        <Menu.Item icon={<IconPlayerPause size={14} stroke={1.5}/>} disabled>
          Pause subscription
        </Menu.Item>
        <Menu.Item color="red" icon={<IconTrash size={14} stroke={1.5}/>} disabled>
          Delete account
        </Menu.Item>
        <Menu.Item icon={<IconLogout size={14} stroke={1.5}/>} onClick={handleLogout}>Logout</Menu.Item>
      </Menu.Dropdown>
    </Menu>
  )
}
