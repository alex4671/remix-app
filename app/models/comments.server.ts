import type { Comments } from '@prisma/client';
import { prisma } from '~/server/db.server';

export const getCommentsByMediaId = (mediaId: Comments['mediaId']) => {
	return prisma.media.findUnique({
		where: {
			id: mediaId,
		},
		select: {
			comments: true,
		},
	});
};

export const createComment = (
	userId: Comments['userId'],
	comment: Comments['comment'],
	mediaId: Comments['mediaId'],
) => {
	return prisma.comments.create({
		data: {
			comment,
			userId,
			mediaId,
		},
	});
};

export const deleteComment = (commentId: Comments['id']) => {
	return prisma.comments.delete({
		where: {
			id: commentId,
		},
	});
};
