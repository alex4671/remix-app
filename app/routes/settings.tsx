import {Outlet} from "@remix-run/react";
import {Grid, Title} from "@mantine/core";
import type {LoaderArgs, MetaFunction} from "@remix-run/node";
import {json} from "@remix-run/node";
import {requireUser} from "~/server/session.server";
import {SettingsLinks} from "~/components/Settings/SettingsLinks";

export const meta: MetaFunction = () => {
  return {
    title: "Settings"
  };
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
    </>
  )
}
