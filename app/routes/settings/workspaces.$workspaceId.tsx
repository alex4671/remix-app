import {Badge, Group, Paper, ScrollArea, Table, Text, TextInput, Title} from "@mantine/core";
import {IconCheck, IconChevronLeft, IconX} from "@tabler/icons";
import {Form, useActionData, useLoaderData, useLocation, useNavigate, useTransition} from "@remix-run/react";
import {PrimaryButton} from "~/components/Buttons/PrimaryButton";
import type {ActionArgs, LoaderArgs} from "@remix-run/node";
import {json, redirect} from "@remix-run/node";
import {requireUser} from "~/server/session.server";
import {deleteWorkspace, getWorkspacesById, isUserAllowedViewWorkspace} from "~/models/workspace.server";
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
import {useEffect} from "react";
import {showNotification} from "@mantine/notifications";
import {emitter} from "~/server/emitter.server";
import {EventType, useSubscription} from "~/hooks/useSubscription";

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

        emitter.emit(EventType.INVITE_MEMBER)
        return json({success: true, intent, message: `Collaborator ${userToInvite.email} added`})
      }

      return json({success: false, intent, message: `User not found`})
    } catch (e) {
      return json({success: false, intent, message: "Error creating workspace"})
    }
  }

  if (intent === "removeAccess") {
    const collaboratorId = formData.get("collaboratorId")?.toString() ?? "";

    try {
      await deleteCollaborator(collaboratorId)

      emitter.emit(EventType.REMOVE_ACCESS)
      return json({success: true, intent, message: `Collaborator removed`})
    } catch (e) {
      return json({success: false, intent, message: "Error removing collaborator"})
    }
  }

  if (intent === "deleteWorkspace") {

    try {
      const workspaceToDelete = await deleteWorkspace(workspaceId)

      if (workspaceToDelete?.media?.length) {
        for (const {fileUrl} of workspaceToDelete?.media) {
          await deleteFileFromS3(getFileKey(fileUrl))
        }
      }

      emitter.emit(EventType.DELETE_WORKSPACE)
      return json({success: true, intent, message: `Workspace deleted`})
    } catch (e) {
      return json({success: false, intent, message: "Error deleting workspace"})
    }
  }
  if (intent === "updateRights") {
    const workspaceRights = formData.get("workspaceRights")?.toString() ?? "";
    const collaboratorId = formData.get("collaboratorId")?.toString() ?? "";


    try {
      await updateCollaboratorRights(collaboratorId, workspaceRights)


      emitter.emit(EventType.UPDATE_RIGHTS)
      return json({success: true, intent, message: `Rights updated`})
    } catch (e) {
      return json({success: false, intent, message: "Error updating rights"})
    }
  }


  return json({success: false, intent, message: "Some error"})
}

export default function WorkspaceId() {
  const {user, workspace} = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const {state} = useLocation();
  const navigate = useNavigate()
  const transition = useTransition()

  useSubscription([EventType.UPDATE_RIGHTS, EventType.REMOVE_ACCESS], !!transition.submission)
  useEffect(() => {
    if (actionData) {
      showNotification({
        title: actionData?.message,
        message: undefined,
        color: actionData?.success ? "green" : "red",
        autoClose: 2000,
        icon: actionData?.success ? <IconCheck/> : <IconX/>
      })

    }
  }, [actionData])


  const handleGoBack = () => {
    // todo figure out where redirect back (use location state)
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
          <Form method={"post"}>
            <input type="hidden" name={"collaboratorId"} value={c.id}/>
            <DangerButton
              disabled={!isUserOwner}
              compact
              type={"submit"}
              name={"intent"}
              value={"removeAccess"}
            >
              Remove access
            </DangerButton>
          </Form>
        </td>
      ) : null}

    </tr>
  ));

  return (
    <Paper shadow="0" p="md" withBorder mb={24}>
      <SecondaryButton onClick={handleGoBack} leftIcon={<IconChevronLeft size={14}/>} compact>Go back</SecondaryButton>
      <Group spacing={6} mt={12}>
        <Title order={2}>{workspace?.name}</Title>
        <Badge color={isUserOwner ? "emerald" : "yellow"}>Owner ({isUserOwner ? "You" : workspace?.owner.email})</Badge>
      </Group>
      <Text mt={6}>Manage workspace settings and invite members</Text>
      {isUserOwner ? (
        <Form method={"post"}>
          <Group position="apart">
            <Group spacing={"xs"} mt={24}>
              <TextInput placeholder={"New member email"} name={"memberEmail"}/>
              <PrimaryButton type={"submit"} name={"intent"} value={"inviteMember"}>Invite member</PrimaryButton>
            </Group>
            <DangerButton
              mt={24}
              type={"submit"}
              name={"intent"}
              value={"deleteWorkspace"}
            >
              Delete workspace and all files
            </DangerButton>
          </Group>
        </Form>
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
