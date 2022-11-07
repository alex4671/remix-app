import {FileButton, Group, Text, Tooltip} from "@mantine/core";
import {DangerButton} from "~/components/Buttons/DangerButtom";
import {SecondaryButton} from "~/components/Buttons/SecondaryButton";
import {PrimaryButton} from "~/components/Buttons/PrimaryButton";
import {IconCheck, IconExclamationMark, IconUpload, IconX} from "@tabler/icons";
import {formatBytes} from "~/utils/utils";
import {Form, useActionData, useLoaderData} from "@remix-run/react";
import {showNotification} from "@mantine/notifications";
import type {action, loader} from "~/routes/media/$workspaceId";
import type {Dispatch, SetStateAction} from "react";
import { useEffect, useRef, useState} from "react";
import {HiddenSessionId} from "~/components/Utils/HiddenSessionId";

interface Props {
  selectedFiles: string[];
  selectedFilesUrls: string[];
  setSelectedFiles: Dispatch<SetStateAction<string[]>>
  setSelectedFilesUrls: Dispatch<SetStateAction<string[]>>
  filteredUserFilesCount: number;
}

export const UploadFile = ({selectedFiles, selectedFilesUrls, setSelectedFiles, setSelectedFilesUrls, filteredUserFilesCount}: Props) => {
  const {userFiles, filesSize, maxSizeLimit, rights} = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const [files, setFiles] = useState<File[] | null>(null);
  const resetRef = useRef<() => void>(null);

  useEffect(() => {
    if (actionData) {
      if (actionData.intent === "uploadFiles") {
        setFiles(null)
        resetRef.current?.();

        return
      }

      if (actionData.intent === "deleteFiles") {
        setSelectedFiles([])
        setSelectedFilesUrls([])

        return
      }

      showNotification({
        title: actionData?.message,
        message: undefined,
        color: actionData?.success ? "green" : "red",
        autoClose: 2000,
        icon: actionData?.success ? <IconCheck/> : <IconX/>
      })

    }
  }, [actionData])


  const handleSelectFile = (files: File[]) => {
    const newFilesSize = files.reduce((acc, file) => acc + file.size, 0)

    if (newFilesSize + (filesSize ?? 0) <= maxSizeLimit) {
      setFiles(files)
    } else {
      showNotification({
        title: "You reached max storage size",
        message: "Select other files or delete existing",
        color: "yellow",
        autoClose: 3000,
        icon: <IconExclamationMark/>
      })
      setFiles(null)
      resetRef.current?.();
    }
  }

  const handleCancel = () => {
    setFiles(null)
    setSelectedFiles([])
    setSelectedFilesUrls([])
    resetRef.current?.()
  }

  const handleSelectAllFiles = () => {
    setSelectedFiles(prevState => prevState.length === userFiles?.length ? [] : userFiles?.map(file => file.id) ?? [])
    setSelectedFilesUrls(prevState => prevState.length === userFiles?.length ? [] : userFiles?.map(file => file.fileUrl) ?? [])
  }

  const handleCancelPick = () => {
    setSelectedFiles([])
    setSelectedFilesUrls([])
  }

  // todo make new upload ui with preview/
  // todo bug with usage count when filtering
  return (
    <Form method={"post"} encType={"multipart/form-data"}>
      <HiddenSessionId/>
      <Group position={"apart"}>
        <Group>
          {selectedFiles.length ? (
            <Group>
              <input type="hidden" name={"filesToDeleteIds"} value={JSON.stringify(selectedFiles)}/>
              <input type="hidden" name={"filesToDeleteUrls"} value={JSON.stringify(selectedFilesUrls)}/>
              <DangerButton
                type={"submit"}
                name={"intent"}
                value={"deleteFiles"}
                disabled={!rights?.delete}
              >
                Delete {selectedFiles.length} files
              </DangerButton>
              <SecondaryButton
                onClick={handleSelectAllFiles}>{selectedFiles.length === userFiles?.length ? "Deselect all" : "Select all"}</SecondaryButton>
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
                  disabled={Number(filesSize) >= maxSizeLimit || !rights?.upload}
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
        {filesSize !== 0 ? (
          <Tooltip
            label={`${formatBytes(filesSize)} of ${formatBytes(maxSizeLimit)}`}
            withArrow
          >
            <Text component={"span"}>
              {filteredUserFilesCount} files, Used: {Math.round((100 / maxSizeLimit) * (filesSize ?? 0))}%
            </Text>
          </Tooltip>
        ) : null}


      </Group>
    </Form>
  )
}
