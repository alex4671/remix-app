import type { Changelog } from '@prisma/client';
import { prisma } from '~/server/db.server';

export const getChangelog = () => {
	return prisma.changelog.findMany();
};

export const createChangelogEntry = (
	content: Changelog['content'],
	date: Changelog['date'],
) => {
	return prisma.changelog.create({
		data: {
			content,
			date,
			image: '',
		},
	});
};

export const updateChangelogEntry = (
	id: Changelog['id'],
	content: Changelog['content'],
	date: Changelog['date'],
) => {
	return prisma.changelog.update({
		where: {
			id,
		},
		data: {
			content,
			date,
		},
	});
};

export const deleteChangelogEntry = (id: Changelog['id']) => {
	return prisma.changelog.delete({
		where: {
			id,
		},
	});
};
