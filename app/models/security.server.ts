import type { SecurityLog } from '@prisma/client';
import { prisma } from '~/server/db.server';

export const SecurityLogActions = {
	USER_LOGIN: 'user.login',
	USER_SIGNUP: 'user.sign_up',
};

export const getUserSecurityLog = (userId: SecurityLog['userId']) => {
	return prisma.securityLog.findMany({
		where: {
			userId,
		},
		include: {
			user: {
				select: {
					email: true,
				},
			},
		},
		orderBy: {
			createdAt: 'desc',
		},
	});
};

export const createSecurityLogEntry = (
	userId: SecurityLog['userId'],
	action: SecurityLog['action'],
	ipAddress: SecurityLog['ipAddress'],
) => {
	return prisma.securityLog.create({
		data: {
			userId,
			action,
			ipAddress,
		},
	});
};

export const deleteSecurityLogEntry = (id: SecurityLog['id']) => {
	return prisma.securityLog.delete({
		where: {
			id,
		},
	});
};
