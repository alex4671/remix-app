import type {ActionArgs, LoaderArgs} from "@remix-run/node";
import {json, redirect} from "@remix-run/node";
import {requireUser} from "~/server/session.server";
import dayjs from "dayjs";
import {deleteFile, deleteFiles, getUserFilesSize, saveFiles, togglePublic} from "~/models/media.server";
import invariant from "tiny-invariant";
import {deleteFileFromS3, generateSignedUrl} from "~/models/storage.server";
import {getFileKey} from "~/utils/utils";
import {useActionData, useLoaderData} from "@remix-run/react";
import {useEffect, useState} from "react";
import {useInputState} from "@mantine/hooks";
import {UploadFile} from "~/components/MediaManager/UploadFile";
import {FilesFilters} from "~/components/MediaManager/FilesFilters";
import {FilesGrid} from "~/components/MediaManager/FilesGrid";
import {getWorkspaceFilesById, isUserAllowedViewWorkspace} from "~/models/workspace.server";
import {createComment, deleteComment} from "~/models/comments.server";
import {showNotification} from "@mantine/notifications";
import {IconCheck, IconX} from "@tabler/icons";

type Rights = {
  delete: boolean;
  upload: boolean;
};

export const loader = async ({request, params}: LoaderArgs) => {
  const user = await requireUser(request)
  const workspaceId = params.workspaceId
  invariant(typeof workspaceId === "string", "Workspace Id must be provided")

  const isUserAllowedView = await isUserAllowedViewWorkspace(user.id, workspaceId)

  if (!isUserAllowedView) {
    return redirect("/")
  }

  const url = new URL(request.url);
  const defaultFrom = url.searchParams.get("from");
  const defaultTo = url.searchParams.get("to");
  const defaultOrder = url.searchParams.get("order") ?? "asc";
  const defaultPublic = url.searchParams.get("public") ?? "no";


  const from = defaultFrom ? dayjs(defaultFrom, "DD-MM-YYYY").startOf("day").toDate() : undefined
  const to = defaultTo ? dayjs(defaultTo, "DD-MM-YYYY").endOf("day").toDate() : undefined

  const userFiles = await getWorkspaceFilesById(workspaceId, from, to, defaultOrder, defaultPublic, user.id)
  const filesSize = userFiles?.media?.reduce((acc, item) => acc + item.size, 0)

  const rights =
    userFiles?.ownerId === user.id
      ? {upload: true, delete: true}
      : userFiles?.collaborator?.find(c => c.userId === user.id)?.rights as Rights

  return json({
    origin: url.origin,
    rights,
    userFiles: userFiles?.media ?? [],
    filesSize,
    maxSizeLimit: user.payment ? 3221225472 : 314572800 // 3gb vs 300mb
  })
}

export const action = async ({request, params}: ActionArgs) => {
  const workspaceId = params.workspaceId
  invariant(typeof workspaceId === "string", "Workspace Id must be provided")
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
      const key = `${user.id}/workspace/${workspaceId}/${Date.now()}--${file.name}`

      try {
        const signedUrl = await generateSignedUrl(file.type, key)
        await fetch(signedUrl, {method: 'PUT', body: file});
        const fileUrl = `${CLOUDFLARE_PUBLIC_FILE_URL}/${key}`
        filesToDB.push({
          userId: user.id,
          fileUrl,
          workspaceId,
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

    try {
      await deleteFiles(parsedFilesIdsToDelete)

      for (const url of parsedFilesUrlsToDelete) {
        await deleteFileFromS3(getFileKey(url))
      }
    } catch (e) {
      return json({success: false, intent, message: "Error deleting files"})
    }

    return json({success: true, intent, message: `${parsedFilesIdsToDelete.length} files deleted`})
  }

  if (intent === "togglePublic") {
    const checked = formData.get("checked")?.toString() ?? "";
    const fileId = formData.get("fileId")?.toString() ?? "";

    try {
      await togglePublic(fileId, checked === "true")
      return json({success: true, intent, message: `File now ${checked ? "Public" : "Private"}`})
    } catch (e) {
      return json({success: false, intent, message: `Error making file ${checked ? "Public" : "Private"}`})
    }
  }

  if (intent === "createComment") {
    const mediaId = formData.get("mediaId")?.toString() ?? "";
    const comment = formData.get("comment")?.toString() ?? "";

    try {
      await createComment(user.id, comment, mediaId)
      return json({success: true, intent, message: `Comment added`})
    } catch (e) {
      return json({success: false, intent, message: `Error adding comment`})
    }
  }

  if (intent === "deleteComment") {
    const commentId = formData.get("commentId")?.toString() ?? "";

    try {
      await deleteComment(commentId)
      return json({success: true, intent, message: `Comment deleted`})
    } catch (e) {
      return json({success: false, intent, message: `Error deleting comment`})
    }
  }

  return json({success: false, intent, message: "Some error"})
}


// todo maybe add valtio for state managment

export default function WorkspaceId() {
  const {userFiles} = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [selectedFilesUrls, setSelectedFilesUrls] = useState<string[]>([])
  const [searchValue, setSearchValue] = useInputState('');
  const [filterTypeValue, setFilterTypeValue] = useState<string[]>([]);

  useEffect(() => {
    if (actionData) {
      showNotification({
        title: actionData?.message,
        message: undefined,
        color: actionData?.success ? "green" : "red",
        autoClose: 2000,
        icon: actionData?.success ? <IconCheck/> : <IconX/>
      })

    }
  }, [actionData])

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

