import {NavLink, Stack} from "@mantine/core";
import {Link, useLocation} from "@remix-run/react";
import {IconAlertCircle, IconCreditCard, IconUser, IconUsers} from "@tabler/icons";

export const SettingsLinks = () => {
  const location = useLocation();

  return (
    <Stack spacing={0} sx={{position: "sticky", top: "20px" }}>
      <NavLink
        component={Link}
        to="./account"
        label="Account"
        icon={<IconUser size={16} stroke={1.5}/>}
        active={location.pathname.includes("account")}
        color="dark"
        variant="filled"
        prefetch={"intent"}
      />
      <NavLink
        component={Link}
        to="./pro"
        label="Pro"
        icon={<IconCreditCard size={16} stroke={1.5}/>}
        active={location.pathname.includes("pro")}
        color="dark"
        variant="filled"
        prefetch={"intent"}
      />
      <NavLink
        component={Link}
        to="./team"
        label="Team"
        icon={<IconUsers size={16} stroke={1.5}/>}
        active={location.pathname.includes("team")}
        color="dark"
        variant="filled"
        prefetch={"intent"}
        disabled
      />
      <NavLink
        component={Link}
        to="./danger"
        label="Danger zone"
        icon={<IconAlertCircle size={16} stroke={1.5}/>}
        active={location.pathname.includes("danger")}
        color="dark"
        variant="filled"
      />
    </Stack>
  )
}
