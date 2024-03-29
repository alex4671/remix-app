import type { Media } from '@prisma/client';
import { prisma } from '~/server/db.server';

export type { Media } from '@prisma/client';

export const getAllUserFiles = (userId: Media['userId']) => {
	return prisma.media.findMany({
		where: {
			userId,
		},
		orderBy: {
			createdAt: 'desc',
		},
	});
};

export const getUserFiles = (
	userId: Media['userId'],
	from: Date | undefined = undefined,
	to: Date | undefined = undefined,
	order: 'asc' | 'desc' = 'asc',
	isPublic: 'yes' | 'no' = 'no',
) => {
	return prisma.media.findMany({
		where: {
			userId,
			createdAt: {
				gte: from,
				lte: to,
			},
			public: isPublic === 'yes' ? true : undefined,
		},
		orderBy: {
			createdAt: order,
		},
	});
};

export const getUserFilesSize = async (userId: Media['userId']) => {
	const userFiles = await getUserFiles(userId);

	return userFiles?.reduce((acc, item) => acc + item.size, 0);
};

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

type SaveFileType = Pick<
	Media,
	'userId' | 'workspaceId' | 'fileUrl' | 'name' | 'size' | 'type'
>;

// todo remove this
type SaveFileType2 = Pick<
	Media,
	'userId' | 'fileUrl' | 'name' | 'size' | 'type'
>;

export const getRecordings = (userId: Media['userId']) => {
	return prisma.media.findMany({
		where: {
			userId,
			workspaceId: null,
		},
	});
};

export const getRecordById = (recordId: Media['id']) => {
	return prisma.media.findUnique({
		where: {
			id: recordId,
		},
	});
};

export const saveFile = (file: SaveFileType2) => {
	console.log('file', file);
	return prisma.media.create({
		data: file,
	});
};

export const saveFiles = (files: SaveFileType[]) => {
	return prisma.media.createMany({
		data: files,
	});
};

export const togglePublic = (fileId: Media['id'], checked: Media['public']) => {
	return prisma.media.update({
		where: {
			id: fileId,
		},
		data: {
			public: checked,
		},
	});
};

export const getFileById = (fileId: Media['id']) => {
	return prisma.media.findUnique({
		where: {
			id: fileId,
		},
	});
};

export const deleteFile = (fileId: Media['id']) => {
	return prisma.media.delete({
		where: {
			id: fileId,
		},
	});
};

export const deleteFiles = (filesIds: string[]) => {
	return prisma.media.deleteMany({
		where: {
			id: {
				in: filesIds,
			},
		},
	});
};

export const updateFileWorkspace = (
	fileId: Media['id'],
	newWorkspaceId: Media['workspaceId'],
) => {
	return prisma.media.update({
		where: { id: fileId },
		data: { workspaceId: newWorkspaceId },
	});
};
