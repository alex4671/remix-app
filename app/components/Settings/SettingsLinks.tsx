import {createStyles, NavLink, Stack} from "@mantine/core";
import {Link, useLocation} from "@remix-run/react";
import {IconAlertCircle, IconCreditCard, IconUser, IconUsers} from "@tabler/icons";

const useStyles = createStyles((theme) => ({
  link: {
    color: theme.colorScheme === 'dark' ? theme.white : theme.colors.dark[5],

    '&:hover': {
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
    },

  },

  linkActive: {
    '&, &:hover': {
      backgroundColor: theme.colorScheme === 'dark' ?  theme.white : theme.colors.dark[6],
      color: theme.colorScheme === 'dark' ? theme.colors.dark[5]  : theme.white
    },
  },
}));


export const SettingsLinks = () => {
  const { classes, cx } = useStyles();
  const location = useLocation();

  return (
    <Stack spacing={0} sx={{position: "sticky", top: "20px" }}>
      <NavLink
        component={Link}
        to="./workspaces/my"
        label="Workspaces"
        icon={<IconUsers size={16} stroke={1.5}/>}
        className={cx(classes.link, { [classes.linkActive]: location.pathname.includes("workspaces") })}
        variant="filled"
        prefetch={"intent"}
      />
      <NavLink
        component={Link}
        to="./files"
        label="Files"
        icon={<IconUser size={16} stroke={1.5}/>}
        className={cx(classes.link, { [classes.linkActive]: location.pathname.includes("files") })}
        variant="filled"
        prefetch={"intent"}
      />
      <NavLink
        component={Link}
        to="./account"
        label="Account"
        icon={<IconUser size={16} stroke={1.5}/>}
        className={cx(classes.link, { [classes.linkActive]: location.pathname.includes("account") })}
        variant="filled"
        prefetch={"intent"}
      />
      <NavLink
        component={Link}
        to="./pro"
        label="Pro"
        icon={<IconCreditCard size={16} stroke={1.5}/>}
        className={cx(classes.link, { [classes.linkActive]: location.pathname.includes("pro") })}
        variant="filled"
        prefetch={"intent"}
      />
      {/*<NavLink*/}
      {/*  component={Link}*/}
      {/*  to="./old"*/}
      {/*  label="Pro Old"*/}
      {/*  icon={<IconCreditCard size={16} stroke={1.5}/>}*/}
      {/*  className={cx(classes.link, { [classes.linkActive]: location.pathname.includes("old") })}*/}
      {/*  variant="filled"*/}
      {/*  prefetch={"intent"}*/}
      {/*/>*/}

      <NavLink
        component={Link}
        to="./danger"
        label="Danger zone"
        icon={<IconAlertCircle size={16} stroke={1.5}/>}
        className={cx(classes.link, { [classes.linkActive]: location.pathname.includes("danger") })}
        variant="filled"
      />
    </Stack>
  )
}
