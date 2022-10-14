import type {LoaderFunction, MetaFunction} from "@remix-run/node";
import {json} from "@remix-run/node";
import {requireProUser} from "~/server/session.server";
import {Center, Title} from "@mantine/core";

export const meta: MetaFunction = () => {
  return {
    title: "Pro"
  };
};

export const loader: LoaderFunction = async ({request}) => {
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
