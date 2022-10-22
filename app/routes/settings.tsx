import {Outlet} from "@remix-run/react";
import {Grid, Title} from "@mantine/core";
import type {ActionArgs, LoaderArgs, MetaFunction} from "@remix-run/node";
import {json} from "@remix-run/node";
import {requireUser} from "~/server/session.server";
import {SettingsLinks} from "~/components/Settings/SettingsLinks";
import {saveFeedback} from "~/models/feedback.server";
import {Feedback} from "~/components/Settings/Feedback";

export const meta: MetaFunction = () => {
  return {
    title: "Settings"
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


export async function loader({request}: LoaderArgs) {
  await requireUser(request)
  return json({});
}

export default function Settings() {

  return (
    <>
      <Title order={1} my={24}>Settings</Title>
      <Grid>
        <Grid.Col xs={12} sm={2}>
          <SettingsLinks/>
        </Grid.Col>
        <Grid.Col xs={12} sm={10}>
          <Outlet/>
        </Grid.Col>
      </Grid>
      <Feedback />
    </>
  )
}
