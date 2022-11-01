import {ActionIcon, Card, FileButton, Group, Image, SimpleGrid, Text} from "@mantine/core";
import {IconCheck, IconTrash, IconUpload, IconX} from "@tabler/icons";
import {useEffect, useRef, useState} from "react";
import {PrimaryButton} from "~/components/Buttons/PrimaryButton";
import {Form, useActionData, useLoaderData, useTransition} from "@remix-run/react";
import {DangerButton} from "~/components/Buttons/DangerButtom";
import type {ActionArgs, LoaderArgs} from "@remix-run/node";
import {json} from "@remix-run/node";
import {requireUser} from "~/server/session.server";
import invariant from "tiny-invariant";
import {deleteFileFromS3, generateSignedUrl} from "~/models/storage.server";
import {deleteFile, deleteFiles, getUserFiles, saveFiles} from "~/models/media.server";
import {formatBytes, getFileKey} from "~/utils/utils";
import {showNotification} from "@mantine/notifications";
import {SecondaryButton} from "~/components/Buttons/SecondaryButton";

export const loader = async ({request}: LoaderArgs) => {
  const user = await requireUser(request)

  const userFiles = await getUserFiles(user.id)

  const filesSize = userFiles?.reduce((acc, item) => acc + item.size, 0)

  return json({
    userFiles,
    filesSize: formatBytes(filesSize)
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

  const {userFiles, filesSize} = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const transition = useTransition();
  const [files, setFiles] = useState<File[] | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [selectedFilesUrls, setSelectedFilesUrls] = useState<string[]>([])

  const resetRef = useRef<() => void>(null);


  useEffect(() => {
    if (actionData) {
      showNotification({
        title: actionData?.message,
        message: undefined,
        color: actionData?.success ? "green" : "red",
        autoClose: 2000,
        icon: actionData?.success ? <IconCheck/> : <IconX/>
      })

      if (actionData.intent === "uploadFiles") {
        setFiles(null)
        resetRef.current?.();
      }
      if (actionData.intent === "deleteFiles") {
        setSelectedFiles([])
        setSelectedFilesUrls([])
      }

    }
  }, [actionData])

  const isSubmitting = transition.submission

  const handleSelectFile = (files: File[]) => {
    setFiles(files)

  }

  const handleCancel = () => {
    setFiles(null)
    resetRef.current?.()
  }

  const handlePickFile = (id: string, url: string) => {
    setSelectedFiles(prevState => prevState.includes(id) ? prevState.filter(el => el !== id) : [...prevState, id])
    setSelectedFilesUrls(prevState => prevState.includes(url) ? prevState.filter(el => el !== url) : [...prevState, url])

  }

  const handleSelectAllFiles = () => {
    setSelectedFiles(prevState => prevState.length === userFiles?.length ? [] : userFiles?.map(file => file.id) ?? [])
    setSelectedFilesUrls(prevState => prevState.length === userFiles?.length ? [] : userFiles?.map(file => file.fileUrl) ?? [])
  }

  const handleCancelPick = () => {
    setSelectedFiles([])
    setSelectedFilesUrls([])
  }
  // todo decompose components
  // todo add other file types
  // todo make limit usage
  return (
    <>
      <Form method={"post"} encType={"multipart/form-data"}>
        <Group position={"apart"}>
          <Group>
            {selectedFiles.length ? (
              <Group>
                <input type="hidden" name={"filesToDeleteIds"} value={JSON.stringify(selectedFiles)}/>
                <input type="hidden" name={"filesToDeleteUrls"} value={JSON.stringify(selectedFilesUrls)}/>
                <DangerButton type={"submit"} name={"intent"}
                               value={"deleteFiles"}>Delete {selectedFiles.length} files</DangerButton>
                <SecondaryButton onClick={handleSelectAllFiles}>{selectedFiles.length === userFiles?.length ? "Deselect all": "Select all"}</SecondaryButton>
                <SecondaryButton onClick={handleCancelPick}>Cancel</SecondaryButton>
              </Group>
            ) : (
              <FileButton
                resetRef={resetRef}
                onChange={handleSelectFile}
                name={"file"}
                multiple
              >
                {(props) =>
                  <PrimaryButton
                    leftIcon={<IconUpload size={"14"}/>}
                    {...props}
                  >
                    Select Files
                  </PrimaryButton>
                }
              </FileButton>
            )}
            {files ? (
              <>
                <Text>{files.length} file selected</Text>
                <PrimaryButton type={"submit"} name={"intent"} value={"uploadFiles"}>Upload</PrimaryButton>
                <DangerButton onClick={handleCancel}>Cancel</DangerButton>
              </>
            ) : null}
          </Group>
          {filesSize !== "" ? (<Text>{userFiles?.length} files, Used: {filesSize}</Text>) : null}


        </Group>
      </Form>
      <Group grow mt={24}>
        <SimpleGrid
          cols={4}
          breakpoints={[
            { maxWidth: 'md', cols: 3 },
            { maxWidth: 'sm', cols: 2 },
            { maxWidth: 'xs', cols: 1 },
          ]}
        >
          {userFiles?.map(file => (
            <Card p="lg" withBorder key={file.id}
                  style={{outline: selectedFiles.includes(file.id) ? "2px solid blue" : "none"}}>
              <Card.Section onClick={() => handlePickFile(file.id, file.fileUrl)}>
                {file.type.includes("image") ? (
                  <Image
                    src={file.fileUrl}
                    height={160}
                    alt={file.fileUrl}
                  />
                ) : (
                  <div>Not image</div>
                )}

              </Card.Section>

              <Card.Section py="lg" px={"md"}>
                <Group position={"apart"}>
                  <Group>
                    <Text color={"dimmed"} size={"sm"}>{formatBytes(file.size)}</Text>
                    <Text color={"dimmed"} size={"sm"}>{file.type}</Text>
                  </Group>
                  <Form method={"post"}>
                    <input type="hidden" name={"fileId"} value={file.id}/>
                    <ActionIcon type={"submit"} name={"intent"} value={"deleteFile"}>
                      <IconTrash size={18}/>
                    </ActionIcon>
                  </Form>
                </Group>
              </Card.Section>
            </Card>
          ))}
          {isSubmitting ? (
            (transition?.submission?.formData.getAll("file") as File[]).map((file) => (
              <Card p="lg" withBorder key={file.name} style={{opacity: "0.5"}}>
                <Card.Section>
                  <Image
                    src={URL.createObjectURL(file)}
                    height={160}
                    alt={"Test"}
                  />
                </Card.Section>

                <Card.Section py="lg" px={"md"}>
                  <Group position={"apart"}>
                    <Group>
                      <Text color={"dimmed"} size={"sm"}>{formatBytes(file.size)}</Text>
                      <Text color={"dimmed"} size={"sm"}>{file.type}</Text>
                    </Group>
                    <ActionIcon disabled>
                      <IconTrash size={18}/>
                    </ActionIcon>
                  </Group>
                </Card.Section>
              </Card>
            ))

          ) : null}
        </SimpleGrid>
      </Group>
    </>
  )
}
