import {ActionIcon} from "@mantine/core";
import {useFetcher} from "@remix-run/react";
import {IconMoon, IconSun} from "@tabler/icons";
import {useAppTheme} from "~/utils/utils";
import {LoadingProgress} from "~/components/Utils/LoadingProgress";
import {useHotkeys} from "@mantine/hooks";

export const ColorSwitch = () => {
  const theme = useAppTheme()
  const fetcher = useFetcher()

  useHotkeys([
    ['mod+J', () => {
      fetcher.submit({theme: theme === "dark" ? "light" : "dark"}, {method: "post", action: "/api/set-theme"})
    }],
  ]);

  return (
    <>
      <LoadingProgress state={fetcher.state}/>
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
    </>
  )
}
