import {ActionIcon, Burger, createStyles, Group, Paper, Transition} from "@mantine/core";
import {IconBolt} from "@tabler/icons";
import {Link, useLocation, useNavigate} from "@remix-run/react";
import {useClickOutside, useDisclosure} from "@mantine/hooks";

const useStyles = createStyles((theme) => ({
  link: {
    display: 'block',
    lineHeight: 1,
    padding: '8px 16px',
    textDecoration: 'none',
    color: theme.colorScheme === 'dark' ? theme.white : theme.colors.dark[5],
    fontSize: theme.fontSizes.lg,
    fontWeight: 500,

    '&:hover': {
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
    },

    [theme.fn.smallerThan('sm')]: {
      borderRadius: 0,
      padding: theme.spacing.md,
      fontSize: theme.fontSizes.sm,
    },
  },

  linkActive: {
    '&, &:hover': {
      backgroundColor: theme.colorScheme === 'dark' ?  theme.colors.dark[4] : theme.colors.gray[1],
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
    borderBottom: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[1]}`,
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
  const ref = useClickOutside(() => close());
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogoRedirect = () => {
    navigate("/");
    close()
  };

  const links = [
    {to: "/", isActive: location.pathname === "/", name: "Home"},
    {to: "settings/account", isActive: location.pathname.includes("/settings/"), name: "Settings"},
    {to: "pro", isActive: location.pathname === "/pro" || location.pathname === "/require-pro", name: "Pro"},
    {to: "media", isActive:  location.pathname === "/media", name: "Media Library"},
  ]

  const items = links.map(link => (
    <Link
      key={link.to}
      to={link.to}
      // prefetch="intent"
      className={cx(classes.link, { [classes.linkActive]: link.isActive })}
      onClick={close}
    >
      {link.name}
    </Link>
  ))

  return (
    <>
      <Group spacing={0} ref={ref}>
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
