import {Group, TextInput} from "@mantine/core";
import {PrimaryButton} from "~/components/Buttons/PrimaryButton";
import {useFetcher} from "@remix-run/react";
import {HiddenSessionId} from "~/components/Utils/HiddenSessionId";
import {useEffect, useRef} from "react";

export const CreateNewWorkspace = () => {
  const fetcher = useFetcher()
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (fetcher?.data) {
      formRef?.current?.reset()

    }
  }, [fetcher?.data])

  return (
    <fetcher.Form method={"post"} action={"/settings/workspaces"} ref={formRef}>
      <Group position={"right"}>
        <HiddenSessionId/>
        <TextInput placeholder={"Workspace name"} required/>
        <PrimaryButton type={"submit"} name={"intent"} value={"createWorkspace"}>Create new workspace</PrimaryButton>
      </Group>
    </fetcher.Form>
  )
}
