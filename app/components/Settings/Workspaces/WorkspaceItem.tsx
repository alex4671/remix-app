import {useLocation, useNavigate} from "@remix-run/react";
import {useSortable} from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities";
import {ActionIcon, Group, Paper, Text} from "@mantine/core";
import {IconGripVertical} from "@tabler/icons";
import dayjs from "dayjs";

export const WorkspaceItem = ({workspace, isDraggable}: {workspace: any, isDraggable: boolean}) => {
  const navigate = useNavigate()
  const location = useLocation()


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

  return (
    <Paper
      ref={setNodeRef}
      style={style}
      onClick={() => handleNavigate(workspace.id)}
      sx={{cursor: "pointer", position: "relative", zIndex: isDragging ? 1 : 0}}
      withBorder
      my={12}
      py={12}
      px={6}
    >
      <Group position={"apart"}>
        <Text>{workspace.name}</Text>
        {isDraggable ? (
          <ActionIcon size="sm" color={"zinc"} {...listeners} {...attributes}>
            <IconGripVertical/>
          </ActionIcon>
        ) : null}

      </Group>
      <Text size={"sm"} color={"dimmed"}>{dayjs(workspace.createdAt).format("DD/MM/YYYY")}</Text>
    </Paper>
  )
}
