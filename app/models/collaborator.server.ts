import type {Collaborator} from "@prisma/client";
import {prisma} from "~/server/db.server";

export const createCollaborator = (workspaceId: Collaborator["workspaceId"], userId: Collaborator["userId"]) => {
  return prisma.collaborator.create({
    data: {
      workspaceId,
      userId,
      rights: {upload: false, delete: false},
      role: "COLLABORATOR",
    }
  })
}

export const deleteCollaborator = (collaboratorId: Collaborator["id"]) => {
  return prisma.collaborator.delete({
    where: {
      id: collaboratorId
    }
  })
}
export const updateCollaboratorRights = (collaboratorId: Collaborator["id"], rights: string) => {
  return prisma.collaborator.update({
    where: {
      id: collaboratorId
    },
    data: {
      rights: JSON.parse(rights),
    }
  })
}
