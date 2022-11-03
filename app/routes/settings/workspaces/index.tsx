import {Box, Paper, Text, Title} from "@mantine/core";
import {useOutletContext} from "react-router";
import {useLoaderData, useNavigate} from "@remix-run/react";
import type {LoaderArgs} from "@remix-run/node";
import {json} from "@remix-run/node";
import {requireUser} from "~/server/session.server";
import {prisma} from "~/server/db.server";
import {getUserCollaboratorWorkspacesById, getUserWorkspacesById} from "~/models/workspace.server";
import dayjs from "dayjs";

export const loader = async ({request}: LoaderArgs) => {
  const user = await requireUser(request)
  const users = await prisma.user.findMany({})
  const workspaces = await getUserWorkspacesById(user.id)
  const collaborator = await getUserCollaboratorWorkspacesById(user.id)


  return json({users, workspaces, collaborator})
}

export default function WorkspaceIndex() {
  const {workspaces, collaborator} = useLoaderData<typeof loader>()
  const listType = useOutletContext()
  const navigate = useNavigate()

  const handleNavigate = (workspaceId: string) => {
    navigate(`./${workspaceId}`)
  }
  const data = listType === "workspaces" ? workspaces : collaborator

  return (
    <Box>
      {data.length ?
        data?.map(w => (
          <Paper
            onClick={() => handleNavigate(w.id)}
            sx={{cursor: "pointer"}}
            withBorder
            my={12}
            py={12}
            px={6}
            key={w.id}
          >
            <Text>{w.name}</Text>
            <Text size={"sm"} color={"dimmed"}>{dayjs(w.createdAt).format("DD/MM/YYYY")}</Text>
          </Paper>
        )) : (
          <Title order={5} align={"center"} my={24}>You currently not invited in any workspace</Title>
        )}
    </Box>
  )
}
