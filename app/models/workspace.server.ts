import type { User, Workspace } from '@prisma/client';
import { prisma } from '~/server/db.server';

export const getAllowedWorkspaces = (userId: User['id']) => {
	return prisma.workspace.findMany({
		where: {
			OR: [
				{
					ownerId: userId,
				},
				{
					collaborator: {
						some: {
							userId,
						},
					},
				},
			],
		},
		include: {
			media: true,
			owner: true,
			collaborator: {
				include: {
					user: true,
				},
			},
		},
	});
};

export const getWorkspacesById = (workspaceId: Workspace['id']) => {
	return prisma.workspace.findUnique({
		where: {
			id: workspaceId,
		},
		include: {
			collaborator: {
				include: {
					user: {
						select: {
							email: true,
						},
					},
				},
			},
			owner: true,
		},
	});
};

export const getUserWorkspacesById = (userId: User['id']) => {
	return prisma.workspace.findMany({
		where: {
			ownerId: userId,
		},
	});
};
export const getUserCollaboratorWorkspacesById = (userId: User['id']) => {
	return prisma.workspace.findMany({
		where: {
			collaborator: {
				some: {
					userId,
				},
			},
		},
		include: {
			collaborator: {
				select: {
					id: true,
					userId: true,
				},
			},
		},
		orderBy: {
			createdAt: 'asc',
		},
	});
};

export const getWorkspaceFilesById = (
	workspaceId: Workspace['id'],
	from: Date | undefined = undefined,
	to: Date | undefined = undefined,
	order: 'asc' | 'desc' = 'asc',
	isPublic: 'yes' | 'no' = 'no',
	userId: User['id'],
) => {
	return prisma.workspace.findUnique({
		where: {
			id: workspaceId,
		},
		select: {
			ownerId: true,
			collaborator: {
				where: {
					userId,
				},
				select: {
					rights: true,
					userId: true,
				},
			},
			media: {
				where: {
					createdAt: {
						gte: from,
						lte: to,
					},
					public: isPublic === 'yes' ? true : undefined,
				},
				include: {
					comments: {
						include: {
							user: {
								select: {
									email: true,
									avatarUrl: true,
								},
							},
						},
						orderBy: {
							createdAt: 'asc',
						},
					},
				},
				orderBy: {
					createdAt: order,
				},
			},
		},
	});
};

export const isUserAllowedViewWorkspace = async (
	userId: User['id'],
	workspaceId: Workspace['id'],
) => {
	const workspace = await prisma.workspace.findUnique({
		where: {
			id: workspaceId,
		},
		include: {
			collaborator: {
				select: {
					userId: true,
				},
			},
		},
	});

	return (
		workspace?.ownerId === userId ||
		workspace?.collaborator.some((c) => c.userId === userId)
	);
};

export const createWorkspace = (
	ownerId: Workspace['ownerId'],
	name: Workspace['name'],
	nextSortIndex: Workspace['sortIndex'],
) => {
	return prisma.workspace.create({
		data: {
			name,
			ownerId,
			sortIndex: nextSortIndex,
		},
	});
};

export const updateWorkspaceSortOrder = (
	workspaceId: Workspace['id'],
	newSortIndex: Workspace['sortIndex'],
) => {
	return prisma.workspace.update({
		where: {
			id: workspaceId,
		},
		data: {
			sortIndex: newSortIndex,
		},
	});
};

export const updateWorkspaceName = (
	workspaceId: Workspace['id'],
	newName: Workspace['name'],
) => {
	return prisma.workspace.update({
		where: {
			id: workspaceId,
		},
		data: {
			name: newName,
		},
		select: {
			ownerId: true,
			collaborator: {
				select: {
					userId: true,
				},
			},
		},
	});
};

export const deleteWorkspace = (workspaceId: Workspace['id']) => {
	return prisma.workspace.delete({
		where: {
			id: workspaceId,
		},
		select: {
			ownerId: true,
			collaborator: {
				select: {
					userId: true,
				},
			},
			media: {
				select: {
					fileUrl: true,
				},
			},
		},
	});
};
