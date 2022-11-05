import {Group, TextInput} from "@mantine/core";
import {PrimaryButton} from "~/components/Buttons/PrimaryButton";
import {useFetcher} from "@remix-run/react";
import {useInputState} from "@mantine/hooks";

export const CreateNewWorkspace = () => {
  const fetcher = useFetcher()
  const [value, setValue] = useInputState('');

  const handleCreateWorkspace = () => {

    fetcher.submit({
      intent: "createWorkspace",
      workspaceName: value,
    }, {
      method: "post",
      action: "/settings/workspaces"
    })
    setValue("")
  }

  return (
    <Group position={"right"}>
      <TextInput placeholder={"Workspace name"} value={value} onChange={setValue}/>
      <PrimaryButton onClick={handleCreateWorkspace}>Create new workspace</PrimaryButton>
    </Group>
  )
}
