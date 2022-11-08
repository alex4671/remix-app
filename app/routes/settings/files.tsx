import type {MetaFunction, LoaderArgs} from "@remix-run/node";
import {json} from "@remix-run/node";
import {FilesStorage} from "~/components/Settings/Files/FilesStorage";
import {FilesUsage} from "~/components/Settings/Files/FilesUsage";
import {FilesLatest} from "~/components/Settings/Files/FilesLatest";
import {requireUser} from "~/server/session.server";
import {getAllUserFiles} from "~/models/media.server";

export const meta: MetaFunction = () => {
  return {
    title: "Settings | Files"
  };
};

export const loader = async ({request}: LoaderArgs) => {
  const user = await requireUser(request)
  const userFiles = await getAllUserFiles(user.id)
  const userFilesSize = userFiles?.reduce((acc, item) => acc + item.size, 0)



  return json({
    userFiles,
    userFilesSize,
    maxSizeLimit: user.payment ? 3221225472 : 314572800 // 3gb vs 300mb
  })
}


export default function Files() {
  // const {userFiles, userFilesSize, maxSizeLimit} = useLoaderData<typeof loader>()

  return (
    <>
      <FilesStorage/>
      <FilesUsage/>
      <FilesLatest/>
    </>
  )
}
