import {
	Badge,
	Box,
	Grid,
	Group,
	Paper,
	Text,
	TextInput,
	Title,
} from '@mantine/core';
import { useFetcher } from '@remix-run/react';
import { PrimaryButton } from '~/components/Buttons/PrimaryButton';
import { SecondaryButton } from '~/components/Buttons/SecondaryButton';

interface Props {
	email: string;
	isConfirmed: boolean;
}

export const UserInfo = ({ email, isConfirmed }: Props) => {
	const fetcher = useFetcher();
	return (
		<Paper
			shadow="0"
			withBorder
			mb={12}
		>
			<Box p={'lg'}>
				<Group>
					<Title order={2}>Account</Title>
					<Badge color={isConfirmed ? 'emerald' : 'red'}>
						{isConfirmed ? 'Confirmed' : 'Unconfirmed'}
					</Badge>
				</Group>
				<Text color={'dimmed'}>Change you email</Text>
				<Box my={12}>
					<Grid align={'center'}>
						<Grid.Col
							xs={12}
							sm={6}
						>
							<TextInput
								placeholder={email}
								name={'email'}
								disabled={!isConfirmed}
							/>
						</Grid.Col>
						{!isConfirmed ? (
							<Grid.Col
								xs={12}
								sm={6}
							>
								<Group position={'right'}>
									<fetcher.Form method={'post'}>
										<SecondaryButton
											type={'submit'}
											name={'intent'}
											value={'sendInvite'}
											compact
										>
											Resend confirmation
										</SecondaryButton>
									</fetcher.Form>
								</Group>
							</Grid.Col>
						) : null}
					</Grid>
				</Box>
				<Box py={12}>
					<PrimaryButton>Update email</PrimaryButton>
				</Box>
			</Box>
		</Paper>
	);
};
