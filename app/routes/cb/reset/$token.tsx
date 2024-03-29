import {
	Anchor,
	Box,
	Button,
	Center,
	Container,
	Group,
	PasswordInput,
	Title,
} from '@mantine/core';
import type { ActionFunction, LoaderArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import {
	Form,
	Link,
	useActionData,
	useLoaderData,
	useNavigation,
} from '@remix-run/react';
import { IconArrowLeft } from '@tabler/icons-react';
import { useEffect, useRef } from 'react';
import { resetPassword, validateResetToken } from '~/models/user.server';

export async function loader({ request, params }: LoaderArgs) {
	// await isUserConfirmed(request)

	try {
		const userEmail = await validateResetToken(params.token!);

		console.log('isValidInvite', userEmail);

		return json({ isValidInvite: !!userEmail });
	} catch (e) {
		console.log('error', e);
	}

	return redirect('/');
}

export const action: ActionFunction = async ({ request, params }) => {
	const formData = await request.formData();
	const password = formData.get('password');

	if (typeof password !== 'string') {
		return json(
			{ errors: { password: 'Password is required' } },
			{ status: 400 },
		);
	}

	if (password.length < 8) {
		return json(
			{ errors: { password: 'Password is too short' } },
			{ status: 400 },
		);
	}

	const userEmail = await validateResetToken(params.token!);

	if (userEmail) {
		await resetPassword(userEmail, password);
		redirect('/login');
	}

	return redirect('/login');
};

export default function Invite() {
	const data = useLoaderData<typeof loader>();
	const actionData = useActionData<typeof action>();

	const navigation = useNavigation();
	const isLoading =
		navigation.state === 'submitting' || navigation.state === 'loading';
	const passwordRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (actionData?.errors?.password) {
			passwordRef.current?.focus();
		}
	}, [actionData]);

	return (
		<Container size={600}>
			{data?.isValidInvite ? (
				<Container size={400}>
					<Title
						align="center"
						mt={'40%'}
						mb={'lg'}
					>
						Reset password
					</Title>
					<Form method="post">
						<PasswordInput
							label="New Password"
							required
							id="password"
							ref={passwordRef}
							name="password"
							defaultValue={'alexalex'}
							error={actionData?.errors?.password}
							pb={actionData?.errors?.password ? 0 : 20}
						/>
						<Group
							position="apart"
							mt="lg"
						>
							<Anchor
								component={Link}
								to={'/login'}
								color="dimmed"
								size="sm"
							>
								<Center inline>
									<IconArrowLeft
										size={12}
										stroke={1.5}
									/>
									<Box ml={5}>Back to login page</Box>
								</Center>
							</Anchor>
							<Button
								type={'submit'}
								loading={isLoading}
								color={'emerald'}
								variant={'filled'}
							>
								Save new password
							</Button>
						</Group>
					</Form>
				</Container>
			) : (
				<Title order={1}>Some problem</Title>
			)}
		</Container>
	);
}
