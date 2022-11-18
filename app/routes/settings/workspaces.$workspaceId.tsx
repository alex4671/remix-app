import {Badge, Group, Paper, ScrollArea, Table, Text, TextInput, Title} from "@mantine/core";
import {IconChevronLeft} from "@tabler/icons";
import {Form, useFetcher, useLoaderData, useLocation, useNavigate} from "@remix-run/react";
import {PrimaryButton} from "~/components/Buttons/PrimaryButton";
import type {ActionArgs, LoaderArgs} from "@remix-run/node";
import {json, redirect} from "@remix-run/node";
import {requireUser} from "~/server/session.server";
import {
  deleteWorkspace,
  getWorkspacesById,
  isUserAllowedViewWorkspace,
  updateWorkspaceName
} from "~/models/workspace.server";
import invariant from "tiny-invariant";
import {SecondaryButton} from "~/components/Buttons/SecondaryButton";
import dayjs from "dayjs";
import {DangerButton} from "~/components/Buttons/DangerButtom";
import {
  createCollaborator,
  deleteCollaborator,
  getCollaborators,
  updateCollaboratorRights
} from "~/models/collaborator.server";
import {getUserByEmail} from "~/models/user.server";
import {WorkspaceRights} from "~/components/MediaManager/WorkspaceRights";
import {deleteFileFromS3} from "~/models/storage.server";
import {getFileKey} from "~/utils/utils";
import {emitter} from "~/server/emitter.server";
import {EventType, useSubscription} from "~/hooks/useSubscription";
import {HiddenSessionId} from "~/components/Utils/HiddenSessionId";

export const loader = async ({request, params}: LoaderArgs) => {
  const user = await requireUser(request)
  const workspaceId = params.workspaceId
  invariant(typeof workspaceId === "string", "Workspace Id must be provided")
  const workspace = await getWorkspacesById(workspaceId)
  if (workspace) {
    const isUserAllowedView = await isUserAllowedViewWorkspace(user.id, workspaceId)

    if (!isUserAllowedView) {
      return redirect("/settings/workspaces/my")
    }
    return json({user, workspace})
  }
  return redirect("/settings/workspaces/my")

}

export const action = async ({request, params}: ActionArgs) => {
  const user = await requireUser(request)

  const formData = await request.formData();
  const intent = formData.get("intent");

  const workspaceId = params.workspaceId
  invariant(typeof workspaceId === "string", "Workspace Id must be provided")

  if (intent === "inviteMember") {
    const memberEmail = formData.get("memberEmail")?.toString() ?? "";
    const sessionId = formData.get("sessionId")?.toString() ?? "";

    try {
      const userToInvite = await getUserByEmail(memberEmail)

      if (userToInvite?.email === user.email) {
        return json({success: false, intent, message: `You can't invite yourself`})
      }
      const collaborators = await getCollaborators(workspaceId)

      const collaboratorsIds = collaborators?.map(c => c.userId)


      // if (collaborators.includes(user.id))

      if (userToInvite) {
        if (collaboratorsIds.includes(userToInvite.id)) {
          return json({success: false, intent, message: `Collaborator already invited`})
        }

        await createCollaborator(workspaceId, userToInvite.id)

        emitter.emit(EventType.INVITE_MEMBER, [user.id, userToInvite.id], sessionId)
        return json({success: true, intent, message: `Collaborator ${userToInvite.email} added`})
      }

      return json({success: false, intent, message: `User not found`})
    } catch (e) {
      console.log("e", e)
      return json({success: false, intent, message: "Error inviting member"})
    }
  }

  if (intent === "removeAccess") {
    const collaboratorId = formData.get("collaboratorId")?.toString() ?? "";
    const sessionId = formData.get("sessionId")?.toString() ?? "";

    try {
      const deletedCollaborator = await deleteCollaborator(collaboratorId)

      emitter.emit(EventType.REMOVE_ACCESS, [user.id, deletedCollaborator.user.id], sessionId)
      return json({success: true, intent, message: `${deletedCollaborator.user.email} removed`})
    } catch (e) {
      return json({success: false, intent, message: "Error removing collaborator"})
    }
  }

  if (intent === "deleteWorkspace") {
    const sessionId = formData.get("sessionId")?.toString() ?? "";

    try {
      const workspaceToDelete = await deleteWorkspace(workspaceId)
      const set = new Set()
      workspaceToDelete.collaborator.map(c => set.add(c.userId))

      const usersToNotify = [workspaceToDelete.ownerId, ...Array.from(set)]

      if (workspaceToDelete?.media?.length) {
        for (const {fileUrl} of workspaceToDelete?.media) {
          await deleteFileFromS3(getFileKey(fileUrl))
        }
      }

      emitter.emit(EventType.DELETE_WORKSPACE, usersToNotify, sessionId)
      return json({success: true, intent, message: `Workspace deleted`})
    } catch (e) {
      return json({success: false, intent, message: "Error deleting workspace"})
    }
  }
  if (intent === "updateRights") {
    const workspaceRights = formData.get("workspaceRights")?.toString() ?? "";
    const collaboratorId = formData.get("collaboratorId")?.toString() ?? "";
    const sessionId = formData.get("sessionId")?.toString() ?? "";

    try {
      const updatedCollaborator = await updateCollaboratorRights(collaboratorId, workspaceRights)
      const workspace = await getWorkspacesById(workspaceId)

      const set = new Set()
      workspace?.collaborator.map(c => set.add(c.userId))

      const usersToNotify = [workspace?.owner.id, ...Array.from(set)]

      emitter.emit(EventType.UPDATE_RIGHTS, usersToNotify, sessionId)
      return json({success: true, intent, message: `${updatedCollaborator.user.email} rights updated`})
    } catch (e) {
      return json({success: false, intent, message: "Error updating rights"})
    }
  }
  if (intent === "updateWorkspaceName") {
    const newName = formData.get("newName")?.toString() ?? "";
    const sessionId = formData.get("sessionId")?.toString() ?? "";

    try {
      const workspaceUpdate = await updateWorkspaceName(workspaceId, newName)

      const set = new Set()
      workspaceUpdate.collaborator.map(c => set.add(c.userId))

      const usersToNotify = [workspaceUpdate.ownerId, ...Array.from(set)]

      emitter.emit(EventType.UPDATE_NAME_WORKSPACE, usersToNotify, sessionId)
      return json({success: true, intent, message: `Workspace name updated`})
    } catch (e) {
      return json({success: false, intent, message: "Error updating workspace name"})
    }
  }


  return json({success: false, intent, message: "Some error"})
}

export default function WorkspaceId() {
  const {user, workspace} = useLoaderData<typeof loader>()
  const fetcher = useFetcher()
  const {state} = useLocation();
  const navigate = useNavigate()

  useSubscription(
    `/api/subscriptions/workspaces/${user.id}`,
    [
      EventType.DELETE_WORKSPACE,
      EventType.INVITE_MEMBER,
      EventType.REMOVE_ACCESS,
      EventType.UPDATE_NAME_WORKSPACE,
      EventType.UPDATE_RIGHTS
    ])


  const handleGoBack = () => {
    navigate(state ?? "/")
  }

  const isUserOwner = workspace?.owner.email === user.email

  const memberRows = workspace?.collaborator?.map((c) => (
    <tr key={c.id}>
      <td>{c.user.email}</td>
      <td>{c.isConfirmed ? "Confirmed" : "Not confirmed"}</td>
      <td>{c.role}</td>
      <td>{dayjs(c.createdAt).format("DD/MM/YYYY")}</td>
      <td>
        <WorkspaceRights rights={c.rights} collaboratorId={c.id} isOwner={isUserOwner}/>
      </td>
      {isUserOwner ? (
        <td>
          <fetcher.Form method={"post"}>
            <input type="hidden" name={"collaboratorId"} value={c.id}/>
            <input type="hidden" name={"sessionId"} value={sessionStorage.getItem("sessionId") ?? ""}/>
            <DangerButton
              disabled={!isUserOwner}
              compact
              type={"submit"}
              name={"intent"}
              value={"removeAccess"}
            >
              Remove access
            </DangerButton>
          </fetcher.Form>
        </td>
      ) : null}

    </tr>
  ));

  const handleBlur = (e: any) => {
    if (workspace?.name !== e.currentTarget.textContent) {
      fetcher.submit({
        newName: e.currentTarget.textContent,
        intent: "updateWorkspaceName",
        sessionId: sessionStorage.getItem("sessionId") ?? ""
      }, {
        method: "post"
      })
    }
  }

  return (
    <Paper shadow="0" p="md" withBorder mb={24}>
      <SecondaryButton onClick={handleGoBack} leftIcon={<IconChevronLeft size={14}/>} compact>Go back</SecondaryButton>
      <Group spacing={6} mt={12}>
        <Title
          order={2}
          contentEditable={isUserOwner}
          // style={{ border: "1px solid black" }}
          suppressContentEditableWarning
          onBlur={handleBlur}
        >
          {workspace?.name}
        </Title>
        <Badge color={isUserOwner ? "emerald" : "yellow"}>Owner ({isUserOwner ? "You" : workspace?.owner.email})</Badge>
      </Group>
      <Text mt={6}>Manage workspace settings and invite members</Text>
      {isUserOwner ? (

        <Group position="apart">
          <HiddenSessionId/>
          <fetcher.Form method={"post"}>
            <Group spacing={"xs"} mt={24}>
              <HiddenSessionId/>
              <TextInput placeholder={"New member email"} name={"memberEmail"} required/>
              <PrimaryButton type={"submit"} name={"intent"} value={"inviteMember"}>Invite member</PrimaryButton>
            </Group>
          </fetcher.Form>
          <Form method={"post"}>
            <HiddenSessionId/>
            <DangerButton
              mt={24}
              type={"submit"}
              name={"intent"}
              value={"deleteWorkspace"}
            >
              Delete workspace and all files
            </DangerButton>
          </Form>
        </Group>
      ) : null}

      {memberRows?.length ? (
        <ScrollArea mt={24}>
          <Table
            sx={{minWidth: 400}}
            highlightOnHover
          >
            <thead>
            <tr>
              <th>Email</th>
              <th>Is confirmed</th>
              <th>Role</th>
              <th>Invited</th>
              <th>Rights</th>
              {isUserOwner ? <th>Action</th> : null}
            </tr>
            </thead>
            <tbody>{memberRows}</tbody>
          </Table>
        </ScrollArea>
      ) : (
        <Title order={5} align={"center"} my={24}>No users in this workspace</Title>
      )}
    </Paper>
  )
}
