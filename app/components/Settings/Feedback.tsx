import {Affix, Group, Popover, Text, Textarea} from "@mantine/core";
import {SecondaryButton} from "~/components/Buttons/SecondaryButton";
import {IconCheck, IconMessage} from "@tabler/icons";
import {PrimaryButton} from "~/components/Buttons/PrimaryButton";
import {DesktopOnly} from "~/components/Utils/DesktopOnly";
import {useFetcher} from "@remix-run/react";
import type {ChangeEvent} from "react";
import { useEffect, useRef, useState} from "react";
import {showNotification} from "@mantine/notifications";

export const Feedback = () => {
  const fetcher = useFetcher()
  const formRef = useRef<HTMLFormElement>(null);

  const [opened, setOpened] = useState<boolean>(false);
  const [isDisabled, setIsDisabled] = useState<boolean>(true)

  useEffect(() => {
    if (fetcher?.data?.success) {
      showNotification({
        title: fetcher?.data.message,
        message: undefined,
        color: "green",
        autoClose: 2000,
        icon: <IconCheck/>
      })

      formRef?.current?.reset()
      setIsDisabled(true)
      setOpened(false)
    }
  }, [fetcher.data])

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setIsDisabled(!e.target.value)
  }

  return (
    <DesktopOnly>
      <Popover width={400} withArrow shadow="md" trapFocus opened={opened} onChange={setOpened}>
        <Popover.Target>
          <Affix position={{bottom: 20, right: 20}} onClick={() => setOpened((o) => !o)}>
            <SecondaryButton
              leftIcon={<IconMessage size={16}/>}
            >
              Feedback
            </SecondaryButton>
          </Affix>
        </Popover.Target>
        <Popover.Dropdown>
          <Text size={"lg"}>Feedback</Text>
          <fetcher.Form method={"post"}>
            <Textarea
              mt={12}
              placeholder="Your feedback"
              autosize
              minRows={4}
              name={"feedback"}
              required
              onChange={handleTextChange}
              error={!fetcher?.data?.success ? fetcher?.data?.message : null}
            />
            <Group my={12} position={"right"}>
              <PrimaryButton type={"submit"} disabled={isDisabled}>Send</PrimaryButton>
            </Group>
          </fetcher.Form>

        </Popover.Dropdown>
      </Popover>

    </DesktopOnly>
  )
}
