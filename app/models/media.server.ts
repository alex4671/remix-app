import type {Media} from "@prisma/client";
import {prisma} from "~/server/db.server";


export const getUserFiles = async (userId: Media["userId"]) => {
  const userFiles = await prisma.user.findUnique({
    where: {
      id: userId
    },
    select: {
      media: {
        orderBy: {
          createdAt: "asc"
        }
      }
    },

  })


  return userFiles?.media
}

export const saveFile = async (userId: Media["userId"], fileUrl: Media['fileUrl'], size: Media["size"], type: Media['type']) => {
  const file = await prisma.media.create({
    data: {
      userId,
      fileUrl,
      size,
      type,
    }
  })

  return file
}

type SaveFileType = Pick<Media, "userId" | "fileUrl" | "size" | "type">

export const saveFiles = async (files: SaveFileType[]) => {
  const file = await prisma.media.createMany({
    data: files
  })

  return file
}


export const deleteFile = (fileId: Media['id']) => {
  return prisma.media.delete({
    where: {
      id: fileId
    }
  })
}


export const deleteFiles = (filesIds: string[]) => {
  return prisma.media.deleteMany({
    where: {
      id: {
        in: filesIds
      }
    }
  })
}
