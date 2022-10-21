import {Form, useActionData} from "@remix-run/react";
import {Box, Group, Paper, Text, Textarea, Title} from "@mantine/core";
import {PrimaryButton} from "~/components/Buttons/PrimaryButton";
import type {ActionArgs, MetaFunction} from "@remix-run/node";
import {json} from "@remix-run/node";
import {requireUser} from "~/server/session.server";
import {saveFeedback} from "~/models/feedback.server";
import {useEffect, useRef} from "react";
import {showNotification} from "@mantine/notifications";
import {IconCheck} from "@tabler/icons";

export const meta: MetaFunction = () => {
  return {
    title: "Settings | Feedback"
  };
};

export const action = async ({request}: ActionArgs) => {
  const user = await requireUser(request)
  const formData = await request.formData();
  const feedback = formData.get("feedback")?.toString() ?? "";

  if (feedback.length) {
    await saveFeedback(user.id, user.email, feedback)
    return json({success: true, message: "Feedback send"})
  } else {
    return json({success: false, message: "Feedback can't be empty"})
  }


};


export default function Feedback() {
  const data = useActionData<typeof action>()
  const formRef = useRef<HTMLFormElement>(null);


  // todo add client side validation
  useEffect(() => {
    if (data?.success) {
      showNotification({
        title: data.message,
        message: undefined,
        color: "green",
        autoClose: 2000,
        icon: <IconCheck />
      })

      formRef?.current?.reset()
    }
  }, [data])


  return (
    <>
      <Paper shadow="0" withBorder mb={12}>
        <Box p={"lg"}>
          <Title order={2}>Feedback</Title>
          <Text color={"dimmed"}>You can give feedback about product or ask question</Text>
          <Box my={12}>
            <Form method={"post"} ref={formRef}>
              <Textarea
                placeholder="Your feedback"
                autosize
                minRows={4}
                name={"feedback"}
                error={!data?.success ? data?.message : null}
              />
              <Group my={12} position={"right"}>
                <PrimaryButton type={"submit"}>Send</PrimaryButton>
              </Group>
            </Form>
          </Box>
        </Box>
      </Paper>
    </>
  )
}
