import {
	Anchor,
	Checkbox,
	Container,
	Group,
	PasswordInput,
	Text,
	TextInput,
	Title,
} from '@mantine/core';
import type {
	ActionFunction,
	LoaderFunction,
	MetaFunction,
} from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import {
	Form,
	Link,
	useActionData,
	useNavigation,
	useSearchParams,
} from '@remix-run/react';
import { useEffect, useRef } from 'react';
import { z } from 'zod';
import { CheckboxAsString, parseFormSafe } from 'zodix';
import { PrimaryButton } from '~/components/Buttons/PrimaryButton';
import { verifyLogin } from '~/models/user.server';
import { createUserSession, getUserId } from '~/server/session.server';
import { errorAtPath } from '~/utils/utils';

export const loader: LoaderFunction = async ({ request }) => {
	const userId = await getUserId(request);
	if (userId) return redirect('/');
	return json({});
};

const schema = z.object({
	email: z.string().email({ message: 'Invalid email' }),
	password: z
		.string()
		.min(8, { message: 'Password must be at least 8 characters' }),
	redirectTo: z.string(),
	remember: CheckboxAsString,
});

export const action: ActionFunction = async ({ request }) => {
	const result = await parseFormSafe(request, schema);

	if (!result.success) {
		return json({
			success: false,
			errors: {
				emailError: errorAtPath(result.error, 'email'),
				passwordError: errorAtPath(result.error, 'password'),
			},
		});
	}
	const user = await verifyLogin(result.data.email, result.data.password);

	if (!user) {
		return json({
			success: false,
			errors: { emailError: 'Invalid email or password' },
		});
	}

	return createUserSession({
		request,
		userId: user.id,
		remember: result.data.remember,
		redirectTo: result.data.redirectTo ?? '/',
	});
};

export const meta: MetaFunction = () => {
	return {
		title: 'Login',
	};
};

export default function LoginPage() {
	const [searchParams] = useSearchParams();
	const navigation = useNavigation();
	const isLoading =
		navigation.state === 'submitting' || navigation.state === 'loading';

	const redirectTo = searchParams.get('redirectTo') || '/';
	const actionData = useActionData<typeof action>();
	const emailRef = useRef<HTMLInputElement>(null);
	const passwordRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (actionData?.errors?.email) {
			emailRef.current?.focus();
		} else if (actionData?.errors?.password) {
			passwordRef.current?.focus();
		}
	}, [actionData]);

	return (
		<Container
			size={'xs'}
			mt={'20%'}
			p={'md'}
		>
			<Title
				align="center"
				mb={'lg'}
			>
				Please, login!
			</Title>
			<Form method="post">
				<TextInput
					ref={emailRef}
					id="email"
					autoFocus={true}
					name="email"
					type="email"
					autoComplete="email"
					label="Email"
					required
					// defaultValue={'alex@alex.com'}
					error={actionData?.errors?.emailError}
					pb={actionData?.errors?.emailError ? 0 : 20}
					withAsterisk={false}
				/>
				<PasswordInput
					label="Password"
					required
					id="password"
					ref={passwordRef}
					name="password"
					autoComplete="current-password"
					// defaultValue={'alexalex'}
					error={actionData?.errors?.passwordError}
					pb={actionData?.errors?.passwordError ? 0 : 20}
					withAsterisk={false}
				/>
				<Group
					position="apart"
					mt="md"
					align={'flex-start'}
				>
					<Checkbox
						label="Remember me"
						id="remember"
						name="remember"
					/>
					<Anchor
						component={Link}
						to={'/forgot'}
						size={'sm'}
						color={'emerald'}
					>
						Forgot password
					</Anchor>
				</Group>
				<Text mt={12}>
					Don't have an account?{' '}
					<Anchor
						component={Link}
						to={{
							pathname: '/join',
							search: searchParams.toString(),
						}}
						color={'emerald'}
					>
						Sign up
					</Anchor>
				</Text>
				<PrimaryButton
					fullWidth
					mt="xl"
					type={'submit'}
					loading={isLoading}
				>
					Sign in
				</PrimaryButton>
				<input
					type="hidden"
					name="redirectTo"
					value={redirectTo}
				/>
			</Form>
		</Container>
	);
}
