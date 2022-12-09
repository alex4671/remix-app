import type { Bookmarks } from '@prisma/client';
import { prisma } from '~/server/db.server';

export const getAllUserBookmarks = (userId: Bookmarks['ownerId']) => {
	return prisma.bookmarks.findMany({
		where: {
			ownerId: userId,
		},
	});
};

export const getBookmarkById = (noteId: Bookmarks['id']) => {
	return prisma.bookmarks.findUnique({
		where: {
			id: noteId,
		},
	});
};

export const createBookmark = (
	userId: Bookmarks['ownerId'],
	bookmarkUrl: Bookmarks['bookmarkUrl'],
) => {
	return prisma.bookmarks.create({
		data: {
			ownerId: userId,
			bookmarkUrl,
		},
	});
};

export const updateBookmark = (
	bookmarkId: Bookmarks['id'],
	newBookmarkUrl: Bookmarks['bookmarkUrl'],
) => {
	return prisma.bookmarks.update({
		where: {
			id: bookmarkId,
		},
		data: {
			bookmarkUrl: newBookmarkUrl,
		},
	});
};

export const deleteBookmark = (noteId: Bookmarks['id']) => {
	return prisma.bookmarks.delete({
		where: {
			id: noteId,
		},
	});
};
