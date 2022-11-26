import {
	Box,
	Grid,
	Group,
	Paper,
	PasswordInput,
	Stack,
	Text,
	Title,
} from '@mantine/core';
import { useFetcher } from '@remix-run/react';
import { PrimaryButton } from '~/components/Buttons/PrimaryButton';
import { InfoTooltip } from '~/components/Utils/InfoTooltip';

export const ChangePassword = () => {
	const fetcher = useFetcher();
	return (
		<Paper
			shadow="0"
			withBorder
			mb={12}
		>
			<fetcher.Form method={'post'}>
				<Box p={'lg'}>
					<Title order={2}>Password</Title>
					<Group spacing={6}>
						<Text color={'dimmed'}>Change you password</Text>
						<InfoTooltip label={'Password mast be at least 8 characters.'} />
					</Group>
					<Box my={12}>
						<Grid align={'center'}>
							<Grid.Col
								xs={12}
								sm={6}
							>
								<Stack>
									<PasswordInput
										placeholder="Current password"
										name={'password'}
									/>
									<PasswordInput
										placeholder="New password"
										name={'newPassword'}
									/>
								</Stack>
							</Grid.Col>
						</Grid>
					</Box>
					<Box py={12}>
						<PrimaryButton
							type={'submit'}
							name="intent"
							value="changePassword"
						>
							Update password
						</PrimaryButton>
					</Box>
				</Box>
			</fetcher.Form>
		</Paper>
	);
};
