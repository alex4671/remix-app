import {ActionIcon, createStyles, Group} from "@mantine/core";
import {IconBolt} from "@tabler/icons";
import {Link, useLocation, useNavigate} from "@remix-run/react";

const useStyles = createStyles((theme) => ({
  link: {
    display: 'block',
    lineHeight: 1,
    padding: '8px 12px',
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

export const NavbarLinks = () => {
  const { classes, cx } = useStyles();

  const navigate = useNavigate();
  const location = useLocation();

  const handleLogoRedirect = () => {
    navigate("/");
  };

  return (
    <Group spacing={0}>
      <ActionIcon size="xl" variant="transparent" mr={"xs"} onClick={handleLogoRedirect}>
        <IconBolt size={32} strokeWidth={1.5}/>
      </ActionIcon>
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
  )
}
