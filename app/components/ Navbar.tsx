import {ColorSwitch} from "~/components/ColorSwitch";
import {IconBolt, IconLogout} from "@tabler/icons";
import {ActionIcon, Group} from "@mantine/core";
import {useNavigate, useSubmit} from "@remix-run/react";

export const Navbar = () => {
  const submit = useSubmit()
  const navigate = useNavigate();

  const handleLogout = () => {
    submit(null, { method: "post", action: "/logout" });
  };

  const handleLogoRedirect = () => {
    navigate("/");
  };

  return (
    <Group my={12} position={"apart"}>
      <Group>
        <ActionIcon size="xl" variant="transparent" mr={"xs"} onClick={handleLogoRedirect}>
          <IconBolt size={32} strokeWidth={1.5} />
        </ActionIcon>
      </Group>
      <Group position={"right"}>
        <ColorSwitch/>
        <ActionIcon title="Logout" onClick={handleLogout}>
          <IconLogout size={18}/>
        </ActionIcon>
      </Group>
    </Group>
  )
}
