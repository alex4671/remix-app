import {
	Box,
	FileButton,
	Group,
	Image,
	Stack,
	Text,
	TextInput,
} from '@mantine/core';
import type { ActionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Form, useActionData, useFetcher } from '@remix-run/react';
import replicate from '~/server/replicate.server';

import { PutObjectCommand } from '@aws-sdk/client-s3';
import { IconUpload } from '@tabler/icons-react';
import { useRef, useState } from 'react';
import { DangerButton } from '~/components/Buttons/DangerButtom';
import { PrimaryButton } from '~/components/Buttons/PrimaryButton';
import { generateSignedUrl } from '~/models/storage.server';
import { client } from '~/server/s3.server';
import { requireUser } from '~/server/session.server';
import replicateClient, { createZipFolder } from '~/utils/aiUtils.server';

export const action = async ({ request }: ActionArgs) => {
	const user = await requireUser(request);
	const formData = await request.formData();

	const intent = formData.get('intent')?.toString() ?? '';

	if (intent === 'uploadFiles') {
		const { CLOUDFLARE_PUBLIC_FILE_URL, BUCKET_NAME } = process.env;

		const files = formData.getAll('file') as File[];

		const filesToDB = [];
		const filesUrls = [];

		if (!files.length) {
			return json({
				success: false,
				intent,
				message: 'Select at leas one file',
			});
		}

		for (const file of files) {
			const key = `${user.id}/test/${Date.now()}--${file.name}`;

			try {
				const signedUrl = await generateSignedUrl(file.type, key);
				await fetch(signedUrl, { method: 'PUT', body: file });
				const fileUrl = `${CLOUDFLARE_PUBLIC_FILE_URL}/${key}`;
				filesUrls.push(fileUrl);
				filesToDB.push({
					userId: user.id,
					fileUrl,
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
		console.log('filesToDB', filesToDB);
		// await saveFiles(filesToDB);

		const buffer = await createZipFolder(filesUrls);

		const s3response = await client.send(
			new PutObjectCommand({
				Bucket: BUCKET_NAME,
				Key: `test4.zip`,
				Body: buffer,
			}),
		);

		console.log('s3response', s3response);

		return json({
			success: true,
			intent,
			message: `${filesToDB.length} files uploaded`,
		});
	}

	if (intent === 'trainModel') {
		const responseReplicate = await replicateClient.post(
			'/v1/trainings',
			{
				input: {
					instance_prompt: `a photo of nastya`,
					class_prompt: `a photo of a woman`,
					instance_data: 'https://storage.alexkulchenko.com/test4.zip',
					max_train_steps: 2000,
					num_class_images: 200,
					learning_rate: 1e-6,
				},
				model: `alex4671/nastya`,
			},
			{
				headers: {
					Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
					'Content-Type': 'application/json',
				},
			},
		);

		const replicateModelId = responseReplicate.data.id as string;

		console.log('responseReplicate', responseReplicate);
		console.log('replicateModelId', replicateModelId);

		return json({ replicateModelId });
	}

	if (intent === 'predict') {
		const prompt = formData.get('prompt')?.toString() ?? '';
		// const neutral = formData.get('neutral')?.toString() ?? '';
		// const target = formData.get('target')?.toString() ?? '';

		// try https://replicate.com/timothybrooks/instruct-pix2pix
		const prediction = await replicate
			.version(
				'285327fb116e1bd7fbbddccf337fb4b44624d14a1a5648d5296d0359eb149eb6',
			)
			.predict(
				{
					prompt,
					width: 512,
					height: 512,
					num_outputs: 1,
					num_inference_steps: 50,
					guidance_scale: 7.5,
				},
				{
					onUpdate: (prediction) => {
						console.log('predictions', prediction.output);
					},
				},
			);

		return json({ output: prediction.output });
	}

	return json({});
};

export default function AI() {
	const actionData = useActionData<typeof action>();
	const fetcher = useFetcher();
	const [files, setFiles] = useState<File[] | null>(null);
	const resetRef = useRef<() => void>(null);
	console.log('actionData', actionData);

	const handleSelectFile = (files: File[]) => {
		const newFilesSize = files.reduce((acc, file) => acc + file.size, 0);

		setFiles(files);
		// if (newFilesSize + (filesSize ?? 0) <= maxSizeLimit) {
		// 	setFiles(files);
		// } else {
		// 	setFiles(null);
		// 	resetRef.current?.();
		// }
	};
	const handleCancel = () => {
		setFiles(null);
		resetRef.current?.();
	};

	return (
		<Box>
			<fetcher.Form
				method={'post'}
				encType={'multipart/form-data'}
			>
				<FileButton
					resetRef={resetRef}
					onChange={handleSelectFile}
					name={'file'}
					multiple
				>
					{(props) => (
						<PrimaryButton
							leftIcon={<IconUpload size={'14'} />}
							// disabled={Number(filesSize) >= maxSizeLimit || !rights?.upload}
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
			</fetcher.Form>
			{files ? (
				<Group my={'xl'}>
					{files.map((file) => (
						<Image
							key={file.name}
							src={URL.createObjectURL(file)}
							width={100}
							height={100}
							fit="contain"
						/>
					))}
				</Group>
			) : null}
			<fetcher.Form method={'post'}>
				<PrimaryButton
					type={'submit'}
					name={'intent'}
					value={'trainModel'}
					disabled
				>
					Train model
				</PrimaryButton>
			</fetcher.Form>
			<Form method={'post'}>
				<Stack align={'flex-start'}>
					<TextInput
						placeholder={'Input prompt'}
						name={'prompt'}
						miw={'400px'}
						autoComplete={'off'}
					/>
					{/*<TextInput*/}
					{/*	placeholder={'Enter prompt for image'}*/}
					{/*	name={'neutral'}*/}
					{/*	defaultValue={'a face'}*/}
					{/*	miw={'400px'}*/}
					{/*	autoComplete={'off'}*/}
					{/*/>*/}
					{/*<TextInput*/}
					{/*	placeholder={'Enter prompt for image'}*/}
					{/*	name={'target'}*/}
					{/*	// defaultValue={'painting of a cat by andy warhol'}*/}
					{/*	miw={'400px'}*/}
					{/*	autoComplete={'off'}*/}
					{/*/>*/}
					<PrimaryButton
						type={'submit'}
						name={'intent'}
						value={'predict'}
					>
						Generate image
					</PrimaryButton>
				</Stack>
				{actionData?.output ? <Image src={actionData?.output} /> : null}
			</Form>
		</Box>
	);
}
