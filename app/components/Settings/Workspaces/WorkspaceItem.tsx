import {useFetcher, useLocation, useNavigate} from "@remix-run/react";
import {useSortable} from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities";
import {ActionIcon, Group, Paper, Text} from "@mantine/core";
import {IconGripVertical} from "@tabler/icons";
import dayjs from "dayjs";
import {DangerButton} from "~/components/Buttons/DangerButtom";

export const WorkspaceItem = ({workspace, isMyWorkspaces = true}: { workspace: any, isMyWorkspaces?: boolean }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const fetcher = useFetcher()

  const handleNavigate = (workspaceId: string) => {
    navigate(`/settings/workspaces/${workspaceId}`, {state: location.pathname})
  }

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({id: workspace.id});

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const handleDelete = (e: any, workspaceId: string) => {
    e.stopPropagation()
    fetcher.submit({
      intent: "deleteWorkspace",
      sessionId: sessionStorage.getItem("sessionId") ?? ""
    }, {
      method: "post",
      action: `/settings/workspaces/${workspaceId}`
    })

  }

  return (
    <Paper
      ref={setNodeRef}
      style={style}
      onClick={() => handleNavigate(workspace.id)}
      sx={{cursor: "pointer", position: "relative", zIndex: isDragging ? 1 : 0}}
      withBorder
      my={12}
      py={12}
      px={12}
    >
      <Group position={"apart"}>
        <Group>
          {isMyWorkspaces ? (
            <ActionIcon size="sm" color={"zinc"} {...listeners} {...attributes}>
              <IconGripVertical/>
            </ActionIcon>
          ) : null}
          <Text>{workspace.name}</Text>


        </Group>
        {isMyWorkspaces ? (
          <DangerButton compact onClick={(e: any) => handleDelete(e, workspace.id)}>Delete</DangerButton>
        ) : null}
      </Group>
      <Text size={"sm"} color={"dimmed"}>{dayjs(workspace.createdAt).format("DD/MM/YYYY")}</Text>
    </Paper>
  )
}
