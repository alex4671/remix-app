import {ActionIcon, Group} from "@mantine/core";
import {useFetcher, useMatches} from "@remix-run/react";
import {IconLogout, IconMoon, IconSun} from "@tabler/icons";

export const ColorSwitch = () => {
  const {theme} = useMatches()[0].data
  const fetcher = useFetcher()

  const handleLogout = () => {
    fetcher.submit(null, { method: "post", action: "/logout" });
  };

  return (
    <Group mt={12} position={"right"}>
      <fetcher.Form
        method="post"
        action="/api/set-theme"
      >
        {theme === "dark" ? (
          <ActionIcon color={"yellow"} title="Toggle color scheme" type={"submit"} name="theme" value={"light"}>
            <IconSun size={18}/>
          </ActionIcon>
        ) : (
          <ActionIcon color={"gray"} title="Toggle color scheme" type={"submit"} name="theme" value={"dark"}>
            <IconMoon size={18}/>
          </ActionIcon>
        )}
      </fetcher.Form>
      <ActionIcon title="Logout" onClick={handleLogout}>
        <IconLogout size={18}/>
      </ActionIcon>
    </Group>
  )
}
