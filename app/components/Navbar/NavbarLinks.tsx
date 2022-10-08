import {ActionIcon, Burger, createStyles, Group, Paper, Transition} from "@mantine/core";
import {IconBolt} from "@tabler/icons";
import {Link, useLocation, useNavigate} from "@remix-run/react";
import {useDisclosure} from "@mantine/hooks";

const useStyles = createStyles((theme) => ({
  link: {
    display: 'block',
    lineHeight: 1,
    padding: '8px 16px',
    textDecoration: 'none',
    color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.colors.gray[7],
    fontSize: theme.fontSizes.lg,
    fontWeight: 500,

    '&:hover': {
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[1],
    },

    [theme.fn.smallerThan('sm')]: {
      borderRadius: 0,
      padding: theme.spacing.md,
    },
  },

  linkActive: {
    '&, &:hover': {
      backgroundColor: theme.colorScheme === 'dark' ?  theme.colors.dark[4] : theme.colors.emerald[0],
      color: theme.colors.emerald[6],
    },
  },

  links: {
    [theme.fn.smallerThan('sm')]: {
      display: 'none',
    },
  },

  dropdown: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    zIndex: 2,
    borderTopRightRadius: 0,
    borderTopLeftRadius: 0,
    borderBottom: `1px solid ${theme.colors.gray[3]}`,
    boxShadow: theme.shadows.xl,
    overflow: 'hidden',

    [theme.fn.largerThan('sm')]: {
      display: 'none',
    },
  },

  burger: {
    [theme.fn.largerThan('sm')]: {
      display: 'none',
    },
  },

}));




export const NavbarLinks = () => {
  const { classes, cx } = useStyles();
  const [opened, { toggle, close }] = useDisclosure(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogoRedirect = () => {
    navigate("/");
  };

  const links = [
    {to: "/", isActive: location.pathname === "/", name: "Home"},
    {to: "settings/account", isActive: location.pathname.includes("/settings/"), name: "Settings"},
  ]

  const items = links.map(link => (
    <Link
      key={link.to}
      to={link.to}
      prefetch="intent"
      className={cx(classes.link, { [classes.linkActive]: link.isActive })}
      onClick={close}
    >
      {link.name}
    </Link>
  ))

  return (
    <>
      <Group spacing={0}>
        <ActionIcon size="xl" variant="transparent" mr={"xs"} onClick={handleLogoRedirect}>
          <IconBolt size={32} strokeWidth={1.5}/>
        </ActionIcon>
        <Group spacing={5} className={classes.links} ml={12}>
          {items}
        </Group>
        <Burger opened={opened} onClick={toggle} className={classes.burger} size="sm" />

        <Transition transition="pop" duration={200} mounted={opened}>
          {(styles) => (
            <Paper className={classes.dropdown} style={styles}>
              {items}
            </Paper>
          )}
        </Transition>
      </Group>
    </>
  )
}
