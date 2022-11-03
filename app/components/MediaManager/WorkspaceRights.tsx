import {ActionIcon, Badge, Button, Group, Popover, Stack, Switch, Text} from "@mantine/core";
import {IconEdit} from "@tabler/icons";
import {useState} from "react";
import {useFetcher} from "@remix-run/react";
import {LoadingProgress} from "~/components/Utils/LoadingProgress";


type Rights = {
  delete: boolean;
  upload: boolean;
};

interface Props {
  rights: any;
  collaboratorId: string;
  isOwner: boolean;
}

export const WorkspaceRights = ({rights, collaboratorId, isOwner}: Props) => {
  const fetcher = useFetcher()
  const [workspaceRights, setWorkspaceRights] = useState({delete: rights?.delete, upload: rights?.upload})
  const [opened, setOpened] = useState(false);

  const handleUpdateRights = () => {
    fetcher.submit({workspaceRights: JSON.stringify(workspaceRights), collaboratorId, intent: "updateRights"}, {method: "post"})
    setOpened(false)
  }

  return (
    <>
      <LoadingProgress state={fetcher.state}/>
      <Group spacing={8}>
        <Group spacing={0}>
          <Text>Upload: </Text>
          <Badge color={rights.upload ? "emerald" : "red"}>{rights.upload ? "Yes" : "No"}</Badge>
        </Group>
        <Group spacing={0}>
          <Text>Delete: </Text>
          <Badge color={rights.delete ? "emerald" : "red"}>{rights.delete ? "Yes" : "No"}</Badge>
        </Group>
        {isOwner ? (
          <Popover width={250} withArrow position="top" shadow={"sm"} withinPortal opened={opened} onChange={setOpened}>
            <Popover.Target>
              <ActionIcon onClick={() => setOpened((o) => !o)}>
                <IconEdit size={14}/>
              </ActionIcon>
            </Popover.Target>
            <Popover.Dropdown>
              <Stack align={"start"} spacing={0}>
                <Text>Edit rules</Text>
                <Switch
                  label="Upload"
                  name={"rightsUpload"}
                  checked={workspaceRights.upload}
                  onChange={(event) => setWorkspaceRights({delete: workspaceRights.delete, upload: event.currentTarget.checked})}
                  color={"emerald"}
                />
                <Switch
                  label="Delete"
                  name={"rightsDelete"}
                  checked={workspaceRights.delete}
                  onChange={(event) => setWorkspaceRights({upload: workspaceRights.upload, delete: event.currentTarget.checked})}
                  color={"emerald"}
                />
                <Button
                  mt={12}
                  onClick={handleUpdateRights}
                  variant={"light"}
                  color={"emerald"}
                >
                  Save
                </Button>
              </Stack>
            </Popover.Dropdown>
          </Popover>
        ) : null}
      </Group>
    </>
  )
}
