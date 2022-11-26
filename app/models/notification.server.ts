import type { NotificationSettings } from '@prisma/client';
import { prisma } from '~/server/db.server';

export const getUserNotifications = (
	userId: NotificationSettings['userId'],
) => {
	return prisma.notificationSettings.findUnique({
		where: {
			userId,
		},
	});
};

export const saveUserNotifications = (
	userId: NotificationSettings['userId'],
	notifications: any,
) => {
	return prisma.notificationSettings.upsert({
		where: {
			userId,
		},
		create: {
			...notifications,
			userId: userId,
		},
		update: {
			...notifications,
		},
	});
};
