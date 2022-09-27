import {ColorSwitch} from "~/components/Navbar/ColorSwitch";
import {IconBolt, IconLogout} from "@tabler/icons";
import {ActionIcon, Group, Indicator, Text} from "@mantine/core";
import {useNavigate, useSubmit} from "@remix-run/react";
import {useUser} from "~/utils/utils";

export const Navbar = () => {
  const user = useUser()
  const submit = useSubmit()
  const navigate = useNavigate();

  const isPro = false

  const handleLogout = () => {
    submit(null, { method: "post", action: "/logout" });
  };

  const handleLogoRedirect = () => {
    navigate("/");
  };

  return (
    <Group my={12} position={"apart"}>
      <Group>
        <Indicator inline label="Pro" size={16} color={"purple"} offset={4} disabled={!isPro}>
          <ActionIcon size="xl" variant="transparent" mr={"xs"} onClick={handleLogoRedirect}>
            <IconBolt size={32} strokeWidth={1.5} />
          </ActionIcon>
        </Indicator>
      </Group>
      <Group position={"right"}>
        <Text>{user.email}</Text>
        <ColorSwitch/>
        <ActionIcon title="Logout" onClick={handleLogout}>
          <IconLogout size={18}/>
        </ActionIcon>
      </Group>
    </Group>
  )
}
