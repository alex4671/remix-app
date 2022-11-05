import {Box, Title} from "@mantine/core";
import {useLoaderData, useTransition} from "@remix-run/react";
import type {LoaderArgs} from "@remix-run/node";
import {json} from "@remix-run/node";
import {requireUser} from "~/server/session.server";
import {getUserCollaboratorWorkspacesById} from "~/models/workspace.server";
import {WorkspaceItem} from "~/components/Settings/Workspaces/WorkspaceItem";
import {EventType, useSubscription} from "~/hooks/useSubscription";

export const loader = async ({request}: LoaderArgs) => {
  const user = await requireUser(request)
  const collaborators = await getUserCollaboratorWorkspacesById(user.id)

  return json({collaborators})
}

export default function CollaboratedWorkspaces() {
  const {collaborators} = useLoaderData<typeof loader>()
  const transition = useTransition()

  useSubscription([EventType.INVITE_MEMBER, EventType.REMOVE_ACCESS], !!transition.submission)

  return (
    <Box>
      {collaborators.length ? (
        collaborators.map(c => (<WorkspaceItem key={c.id} workspace={c} isDraggable={false}/>))
      ) : (
        <Title order={5} align={"center"} my={24}>You currently not invited in any workspace</Title>
      )}
    </Box>
  )
}

