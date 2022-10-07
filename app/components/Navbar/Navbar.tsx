import {ColorSwitch} from "~/components/Navbar/ColorSwitch";
import {IconBolt} from "@tabler/icons";
import {ActionIcon, createStyles, Group} from "@mantine/core";
import {Link, useLocation, useNavigate} from "@remix-run/react";
import {NavbarMenu} from "~/components/Navbar/NavbarMenu";
import {NavbarLinks} from "~/components/Navbar/NavbarLinks";

export const Navbar = () => {
  return (
    <Group my={12} position={"apart"}>
      <NavbarLinks />
      <Group>
        <ColorSwitch/>
        <NavbarMenu/>
      </Group>
    </Group>
  )
}
