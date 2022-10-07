import {Avatar, Button, FileButton, Group, Paper, Stack, Title} from "@mantine/core";
import type {ActionFunction, MetaFunction} from "@remix-run/node";
import {useState} from "react";
import {Form, useFetcher} from "@remix-run/react";
import {deleteFileFromS3, generateSignedUrl} from "~/models/storage.server";
import {json} from "@remix-run/node";
import {requireUser, requireUserId} from "~/server/session.server";
import {deleteAvatar, updateAvatar} from "~/models/user.server";
import {IconUpload} from "@tabler/icons";
import {getFileKey, useUser} from "~/utils/utils";

export const meta: MetaFunction = () => {
  return {
    title: "Account"
  };
};

export const action: ActionFunction = async ({request}) => {
  const user = await requireUser(request)
  const {
    CLOUDFLARE_PUBLIC_FILE_URL,
  } = process.env;


  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "upload") {
    const file = formData.get("file") as File;
    console.log("file", file)
    const key = `avatars/${user.id}/${Date.now()}--${file.name}`

    try {
      const signedUrl = await generateSignedUrl(file.type, key)
      await fetch(signedUrl, {method: 'PUT', body: file});
      const avatarUrl = `${CLOUDFLARE_PUBLIC_FILE_URL}/${key}`

      if (user.avatarUrl) {
        await deleteFileFromS3(getFileKey(user.avatarUrl))
      }

      await updateAvatar(user.id, avatarUrl)


      return json({success: true})
    } catch (e) {
      return json({success: false})
    }
  }

  if (intent === "delete") {
    try {
      await deleteAvatar(user.id)

      if (user.avatarUrl) {
        await deleteFileFromS3(getFileKey(user.avatarUrl))
      }

      return json({success: true})
    } catch (e) {
      return json({success: false})
    }
  }


}


export default function Account() {
  const user = useUser()
  const [_, setFile] = useState<File | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState(user.avatarUrl)

  const handleSelectFile = (file: File) => {
    setFile(file)
    setSelectedAvatar(URL.createObjectURL(file))
  }

  const handleRemoveAvatar = () => {
    setSelectedAvatar(null)
  }

  return (
    <Paper shadow="0" p="md" withBorder mb={12}>
      <Title order={2}>Account Settings</Title>
      <Form method={"post"} encType={"multipart/form-data"}>
        <Stack align="flex-start">
          <Avatar src={selectedAvatar} alt="it's me" radius="xl" size={72}/>
          <FileButton onChange={handleSelectFile} accept="image/png,image/jpeg" name={"file"}>
            {(props) =>
              <Button
                variant="outline"
                leftIcon={<IconUpload size={"14"} />}
                {...props}
              >
                Select avatar
              </Button>}
          </FileButton>
          <Group>
            <Button type={"submit"} color={"green"} name={"intent"} value={"upload"}>Upload</Button>
            <Button type={"submit"} color={"red"} name={"intent"} value={"delete"} onClick={handleRemoveAvatar}>Delete</Button>
          </Group>
        </Stack>
      </Form>
    </Paper>)
}
