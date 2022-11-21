import type {Notes} from "@prisma/client";
import {prisma} from "~/server/db.server";


export const getAllUserNotes = (userId: Notes["ownerId"]) => {
  return prisma.notes.findMany({
    where: {
      ownerId: userId
    }
  })
}

export const getNoteById = (noteId: Notes["id"]) => {
  return prisma.notes.findUnique({
    where: {
      id: noteId
    }
  })
}

export const createNote = (userId: Notes["ownerId"], note: Notes["note"], image: Notes["preview"]) => {
  return prisma.notes.create({
    data: {
      ownerId: userId,
      note,
      preview: image
    }
  })
}

export const updateNote = (noteId: Notes["id"], newNote: Notes["note"]) => {
  return prisma.notes.update({
    where: {
      id: noteId
    },
    data: {
      note: newNote
    }
  })
}

export const deleteNote = (noteId: Notes["id"]) => {
  return prisma.notes.delete({
    where: {
      id: noteId
    }
  })
}
