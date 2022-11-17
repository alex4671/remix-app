import {ColorSwitch} from "~/components/Navbar/ColorSwitch";
import {Group} from "@mantine/core";
import {NavbarMenu} from "~/components/Navbar/NavbarMenu";
import {NavbarLinks} from "~/components/Navbar/NavbarLinks";
import {Notifications} from "~/components/Navbar/Notifications";

export const Navbar = () => {
  return (
    <Group my={12} position={"apart"}>
      <NavbarLinks />
      <Group spacing={6}>
        {/*<Notifications/>*/}
        <ColorSwitch/>
        <NavbarMenu/>
      </Group>
    </Group>
  )
}
