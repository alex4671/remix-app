import {
  ActionIcon,
  AspectRatio,
  Badge,
  Box,
  Card,
  Checkbox,
  Group,
  Image,
  SimpleGrid,
  Text,
  Title
} from "@mantine/core";
import {formatBytes} from "~/utils/utils";
import {Form, useTransition} from "@remix-run/react";
import {IconDownload, IconTrash} from "@tabler/icons";
import type {Dispatch, SetStateAction} from "react";
import {upperFirst} from "@mantine/hooks";

interface Props {
  setSelectedFiles: Dispatch<SetStateAction<string[]>>
  setSelectedFilesUrls: Dispatch<SetStateAction<string[]>>
  filteredUserFiles: any;
  filterTypeValue: string[];
  selectedFiles: string[];
}

export const FilesGrid = ({
                            setSelectedFiles,
                            setSelectedFilesUrls,
                            filteredUserFiles,
                            filterTypeValue,
                            selectedFiles
                          }: Props) => {

  const transition = useTransition();
  const isSubmitting = transition.submission

  const handlePickFile = (id: string, url: string) => {
    setSelectedFiles(prevState => prevState.includes(id) ? prevState.filter(el => el !== id) : [...prevState, id])
    setSelectedFilesUrls(prevState => prevState.includes(url) ? prevState.filter(el => el !== url) : [...prevState, url])
  }


  // todo refactor component
  // todo add type
  return (
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
              sx={(theme) => ({outline: selectedFiles.includes(file.id) ? `2px solid ${theme.colors.gray[6]}` : "none"})}
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
              </Card.Section>

              <Card.Section py="lg" px={"md"}>
                <Group position={"apart"} align={"baseline"}>
                  <Group align={"flex-start"}>
                    <Checkbox
                      color={"gray"}
                      onChange={() => handlePickFile(file.id, file.fileUrl)}
                      checked={selectedFiles.includes(file.id)}
                    />
                    <Text color={"dimmed"} size={"sm"}>{formatBytes(file.size)}</Text>
                    <Badge color="gray" variant="outline">{file.type.split('/')[1]}</Badge>
                  </Group>
                  <Form method={"post"}>
                    <input type="hidden" name={"fileId"} value={file.id}/>
                    <Group spacing={4}>
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
                    ) : file.type.includes("audio") ? (
                      <Box
                        sx={(theme) => ({background: theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[2]})}>
                        <audio controls>
                          <source src={URL.createObjectURL(file)} type={file.type}/>
                        </audio>
                      </Box>
                    ) : (
                      <Box
                        sx={(theme) => ({background: theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[2]})}
                      >
                        <Text align={"center"}>{file.type.split("/")[1]}</Text>
                      </Box>
                    )}
                  </AspectRatio>
                </Card.Section>

                <Card.Section py="lg" px={"md"}>
                  <Group position={"apart"} align={"baseline"}>
                    <Group align={"flex-start"}>
                      <Text color={"dimmed"} size={"sm"}>{formatBytes(file.size)}</Text>
                      <Badge color="gray" variant="outline">{file.type.split('/')[1]}</Badge>
                    </Group>
                    <Group spacing={4}>
                      <ActionIcon disabled>
                        <IconDownload size={18}/>
                      </ActionIcon>
                      <ActionIcon disabled>
                        <IconTrash size={18}/>
                      </ActionIcon>
                    </Group>
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
  )
}
