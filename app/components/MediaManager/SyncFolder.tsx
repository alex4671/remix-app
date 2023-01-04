import { Button, Group } from '@mantine/core';

const dirName = 'directoryToGetName';
export const SyncFolder = ({ fileUrls }: { fileUrls: string[] }) => {
	const handleSyncFolder = async () => {
		console.log('test');

		// const [fileHandle] = await window?.showOpenFilePicker({});
		const dirHandle = await window.showDirectoryPicker();
		const promises = [];
		for await (const entry of dirHandle.values()) {
			if (entry.kind !== 'file') {
				continue;
			}
			promises.push(
				entry.getFile().then((file) => `${file.name} (${file.size})`),
			);
		}
		console.log(await Promise.all(promises));
		// if (fileHandle.kind === 'file') {
		// 	console.log('file', fileHandle);
		// 	const file = await fileHandle.getFile();
		// 	console.log('file', file);
		// } else if (fileHandle.kind === 'directory') {
		// 	console.log('directory', fileHandle);
		// }
	};

	async function getNewFileHandle() {
		const handle = await window.showSaveFilePicker({
			suggestedName: 'test.jpg',
		});
		return handle;
	}

	async function writeURLToFile(fileHandle, url) {
		// Create a FileSystemWritableFileStream to write to.
		const writable = await fileHandle.createWritable();
		// Make an HTTP request for the contents.
		const response = await fetch(url, { mode: 'no-cors' });

		console.log('response', response);

		// Stream the response into the file.
		await response.body.pipeTo(writable);
		// pipeTo() closes the destination pipe by default, no need to close it.
	}

	const test = async () => {
		const handle = await getNewFileHandle();

		for (const url of fileUrls) {
			await writeURLToFile(handle, url);
		}
	};

	return (
		<Group my={24}>
			<Button onClick={handleSyncFolder}>Sync folder</Button>
			<Button onClick={test}>Test</Button>
		</Group>
	);
};
