import {useState} from "react";
import type {ActionArgs, LoaderArgs} from "@remix-run/node";
import {json} from "@remix-run/node";
import {requireUser} from "~/server/session.server";
import invariant from "tiny-invariant";
import {deleteFileFromS3, generateSignedUrl} from "~/models/storage.server";
import {deleteFile, deleteFiles, getUserFiles, saveFiles} from "~/models/media.server";
import {getFileKey} from "~/utils/utils";
import {useInputState} from "@mantine/hooks";
import {UploadFile} from "~/components/MediaManager/UploadFile";
import {FilesGrid} from "~/components/MediaManager/FilesGrid";
import {FilesFilters} from "~/components/MediaManager/FilesFilters";

// const MAX_SIZE_LIMIT_3GB = 3221225472
// const MAX_SIZE_LIMIT_300MB = 3145728000

export const loader = async ({request}: LoaderArgs) => {
  const user = await requireUser(request)

  const userFiles = await getUserFiles(user.id)

  const filesSize = userFiles?.reduce((acc, item) => acc + item.size, 0)


  return json({
    userFiles,
    filesSize,
    maxSizeLimit: user.payment ? 3221225472 : 314572800 // 3gb vs 300mb
  })
}

export const action = async ({request}: ActionArgs) => {
  const user = await requireUser(request)
  const {
    CLOUDFLARE_PUBLIC_FILE_URL,
  } = process.env;

  invariant(CLOUDFLARE_PUBLIC_FILE_URL, "CLOUDFLARE_PUBLIC_FILE_URL must be set")

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "uploadFiles") {
    const files = formData.getAll("file") as File[];

    const filesToDB = []

    for (const file of files) {
      const key = `${user.id}/files/${Date.now()}--${file.name}`

      try {
        const signedUrl = await generateSignedUrl(file.type, key)
        await fetch(signedUrl, {method: 'PUT', body: file});
        const fileUrl = `${CLOUDFLARE_PUBLIC_FILE_URL}/${key}`
        filesToDB.push({
          userId: user.id,
          fileUrl,
          name: file.name,
          size: file.size,
          type: file.type,
        })

      } catch (e) {
        return json({success: false, intent, message: "Error uploading file"})
      }
    }
    await saveFiles(filesToDB)


    return json({success: true, intent, message: `${filesToDB.length} files uploaded`})
  }

  if (intent === "deleteFile") {
    const fileId = formData.get("fileId")?.toString() ?? "";

    try {
      const file = await deleteFile(fileId)
      await deleteFileFromS3(getFileKey(file.fileUrl))

    } catch (e) {
      return json({success: false, intent, message: "Error deleting avatar"})
    }

    return json({success: true, intent, message: "File deleted"})
  }

  if (intent === "deleteFiles") {
    const filesIdsToDelete = formData.get("filesToDeleteIds")?.toString() ?? "";
    const filesUrlsToDelete = formData.get("filesToDeleteUrls")?.toString() ?? "";

    const parsedFilesIdsToDelete = JSON.parse(filesIdsToDelete)
    const parsedFilesUrlsToDelete = JSON.parse(filesUrlsToDelete)

    await deleteFiles(parsedFilesIdsToDelete)

    for (const url of parsedFilesUrlsToDelete) {
      await deleteFileFromS3(getFileKey(url))
    }

    return json({success: true, intent, message: `${parsedFilesIdsToDelete.length} files deleted`})
  }


  return json({success: false, intent, message: "Some error"})

}


export default function Media() {

  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [selectedFilesUrls, setSelectedFilesUrls] = useState<string[]>([])
  const [searchValue, setSearchValue] = useInputState('');
  const [filterTypeValue, setFilterTypeValue] = useState<string[]>([]);

  // todo make limit usage in backend
  return (
    <>
      <UploadFile
        selectedFiles={selectedFiles}
        selectedFilesUrls={selectedFilesUrls}
        setSelectedFiles={setSelectedFiles}
        setSelectedFilesUrls={setSelectedFilesUrls}
      />
      <FilesFilters
        filterTypeValue={filterTypeValue}
        searchValue={searchValue}
        setFilterTypeValue={setFilterTypeValue}
        setSearchValue={setSearchValue}
      />

      <FilesGrid
        setSelectedFiles={setSelectedFiles}
        setSelectedFilesUrls={setSelectedFilesUrls}
        searchValue={searchValue}
        filterTypeValue={filterTypeValue}
        selectedFiles={selectedFiles}
      />

    </>
  )
}

