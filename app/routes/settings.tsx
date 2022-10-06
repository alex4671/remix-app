import {Link, Outlet, useLocation} from "@remix-run/react";
import {Grid, Stack, NavLink, Title} from "@mantine/core";
import {IconAlertCircle, IconCreditCard, IconUser, IconUsers} from "@tabler/icons";
import type { LoaderArgs} from "@remix-run/node";
import {json} from "@remix-run/node";
import {requireUser} from "~/server/session.server";

export async function loader({request}: LoaderArgs) {
  await requireUser(request)
  return json({});
}


export default function Settings() {
  const location = useLocation();

  return (
    <>
      <Title order={1} my={24}>Settings</Title>
      <Grid>
        <Grid.Col span={2}>
          <Stack spacing={0} sx={{position: "sticky", top: "20px" }}>
            <NavLink
              component={Link}
              to="./account"
              label="Account"
              icon={<IconUser size={16} stroke={1.5}/>}
              active={location.pathname.includes("account")}
              color="dark"
              variant="filled"
              prefetch={"intent"}
            />
            <NavLink
              component={Link}
              to="./pro"
              label="Pro"
              icon={<IconCreditCard size={16} stroke={1.5}/>}
              active={location.pathname.includes("pro")}
              color="dark"
              variant="filled"
              prefetch={"intent"}
            />
            <NavLink
              component={Link}
              to="./team"
              label="Team"
              icon={<IconUsers size={16} stroke={1.5}/>}
              active={location.pathname.includes("team")}
              color="dark"
              variant="filled"
              prefetch={"intent"}
              disabled
            />
            <NavLink
              component={Link}
              to="./danger"
              label="Danger zone"
              icon={<IconAlertCircle size={16} stroke={1.5}/>}
              active={location.pathname.includes("danger")}
              color="dark"
              variant="filled"
            />

          </Stack>
        </Grid.Col>
        <Grid.Col span={"auto"}>
          <Outlet/>
        </Grid.Col>
      </Grid>
    </>
  )
}
