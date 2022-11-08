import type {LoaderArgs} from "@remix-run/node";
import {json, redirect} from "@remix-run/node";
import {getFileById} from "~/models/media.server";
import {useLoaderData} from "@remix-run/react";
import {AspectRatio, Box, Image, Text} from "@mantine/core";
import {upperFirst} from "@mantine/hooks";
import {VideoPlayer} from "~/components/MediaView/VideoPlayer";
// import playerUrl from "~/components/MediaView/videoPlayer.css";

// export function links() {
//   return [
//     { rel: "stylesheet", href: playerUrl },
//   ];
// }

export const loader = async ({request, params}: LoaderArgs) => {
  const fileId = params.fileId;


  if (fileId) {
    const file = await getFileById(fileId)

    if (file?.public) {
      return json({file})
    } else {

      return redirect("/")
    }
  }
  return redirect("/")
}


export default function File() {
  const {file} = useLoaderData<typeof loader>()

  return (
    <Box pt={40}>
      <AspectRatio ratio={16 / 9}>
        {file.type.includes("image") ? (
          <Image
            src={file.fileUrl}
            alt={file.fileUrl}
          />
        ) : file.type.includes("video") ? (
          // <VideoPlayer src={file.fileUrl}/>
          <video controls preload="metadata">
            <source src={`${file.fileUrl}#t=0.5`} type={file.type}/>
          </video>
        ) : file.type.includes("audio") ? (
          <Box
            sx={(theme) => ({background: theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[2]})}>
            <audio controls>
              <source src={file.fileUrl} type={file.type}/>
            </audio>
          </Box>
        ) : file.type.includes("pdf") ? (
          <embed
            type={file.type}
            src={file.fileUrl}
          />
        ) : (
          <Box
            sx={(theme) => ({background: theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[2]})}
          >
            <Text align={"center"}>{upperFirst(file.type.split("/")[1])}</Text>
          </Box>
        )}

      </AspectRatio>
    </Box>
  )
}
