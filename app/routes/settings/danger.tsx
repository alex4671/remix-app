import type {ActionArgs, MetaFunction} from "@remix-run/node";
import {DeleteAccount} from "~/components/Settings/Danger/DeletaAccount";
import {logout, requireUserId} from "~/server/session.server";
import {deleteUserById} from "~/models/user.server";

export const meta: MetaFunction = () => {
  return {
    title: "Danger"
  };
};

export const action = async ({ request }: ActionArgs) => {
  const userId = await requireUserId(request)

  await deleteUserById(userId)
  // todo delete all user data
  console.log("Account deleted...");

  return logout(request);
};

export default function Danger() {
  return (
    <>
      <DeleteAccount/>
    </>
  )
}
