import {requireUser} from "~/server/session.server";
import type { LoaderArgs} from "@remix-run/node";
import {json} from "@remix-run/node";


export async function loader({request}: LoaderArgs) {
  await requireUser(request)
  return json({});
}

export default function Index() {
  return (
    <div>App</div>
  );
}
