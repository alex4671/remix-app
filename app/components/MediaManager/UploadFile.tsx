import { Affix, FileButton, Group, Paper, Text } from '@mantine/core';
import { useFetcher, useLoaderData } from '@remix-run/react';
import { IconUpload } from '@tabler/icons-react';
import type { Dispatch, SetStateAction } from 'react';
import { useEffect, useRef, useState } from 'react';
import { DangerButton } from '~/components/Buttons/DangerButtom';
import { PrimaryButton } from '~/components/Buttons/PrimaryButton';
import { SecondaryButton } from '~/components/Buttons/SecondaryButton';
import { HiddenSessionId } from '~/components/Utils/HiddenSessionId';
import type { loader } from '~/routes/media/$workspaceId';

interface Props {
	selectedFiles: string[];
	selectedFilesUrls: string[];
	setSelectedFiles: Dispatch<SetStateAction<string[]>>;
	setSelectedFilesUrls: Dispatch<SetStateAction<string[]>>;
	filteredUserFilesCount: number;
}

export const UploadFile = ({
	selectedFiles,
	selectedFilesUrls,
	setSelectedFiles,
	setSelectedFilesUrls,
	filteredUserFilesCount,
}: Props) => {
	const { userFiles, filesSize, maxSizeLimit, rights } =
		useLoaderData<typeof loader>();
	const fetcher = useFetcher();

	const [files, setFiles] = useState<File[] | null>(null);
	const resetRef = useRef<() => void>(null);

	useEffect(() => {
		if (fetcher.data) {
			if (fetcher.submission?.formData.get('intent') === 'uploadFiles') {
				setFiles(null);
				resetRef.current?.();

				return;
			}

			if (fetcher.submission?.formData.get('intent') === 'deleteFiles') {
				setSelectedFiles([]);
				setSelectedFilesUrls([]);

				return;
			}
		}
	}, [fetcher.data]);

	const handleSelectFile = (files: File[]) => {
		const newFilesSize = files.reduce((acc, file) => acc + file.size, 0);

		if (newFilesSize + (filesSize ?? 0) <= maxSizeLimit) {
			setFiles(files);
		} else {
			setFiles(null);
			resetRef.current?.();
		}
	};

	const handleCancel = () => {
		setFiles(null);
		setSelectedFiles([]);
		setSelectedFilesUrls([]);
		resetRef.current?.();
	};

	const handleSelectAllFiles = () => {
		setSelectedFiles((prevState) =>
			prevState.length === userFiles?.length
				? []
				: userFiles?.map((file) => file.id) ?? [],
		);
		setSelectedFilesUrls((prevState) =>
			prevState.length === userFiles?.length
				? []
				: userFiles?.map((file) => file.fileUrl) ?? [],
		);
	};

	const handleCancelPick = () => {
		setSelectedFiles([]);
		setSelectedFilesUrls([]);
	};

	// todo make new upload ui with preview/
	// todo bug with usage count when filtering
	return (
		<Group position={'apart'}>
			<Group>
				{selectedFiles.length ? (
					<Affix
						position={{ bottom: 20, left: '50%' }}
						style={{ transform: 'translateX(-50%)' }}
					>
						<Paper
							withBorder
							shadow="sm"
							p="md"
						>
							<fetcher.Form method={'post'}>
								<Group>
									<HiddenSessionId />
									<input
										type="hidden"
										name={'filesToDeleteIds'}
										value={JSON.stringify(selectedFiles)}
									/>
									<input
										type="hidden"
										name={'filesToDeleteUrls'}
										value={JSON.stringify(selectedFilesUrls)}
									/>
									<DangerButton
										type={'submit'}
										name={'intent'}
										value={'deleteFiles'}
										disabled={!rights?.delete}
										onClick={() => console.log('test')}
									>
										Delete {selectedFiles.length} files
									</DangerButton>
									<SecondaryButton onClick={handleSelectAllFiles}>
										{selectedFiles.length === userFiles?.length
											? 'Deselect all'
											: 'Select all'}
									</SecondaryButton>
									<SecondaryButton onClick={handleCancelPick}>
										Cancel
									</SecondaryButton>
								</Group>
							</fetcher.Form>
						</Paper>
					</Affix>
				) : null}
				<fetcher.Form
					method={'post'}
					encType={'multipart/form-data'}
				>
					<HiddenSessionId />
					<Group>
						<FileButton
							resetRef={resetRef}
							onChange={handleSelectFile}
							name={'file'}
							multiple
						>
							{(props) => (
								<PrimaryButton
									leftIcon={<IconUpload size={'14'} />}
									disabled={
										Number(filesSize) >= maxSizeLimit || !rights?.upload
									}
									{...props}
								>
									Select Files
								</PrimaryButton>
							)}
						</FileButton>

						{files ? (
							<>
								<Text>{files.length} file selected</Text>
								<PrimaryButton
									type={'submit'}
									name={'intent'}
									value={'uploadFiles'}
								>
									Upload
								</PrimaryButton>
								<DangerButton onClick={handleCancel}>Cancel</DangerButton>
							</>
						) : null}
					</Group>
				</fetcher.Form>
			</Group>
			{/*{filesSize !== 0 ? (*/}
			{/*  <Tooltip*/}
			{/*    label={`${formatBytes(filesSize)} of ${formatBytes(maxSizeLimit)}`}*/}
			{/*    withArrow*/}
			{/*  >*/}
			{/*    <Text component={"span"}>*/}
			{/*      {filteredUserFilesCount} files, Used: {Math.round((100 / maxSizeLimit) * (filesSize ?? 0))}%*/}
			{/*    </Text>*/}
			{/*  </Tooltip>*/}
			{/*) : null}*/}
		</Group>
	);
};
