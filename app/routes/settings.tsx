import {Outlet} from "@remix-run/react";
import {Box, Grid, Stack, Title} from "@mantine/core";
import type {LoaderArgs, MetaFunction} from "@remix-run/node";
import {json} from "@remix-run/node";
import {requireUser} from "~/server/session.server";
import {DesktopOnly} from "~/components/Utils/DesktopOnly";
import {MobileOnly} from "~/components/Utils/MobileOnly";
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
      <MobileOnly>
        <Stack spacing={0}>
          <Box mb={12}>
            <SettingsLinks/>
          </Box>
          <Outlet/>
        </Stack>
      </MobileOnly>
      <DesktopOnly>
        <Grid>
          <Grid.Col span={2}>
            <SettingsLinks/>
          </Grid.Col>
          <Grid.Col span={"auto"}>
            <Outlet/>
          </Grid.Col>
        </Grid>
      </DesktopOnly>
    </>
  )
}
