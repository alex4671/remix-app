import { Button, Image, Stack, TextInput } from '@mantine/core';
import type { ActionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Form, useActionData } from '@remix-run/react';

import replicate from '~/server/replicate.server';
import { requireUser } from '~/server/session.server';

export const action = async ({ request }: ActionArgs) => {
	const user = await requireUser(request);
	const formData = await request.formData();

	const intent = formData.get('intent')?.toString() ?? '';
	const input = formData.get('input')?.toString() ?? '';
	const neutral = formData.get('neutral')?.toString() ?? '';
	const target = formData.get('target')?.toString() ?? '';

	const prediction = await replicate
		.version('7af9a66f36f97fee2fece7dcc927551a951f0022cbdd23747b9212f23fc17021')
		.predict(
			{
				input,
				neutral,
				target,
			},
			{
				onUpdate: (prediction) => {
					console.log('predictions', prediction.output);
				},
			},
		);

	console.log('intent', intent);
	console.log('prediction', prediction);
	return json({ output: prediction.output });
};

export default function AI() {
	const actionData = useActionData<typeof action>();

	console.log('actionData', actionData);
	return (
		<Form method={'post'}>
			<Stack align={'flex-start'}>
				<TextInput
					placeholder={'Enter prompt for image'}
					name={'input'}
					defaultValue={
						'https://storage.alexkulchenko.com/clefp66gq0000uxw0nlbalt31/workspace/clefp6ekq0003uxw0vrwgtqb8/1677090104853--photo_2022-11-20_21-53-46.jpg'
					}
					miw={'400px'}
					autoComplete={'off'}
				/>
				<TextInput
					placeholder={'Enter prompt for image'}
					name={'neutral'}
					defaultValue={'a face'}
					miw={'400px'}
					autoComplete={'off'}
				/>
				<TextInput
					placeholder={'Enter prompt for image'}
					name={'target'}
					// defaultValue={'painting of a cat by andy warhol'}
					miw={'400px'}
					autoComplete={'off'}
				/>
				<Button
					type={'submit'}
					name={'intent'}
					value={'predict'}
				>
					Generate image
				</Button>
			</Stack>
			{actionData?.output ? <Image src={actionData?.output} /> : null}
			{/*<SimpleGrid*/}
			{/*	cols={4}*/}
			{/*	mt={'lg'}*/}
			{/*>*/}
			{/*	{actionData?.output?.[0]?.map((o) => (*/}
			{/*		<Image*/}
			{/*			key={o}*/}
			{/*			src={o}*/}
			{/*		/>*/}
			{/*	))}*/}
			{/*</SimpleGrid>*/}
		</Form>
	);
}
