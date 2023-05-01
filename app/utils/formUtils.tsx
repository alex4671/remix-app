import { Group, Text } from '@mantine/core';
import type { ZodError } from 'zod';

export const getErrors = (error: ZodError) =>
	error.issues.reduce(
		(acc, error) => ({ ...acc, [error.path[0]]: error.message }),
		{},
	);

export const inputPropsWithError = (
	errors: any,
	key: string,
	label: string,
) => ({
	name: key,
	label: (
		<Group position={'apart'}>
			<Text>{label}</Text>
			{errors?.[key] && <Text color={'red'}>{errors[key]}</Text>}
		</Group>
	),
	error: !!errors?.[key],
	styles: {
		label: {
			width: '100%',
		},
		labelWrapper: {
			width: '100%',
		},
		error: {
			marginTop: 0,
		},
	},
});
