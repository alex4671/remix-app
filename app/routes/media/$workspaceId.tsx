import { useInputState } from '@mantine/hooks';
import type { ActionArgs, LoaderArgs, SerializeFrom } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import dayjs from 'dayjs';
import { useState } from 'react';
import invariant from 'tiny-invariant';
import { FilesFilters } from '~/components/MediaManager/FilesFilters';
import { FilesGrid } from '~/components/MediaManager/FilesGrid';
import { FilesList } from '~/components/MediaManager/FilesList';
import { UploadFile } from '~/components/MediaManager/UploadFile';
import { EventType, useSubscription } from '~/hooks/useSubscription';
import { createComment, deleteComment } from '~/models/comments.server';
import {
	deleteFile,
	deleteFiles,
	getUserFilesSize,
	saveFiles,
	togglePublic,
} from '~/models/media.server';
import { deleteFileFromS3, generateSignedUrl } from '~/models/storage.server';
import {
	getWorkspaceFilesById,
	getWorkspacesById,
	isUserAllowedViewWorkspace,
} from '~/models/workspace.server';
import { emitter } from '~/server/emitter.server';
import { requireUser } from '~/server/session.server';
import { getFileKey, useUser } from '~/utils/utils';

type Rights = {
	delete: boolean;
	upload: boolean;
	comment: boolean;
};

export type WorkspaceLoader = SerializeFrom<typeof loader>;

export const loader = async ({ request, params }: LoaderArgs) => {
	const user = await requireUser(request);
	const workspaceId = params.workspaceId;
	invariant(typeof workspaceId === 'string', 'Workspace Id must be provided');

	const isUserAllowedView = await isUserAllowedViewWorkspace(
		user.id,
		workspaceId,
	);

	if (!isUserAllowedView) {
		return redirect('/');
	}

	const url = new URL(request.url);
	const defaultFrom = url.searchParams.get('from');
	const defaultTo = url.searchParams.get('to');
	const defaultOrder = url.searchParams.get('order') ?? 'asc';
	const defaultPublic = url.searchParams.get('public') ?? 'no';

	const from = defaultFrom
		? dayjs(defaultFrom, 'DD-MM-YYYY').startOf('day').toDate()
		: undefined;
	const to = defaultTo
		? dayjs(defaultTo, 'DD-MM-YYYY').endOf('day').toDate()
		: undefined;

	const userFiles = await getWorkspaceFilesById(
		workspaceId,
		from,
		to,
		defaultOrder,
		defaultPublic,
		user.id,
	);
	const filesSize = userFiles?.media?.reduce((acc, item) => acc + item.size, 0);

	const rights =
		userFiles?.ownerId === user.id
			? { upload: true, delete: true, comment: true }
			: (userFiles?.collaborator?.find((c) => c.userId === user.id)
					?.rights as Rights);

	return json({
		origin: url.origin,
		rights,
		userFiles: userFiles?.media ?? [],
		filesSize,
		maxSizeLimit: user.payment ? 3221225472 : 314572800, // 3gb vs 300mb
	});
};

export const action = async ({ request, params }: ActionArgs) => {
	const workspaceId = params.workspaceId;
	invariant(typeof workspaceId === 'string', 'Workspace Id must be provided');
	const user = await requireUser(request);
	const { CLOUDFLARE_PUBLIC_FILE_URL } = process.env;

	invariant(
		CLOUDFLARE_PUBLIC_FILE_URL,
		'CLOUDFLARE_PUBLIC_FILE_URL must be set',
	);

	const workspace = await getWorkspacesById(workspaceId);

	const set = new Set();
	workspace?.collaborator.map((c) => set.add(c.userId));

	const usersToNotify = [workspace?.owner.id, ...Array.from(set)];

	const formData = await request.formData();
	const intent = formData.get('intent');

	const sessionId = formData.get('sessionId')?.toString() ?? '';

	if (intent === 'uploadFiles') {
		const filesSize = await getUserFilesSize(user.id);
		const files = formData.getAll('file') as File[];

		const maxSizeLimit = user.payment ? 3221225472 : 314572800;
		const newFilesSize = files.reduce((acc, file) => acc + file.size, 0);

		if (newFilesSize + (filesSize ?? 0) >= maxSizeLimit) {
			return json({
				success: false,
				intent,
				message: 'Select other files or delete existing',
			});
		}

		const filesToDB = [];

		if (!files.length) {
			return json({
				success: false,
				intent,
				message: 'Select at leas one file',
			});
		}

		for (const file of files) {
			const key = `${user.id}/workspace/${workspaceId}/${Date.now()}--${
				file.name
			}`;

			try {
				const signedUrl = await generateSignedUrl(file.type, key);
				await fetch(signedUrl, { method: 'PUT', body: file });
				const fileUrl = `${CLOUDFLARE_PUBLIC_FILE_URL}/${key}`;
				filesToDB.push({
					userId: user.id,
					fileUrl,
					workspaceId,
					name: file.name,
					size: file.size,
					type: file.type,
				});
			} catch (e) {
				return json({
					success: false,
					intent,
					message: 'Error uploading file',
				});
			}
		}

		await saveFiles(filesToDB);

		emitter.emit(EventType.UPLOAD_FILE, usersToNotify, sessionId);

		return json({
			success: true,
			intent,
			message: `${filesToDB.length} files uploaded`,
		});
	}

	if (intent === 'deleteFile') {
		const fileId = formData.get('fileId')?.toString() ?? '';

		try {
			const file = await deleteFile(fileId);
			await deleteFileFromS3(getFileKey(file.fileUrl));
		} catch (e) {
			return json({ success: false, intent, message: 'Error deleting avatar' });
		}

		emitter.emit(EventType.DELETE_FILE, usersToNotify, sessionId);
		return json({ success: true, intent, message: 'File deleted' });
	}

	if (intent === 'deleteFiles') {
		const filesIdsToDelete = formData.get('filesToDeleteIds')?.toString() ?? '';
		const filesUrlsToDelete =
			formData.get('filesToDeleteUrls')?.toString() ?? '';

		const parsedFilesIdsToDelete = JSON.parse(filesIdsToDelete);
		const parsedFilesUrlsToDelete = JSON.parse(filesUrlsToDelete);

		try {
			await deleteFiles(parsedFilesIdsToDelete);

			for (const url of parsedFilesUrlsToDelete) {
				await deleteFileFromS3(getFileKey(url));
			}
		} catch (e) {
			return json({ success: false, intent, message: 'Error deleting files' });
		}

		emitter.emit(EventType.DELETE_FILE, usersToNotify, sessionId);
		return json({
			success: true,
			intent,
			message: `${parsedFilesIdsToDelete.length} files deleted`,
		});
	}

	if (intent === 'togglePublic') {
		const checked = formData.get('checked')?.toString() ?? '';
		const fileId = formData.get('fileId')?.toString() ?? '';

		try {
			await togglePublic(fileId, checked === 'true');

			emitter.emit(EventType.UPDATE_FILE, usersToNotify, sessionId);
			return json({
				success: true,
				intent,
				message: `File now ${checked === 'true' ? 'public' : 'private'}`,
			});
		} catch (e) {
			return json({
				success: false,
				intent,
				message: `Error making file ${checked ? 'Public' : 'Private'}`,
			});
		}
	}

	if (intent === 'createComment') {
		const mediaId = formData.get('mediaId')?.toString() ?? '';
		const comment = formData.get('comment')?.toString() ?? '';

		try {
			await createComment(user.id, comment, mediaId);

			emitter.emit(EventType.CREATE_COMMENT, usersToNotify, sessionId);
			return json({ success: true, intent, message: `Comment added` });
		} catch (e) {
			return json({ success: false, intent, message: `Error adding comment` });
		}
	}

	if (intent === 'deleteComment') {
		const commentId = formData.get('commentId')?.toString() ?? '';

		try {
			await deleteComment(commentId);

			emitter.emit(EventType.DELETE_COMMENT, usersToNotify, sessionId);
			return json({ success: true, intent, message: `Comment deleted` });
		} catch (e) {
			return json({
				success: false,
				intent,
				message: `Error deleting comment`,
			});
		}
	}

	return json({ success: false, intent, message: 'Some error' });
};

// todo maybe add valtio for state managment

export default function WorkspaceId() {
	const user = useUser();
	const { userFiles } = useLoaderData<typeof loader>();

	const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
	const [selectedFilesUrls, setSelectedFilesUrls] = useState<string[]>([]);
	const [searchValue, setSearchValue] = useInputState('');
	const [filterTypeValue, setFilterTypeValue] = useState<string[]>([]);
	const [viewType, setViewType] = useState<'grid' | 'list'>('grid');

	useSubscription(`/api/subscriptions/files/${user.id}`, [
		EventType.DELETE_WORKSPACE,
		EventType.REMOVE_ACCESS,
		EventType.UPLOAD_FILE,
		EventType.DELETE_FILE,
		EventType.UPDATE_FILE,
		EventType.CREATE_COMMENT,
		EventType.DELETE_COMMENT,
		EventType.UPDATE_RIGHTS,
	]);

	// todo make limit usage in backend

	const filteredUserFiles = userFiles
		?.filter((file) =>
			file.name.toLowerCase().includes(searchValue.toLowerCase()),
		)
		?.filter((file) =>
			filterTypeValue.length
				? filterTypeValue.includes(file.type.split('/')[1])
				: true,
		);

	// todo map filteredUserFiles here
	return (
		<>
			<UploadFile
				selectedFiles={selectedFiles}
				selectedFilesUrls={selectedFilesUrls}
				setSelectedFiles={setSelectedFiles}
				setSelectedFilesUrls={setSelectedFilesUrls}
				filteredUserFilesCount={filteredUserFiles.length}
			/>
			<FilesFilters
				filterTypeValue={filterTypeValue}
				searchValue={searchValue}
				setFilterTypeValue={setFilterTypeValue}
				setSearchValue={setSearchValue}
				viewType={viewType}
				setViewType={setViewType}
			/>
			{viewType === 'grid' ? (
				<FilesGrid
					setSelectedFiles={setSelectedFiles}
					setSelectedFilesUrls={setSelectedFilesUrls}
					filteredUserFiles={filteredUserFiles}
					filterTypeValue={filterTypeValue}
					selectedFiles={selectedFiles}
				/>
			) : (
				<FilesList
					setSelectedFiles={setSelectedFiles}
					setSelectedFilesUrls={setSelectedFilesUrls}
					filteredUserFiles={filteredUserFiles}
					selectedFiles={selectedFiles}
				/>
			)}
		</>
	);
}
