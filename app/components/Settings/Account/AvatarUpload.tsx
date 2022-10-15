import {Avatar, Box, Button, FileButton, Group, Paper, Text, ThemeIcon, Title, Tooltip} from "@mantine/core";
import {Form, useActionData} from "@remix-run/react";
import {IconExclamationMark, IconInfoCircle, IconLetterI, IconUpload} from "@tabler/icons";
import {useUser} from "~/utils/utils";
import {useEffect, useRef, useState} from "react";
import {showNotification} from "@mantine/notifications";
import {InfoTooltip} from "~/components/Utils/InfoTooltip";

const UPLOAD_SIZE_LIMIT = 3145728

export const AvatarUpload = () => {
  const actionData = useActionData()

  const user = useUser()
  const [file, setFile] = useState<File | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState(user.avatarUrl)

  const resetRef = useRef<() => void>(null);

  useEffect(() => {
    if (actionData?.success) {
      setFile(null)
      resetRef.current?.();
    }
  }, [actionData])

  const handleSelectFile = (file: File) => {
    if (file?.size < UPLOAD_SIZE_LIMIT) {
      setFile(file)
      setSelectedAvatar(URL.createObjectURL(file))
    } else {
      setFile(null)
      resetRef.current?.();
      showNotification({
        title: "Max avatar size is 3mb",
        message: undefined,
        color: "yellow",
        autoClose: 5000,
        icon: <IconExclamationMark size={18}/>
      })
    }
  }

  const handleRemoveAvatar = () => {
    setSelectedAvatar(null)
    resetRef.current?.();
  }

  return (
    <Paper shadow="0" withBorder mb={12}>
      <Form method={"post"} encType={"multipart/form-data"}>
        <Box p={"lg"}>
          <Title order={2}>Avatar</Title>
          <Group spacing={6}>
            <Text color={"dimmed"}>Set or remove avatar. </Text>
            <InfoTooltip label={"Max size is 3mb."}/>
          </Group>
          <Box my={12}>
            <Group>
              <Avatar src={selectedAvatar} alt={user.email} radius="xl" size={36}/>
              <FileButton resetRef={resetRef} onChange={handleSelectFile} accept="image/png,image/jpeg" name={"file"}>
                {(props) =>
                  <Button
                    variant="outline"
                    color={"gray"}
                    leftIcon={<IconUpload size={"14"}/>}
                    compact
                    {...props}
                  >
                    Select avatar
                  </Button>}
              </FileButton>
            </Group>
          </Box>
          <Box py={12}>
            <Group>
              <Button
                type={"submit"}
                color={"emerald"}
                name={"intent"}
                value={"uploadAvatar"}
                disabled={!file}
              >
                Upload
              </Button>
              <Button
                type={"submit"}
                color={"red"}
                name={"intent"}
                value={"deleteAvatar"}
                onClick={handleRemoveAvatar}
              >
                Delete
              </Button>
            </Group>
          </Box>
        </Box>
      </Form>
    </Paper>
  )
}
