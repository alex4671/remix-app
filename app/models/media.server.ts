import type {Media} from "@prisma/client";
import {prisma} from "~/server/db.server";


export const getUserFiles = (userId: Media["userId"], from: Date | undefined = undefined, to: Date | undefined = undefined) => {
  return prisma.media.findMany({
    where: {
      userId,
      createdAt: {
        gte: from,
        lte: to,
      }
    },
    orderBy: {
      createdAt: "asc"
    }
  })
}

export const getUserFilesSize = async (userId: Media["userId"]) => {
  const userFiles = await getUserFiles(userId)

  return userFiles?.reduce((acc, item) => acc + item.size, 0)
}

// export const saveFile = async (userId: Media["userId"], fileUrl: Media['fileUrl'], size: Media["size"], type: Media['type']) => {
//   const file = await prisma.media.create({
//     data: {
//       userId,
//       fileUrl,
//       size,
//       type,
//     }
//   })
//
//   return file
// }

type SaveFileType = Pick<Media, "userId" | "fileUrl" | "name" | "size" | "type">

export const saveFiles = (files: SaveFileType[]) => {
  return prisma.media.createMany({
    data: files
  })
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
