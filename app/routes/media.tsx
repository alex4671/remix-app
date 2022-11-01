import {
  ActionIcon,
  AspectRatio,
  Box,
  Button,
  Card,
  Checkbox,
  ColorSwatch,
  FileButton,
  Group,
  Image, Popover,
  SimpleGrid,
  Text, TextInput,
  Tooltip, useMantineTheme,
  ScrollArea, Badge, Grid, RingProgress, Title,
} from "@mantine/core";
import {
  IconCheck, IconChevronDown,
  IconChevronUp,
  IconCircleX,
  IconDownload,
  IconExclamationMark, IconSearch,
  IconTrash,
  IconUpload,
  IconX
} from "@tabler/icons";
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
import {randomId, useInputState, useListState} from "@mantine/hooks";

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
  const {userFiles, filesSize, maxSizeLimit} = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const transition = useTransition();
  const [files, setFiles] = useState<File[] | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [selectedFilesUrls, setSelectedFilesUrls] = useState<string[]>([])
  const [searchValue, setSearchValue] = useInputState('');
  const [filterTypeValue, setFilterTypeValue] = useState<string[]>([]);
  const resetRef = useRef<() => void>(null);

  const fileTypes = new Set(userFiles?.map(file => file.type.split('/')[1]))

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

  const handleRemoveSelectedType = (type: string) => {
    setFilterTypeValue(prevState => prevState.filter(t => t !== type))
  }

  const filteredUserFiles = userFiles
    ?.filter(file => file.name.toLowerCase().includes(searchValue.toLowerCase()))
    ?.filter(file => filterTypeValue.length ? filterTypeValue.includes(file.type.split("/")[1]) : true)


  // todo decompose components
  // todo make limit usage in backend
  // todo add file name
  return (
    <>
      <Form method={"post"} encType={"multipart/form-data"}>
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
                    disabled={Number(filesSize) >= maxSizeLimit}
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
                {userFiles?.length} files, Used: {Math.round((100 / maxSizeLimit) * (filesSize ?? 0))}%
              </Text>
            </Tooltip>
          ) : null}


        </Group>
      </Form>
      <Grid my={24}>
        <Grid.Col xs={12} sm={4}>
          <TextInput
            placeholder={"File name"}
            value={searchValue}
            onChange={setSearchValue}
            width={400}
            rightSection={
              searchValue !== ""
                ? (
                  <IconCircleX
                    color={"gray"}
                    size={14}
                    style={{cursor: "pointer"}}
                    onClick={() => setSearchValue("")}
                  />
                )
                : null}
          />
        </Grid.Col>
        <Grid.Col xs={12} sm={"auto"}>
          <Filter
            fileTypes={Array.from(fileTypes)}
            filterTypeValue={filterTypeValue}
            setFilterTypeValue={setFilterTypeValue}
          />

        </Grid.Col>
        <Grid.Col span={12}>
          <Group spacing={"xs"}>
            {filterTypeValue?.map(type => (
              <Badge
                key={type}
                color={"emerald"}
                size={"lg"}
                sx={{paddingRight: 3}}
                rightSection={
                  <ActionIcon
                    color={"emerald"}
                    variant="transparent"
                    onClick={() => handleRemoveSelectedType(type)}
                  >
                    <IconX size={10}/>
                  </ActionIcon>
                }
              >
                {type}
              </Badge>
            ))}

          </Group>
        </Grid.Col>
      </Grid>


      <Group grow mt={24}>
        {filteredUserFiles?.length ? (
          <SimpleGrid
            cols={4}
            breakpoints={[
              {maxWidth: 'md', cols: 3},
              {maxWidth: 'sm', cols: 2},
              {maxWidth: 'xs', cols: 1},
            ]}
          >
            {filteredUserFiles.map(file => (
              <Card
                p="lg"
                withBorder
                key={file.id}
                sx={(theme) => ({outline: selectedFiles.includes(file.id) ? `2px solid ${theme.colors.dark[6]}` : "none"})}
              >
                <Card.Section>
                  <AspectRatio ratio={16 / 9}>

                    {file.type.includes("image") ? (
                      <Image
                        src={file.fileUrl}
                        alt={file.fileUrl}
                      />
                    ) : file.type.includes("video") ? (
                      <video controls preload="metadata">
                        <source src={`${file.fileUrl}#t=0.5`} type={file.type}/>
                      </video>
                    ) : (
                      <Box
                        sx={(theme) => ({background: theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[2]})}>
                        <Text align={"center"}>{file.type}</Text>
                      </Box>
                    )}
                  </AspectRatio>
                </Card.Section>

                <Card.Section py="lg" px={"md"}>
                  <Group position={"apart"} align={"baseline"}>
                    <Group align={"flex-start"}>
                      <Checkbox color={"dark.6"} onClick={() => handlePickFile(file.id, file.fileUrl)}
                                defaultChecked={selectedFiles.includes(file.id)}/>
                      <Text color={"dimmed"} size={"sm"}>{formatBytes(file.size)}</Text>
                      <Badge color="dark" variant="outline">{file.type.split('/')[1]}</Badge>
                    </Group>
                    <Form method={"post"}>
                      <input type="hidden" name={"fileId"} value={file.id}/>
                      <Group spacing={0}>
                        <ActionIcon component={"a"} href={file.fileUrl} download target={"_blank"}>
                          <IconDownload size={18}/>
                        </ActionIcon>
                        <ActionIcon type={"submit"} name={"intent"} value={"deleteFile"}>
                          <IconTrash size={18}/>
                        </ActionIcon>
                      </Group>
                    </Form>
                  </Group>
                </Card.Section>
              </Card>
            ))}
            {isSubmitting && filterTypeValue.length === 0 ? (
              (transition?.submission?.formData.getAll("file") as File[]).map((file) => (
                <Card p="lg" withBorder key={file.name} style={{opacity: "0.5"}}>
                  <Card.Section>
                    <AspectRatio ratio={16 / 9}>

                      {file.type.includes("image") ? (
                        <Image
                          src={URL.createObjectURL(file)}
                          alt={"Test"}
                        />
                      ) : file.type.includes("video") ? (
                        <video controls={false} preload="metadata">
                          <source src={`${URL.createObjectURL(file)}#t=0.5`} type={file.type}/>
                        </video>
                      ) : (
                        <Box
                          sx={(theme) => ({background: theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[2]})}>
                          <Text align={"center"}>{file.type}</Text>
                        </Box>
                      )}
                    </AspectRatio>
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
          ) : (
          <Title order={3} align={"center"}>Nothing found</Title>
        )}
      </Group>
    </>
  )
}

interface Props {
  fileTypes: string[];
  filterTypeValue: string[];
  setFilterTypeValue: (id: string[]) => void
}

export const Filter = ({fileTypes, filterTypeValue, setFilterTypeValue}: Props) => {
  const [opened, setOpened] = useState(false);
  const [searchValue, setSearchValue] = useInputState("");
  const [checked, setChecked] = useState<string[]>(() => filterTypeValue)

  // todo try remove effect
  useEffect(() => {setChecked(filterTypeValue)}, [filterTypeValue])

  const isAtLeastOneChecked = checked.length;

  const handleApply = () => {
    setFilterTypeValue(checked)
    setOpened(false)
    setSearchValue("")
  }

  const handleClear = () => {
    setChecked([])
    setSearchValue("")
  }

  const handleSelectAll = () => {
    setChecked(fileTypes)
  }

  const types = fileTypes
    .filter(type => type.includes(searchValue))
    .map((type) => (
      <Group key={type} mt={8}>
        <Checkbox
          ml={4}
          onChange={() => setChecked(prevState => prevState.includes(type) ? prevState.filter(el => el !== type) : [...prevState, type])}
          checked={checked.includes(type)}
          label={type}
        />
      </Group>
    ));

  return (
    <Popover
      opened={opened}
      onClose={() => setOpened(false)}
      trapFocus
      width={260}
      position="bottom"
      withinPortal={false}
    >
      <Popover.Target>
        <Button
          variant={"outline"}
          color={"zinc"}
          onClick={() => setOpened((o) => !o)}
          rightIcon={opened ? <IconChevronUp size={16}/> : <IconChevronDown size={16}/>}
        >
          File type
        </Button>
      </Popover.Target>
      <Popover.Dropdown>
        <div style={{minHeight: "200px", maxHeight: "460px"}}>
          <TextInput
            icon={<IconSearch size={16}/>}
            placeholder={"Filter"}
            color={"zinc"}
            value={searchValue}
            onChange={setSearchValue}
          />
          <ScrollArea type="auto" style={{height: 250}} my={8}>
            {types.length > 0 ? types : "No file type found"}
          </ScrollArea>
          <Group grow my={12}>
            <SecondaryButton
              compact
              onClick={handleSelectAll}
              disabled={checked.length === fileTypes.length || searchValue !== ""}
            >
              Select All
            </SecondaryButton>
            <SecondaryButton
              compact
              disabled={!isAtLeastOneChecked}
              onClick={handleClear}
            >
              Clear
            </SecondaryButton>
          </Group>
          <Group grow>
            <PrimaryButton fullWidth onClick={handleApply}>Apply</PrimaryButton>
          </Group>
        </div>
      </Popover.Dropdown>

    </Popover>
  );
};
