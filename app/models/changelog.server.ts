import type { Changelog } from '@prisma/client';
import { prisma } from '~/server/db.server';

export const getChangelog = () => {
	return prisma.changelog.findMany();
};

export const deleteChangelogEntry = (id: Changelog['id']) => {
	return prisma.changelog.delete({
		where: {
			id,
		},
	});
};
