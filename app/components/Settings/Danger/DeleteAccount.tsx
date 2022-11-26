import { Box, Group, Paper, Text, TextInput, Title } from '@mantine/core';
import { useInputState } from '@mantine/hooks';
import { useFetcher } from '@remix-run/react';
import { IconAlertCircle } from '@tabler/icons';
import { DangerButton } from '~/components/Buttons/DangerButtom';
import { useUser } from '~/utils/utils';

export const DeleteAccount = () => {
	const user = useUser();
	const fetcher = useFetcher();
	const [value, setValue] = useInputState(user.email);

	const isBtnDisabled = value !== user.email;

	return (
		<Paper
			shadow="0"
			withBorder
			mb={12}
		>
			<fetcher.Form method={'post'}>
				<Box p={'lg'}>
					<Title order={2}>Delete account</Title>
					<Text color={'dimmed'}>
						Type you email to delete you account. All data will be deleted
					</Text>
					<Box my={12}>
						<Group>
							<TextInput
								value={value}
								onChange={setValue}
							/>
							<DangerButton
								type="submit"
								disabled={isBtnDisabled}
								leftIcon={<IconAlertCircle size={'16'} />}
							>
								Delete account
							</DangerButton>
						</Group>
					</Box>
				</Box>
			</fetcher.Form>
		</Paper>
	);
};
