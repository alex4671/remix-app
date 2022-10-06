import {ColorSwitch} from "~/components/Navbar/ColorSwitch";
import {IconBolt} from "@tabler/icons";
import {ActionIcon, createStyles, Group, Indicator} from "@mantine/core";
import {Link, useLocation, useNavigate} from "@remix-run/react";
import {NavbarMenu} from "~/components/Navbar/NavbarMenu";

const useStyles = createStyles((theme) => ({
  link: {
    display: 'block',
    lineHeight: 1,
    padding: '8px 12px',
    borderRadius: theme.radius.sm,
    textDecoration: 'none',
    color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.colors.gray[7],
    fontSize: theme.fontSizes.sm,
    fontWeight: 500,

    '&:hover': {
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[1],
    },
  },

  linkActive: {
    '&, &:hover': {
      backgroundColor: theme.fn.variant({ variant: 'light', color: theme.primaryColor }).background,
      color: theme.fn.variant({ variant: 'light', color: theme.primaryColor }).color,
    },
  },
}));


export const Navbar = () => {
  const { classes, cx } = useStyles();

  const navigate = useNavigate();
  const location = useLocation();

  const isPro = false

  const handleLogoRedirect = () => {
    navigate("/");
  };

  return (
    <Group my={12} position={"apart"}>
      <Group position={"left"} spacing={0}>
        <Indicator inline label="Pro" size={16} color={"purple"} offset={4} disabled={!isPro}>
          <ActionIcon size="xl" variant="transparent" mr={"xs"} onClick={handleLogoRedirect}>
            <IconBolt size={32} strokeWidth={1.5}/>
          </ActionIcon>
        </Indicator>
        <Group spacing={5}>
          <Link
            to={"/"}
            prefetch="intent"
            className={cx(classes.link, { [classes.linkActive]: location.pathname === "/" })}
          >
            Home
          </Link>
          <Link
            to={"settings/account"}
            prefetch="intent"
            className={cx(classes.link, { [classes.linkActive]: location.pathname.includes("/settings/") })}
          >
            Settings
          </Link>
        </Group>
      </Group>
      <Group position={"right"}>

        {/*<Tooltip label={"Unconfirmed"} disabled={user.isConfirmed}>*/}
        {/*  <Text>{user.email}</Text>*/}
        {/*</Tooltip>*/}
        {/*{!user.isConfirmed ? (*/}
        {/*  <Tooltip label="Resend confirmation">*/}
        {/*    <ActionIcon>*/}
        {/*      <IconReload size={18}/>*/}
        {/*    </ActionIcon>*/}
        {/*  </Tooltip>*/}

        {/*) : null}*/}
        <ColorSwitch/>
        <NavbarMenu/>
      </Group>
    </Group>
  )
}
