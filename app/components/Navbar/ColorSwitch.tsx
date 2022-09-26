import {ActionIcon} from "@mantine/core";
import {useFetcher} from "@remix-run/react";
import {IconMoon, IconSun} from "@tabler/icons";
import {useAppTheme} from "~/utils/utils";

export const ColorSwitch = () => {
  const theme = useAppTheme()
  const fetcher = useFetcher()

  return (
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
  )
}
