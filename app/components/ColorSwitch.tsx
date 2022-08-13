import {ActionIcon, Group} from "@mantine/core";
import {IconMoon, IconSun} from "@tabler/icons";
import {useFetcher, useMatches} from "@remix-run/react";

export const ColorSwitch = () => {
  const {theme} = useMatches()[0].data
  const fetcher = useFetcher()

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
    </Group>
  )
}
