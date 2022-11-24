import type {LoaderArgs, MetaFunction} from "@remix-run/node";
import {json} from "@remix-run/node";
import {requireProUser} from "~/server/session.server";
import {Center, Title} from "@mantine/core";
import { GenericErrorBoundary } from "~/components/Errors/GenericErrorBoundary";
import { GenericCatchBoundary } from "~/components/Errors/GenericCatchBoundary";

export const meta: MetaFunction = () => {
  return {
    title: "Pro"
  };
};

export const loader = async ({request}: LoaderArgs) => {
  await requireProUser(request)

  return json({});
};
export default function Pro() {

  return (
    <Center>
      <Title order={2} align={"center"} mt={48}>Route for pro</Title>
    </Center>
  )
}

export {
  GenericCatchBoundary as CatchBoundary,
  GenericErrorBoundary as ErrorBoundary,
};
