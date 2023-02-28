import { prisma } from '~/server/db.server';

export const getChangelog = () => {
	return prisma.changelog.findMany();
};
