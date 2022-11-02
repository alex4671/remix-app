import {useState} from "react";
import type {ActionArgs, LoaderArgs} from "@remix-run/node";
import {json} from "@remix-run/node";
import {requireUser} from "~/server/session.server";
import invariant from "tiny-invariant";
import {deleteFileFromS3, generateSignedUrl} from "~/models/storage.server";
import {deleteFile, deleteFiles, getUserFiles, getUserFilesSize, saveFiles, togglePublic} from "~/models/media.server";
import {getFileKey} from "~/utils/utils";
import {useInputState} from "@mantine/hooks";
import {UploadFile} from "~/components/MediaManager/UploadFile";
import {FilesGrid} from "~/components/MediaManager/FilesGrid";
import {FilesFilters} from "~/components/MediaManager/FilesFilters";
import dayjs from "dayjs";
import {useLoaderData} from "@remix-run/react";

// const MAX_SIZE_LIMIT_3GB = 3221225472
// const MAX_SIZE_LIMIT_300MB = 3145728000

export const loader = async ({request}: LoaderArgs) => {
  const url = new URL(request.url);
  const defaultFrom = url.searchParams.get("from");
  const defaultTo = url.searchParams.get("to");
  const user = await requireUser(request)

  const from = defaultFrom ? dayjs(defaultFrom, "DD-MM-YYYY").startOf("day").toDate() : undefined
  const to = defaultTo ? dayjs(defaultTo, "DD-MM-YYYY").endOf("day").toDate() : undefined

  const userFiles = await getUserFiles(user.id, from, to)

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
    const filesSize = await getUserFilesSize(user.id)
    const files = formData.getAll("file") as File[];

    const maxSizeLimit = user.payment ? 3221225472 : 314572800
    const newFilesSize = files.reduce((acc, file) => acc + file.size, 0)

    if (newFilesSize + (filesSize ?? 0) >= maxSizeLimit) {
      return json({success: false, intent, message: "Select other files or delete existing"})
    }

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

  if (intent === "togglePublic") {
    const checked = formData.get("checked")?.toString() ?? "";
    const fileId = formData.get("fileId")?.toString() ?? "";

    await togglePublic(fileId, checked === "true")
    return json({success: true, intent, message: `File now ${checked ? "Public" : "Private"}`})
  }

  return json({success: false, intent, message: "Some error"})
}


// todo maybe add valtio for state managment

export default function Media() {
  const {userFiles} = useLoaderData<typeof loader>()
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [selectedFilesUrls, setSelectedFilesUrls] = useState<string[]>([])
  const [searchValue, setSearchValue] = useInputState('');
  const [filterTypeValue, setFilterTypeValue] = useState<string[]>([]);

  // todo make limit usage in backend

  const filteredUserFiles = userFiles
    ?.filter(file => file.name.toLowerCase().includes(searchValue.toLowerCase()))
    ?.filter(file => filterTypeValue.length ? filterTypeValue.includes(file.type.split("/")[1]) : true)

  return (
    <>
      <UploadFile
        selectedFiles={selectedFiles}
        selectedFilesUrls={selectedFilesUrls}
        setSelectedFiles={setSelectedFiles}
        setSelectedFilesUrls={setSelectedFilesUrls}
        filteredUserFilesCount={filteredUserFiles.length}
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
        filteredUserFiles={filteredUserFiles}
        filterTypeValue={filterTypeValue}
        selectedFiles={selectedFiles}
      />

    </>
  )
}

