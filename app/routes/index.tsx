import {requireUser} from "~/server/session.server";
import type {LoaderArgs} from "@remix-run/node";
import {json} from "@remix-run/node";
import {Stack} from "@mantine/core";
import {PrimaryButton} from "~/components/Buttons/PrimaryButton";
import {SecondaryButton} from "~/components/Buttons/SecondaryButton";
import {DashedButton} from "~/components/Buttons/DashedButton";
import {DangerButton} from "~/components/Buttons/DangerButtom";
import {IconDatabase} from "@tabler/icons";


export async function loader({request}: LoaderArgs) {
  await requireUser(request)
  return json({});
}

export default function Index() {

  return (
    <>
      <div>App</div>
      <Stack align={"start"}>
        <PrimaryButton>PrimaryButton</PrimaryButton>
        <SecondaryButton>SecondaryButton</SecondaryButton>
        <DangerButton>DangerButton</DangerButton>
        <DashedButton leftIcon={<IconDatabase size={16} />}>DashedButton</DashedButton>
      </Stack>
    </>
  );
}
