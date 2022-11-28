import {
	Anchor,
	Container,
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
	useSearchParams,
	useTransition,
} from '@remix-run/react';
import { nanoid } from 'nanoid';
import { useEffect, useRef } from 'react';
import { z } from 'zod';
import { parseFormSafe } from 'zodix';
import { PrimaryButton } from '~/components/Buttons/PrimaryButton';
import {
	createUser,
	generateInviteLink,
	getUserByEmail,
} from '~/models/user.server';
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

	const existingUser = await getUserByEmail(result.data.email);
	if (existingUser) {
		return json({
			success: false,
			errors: { emailError: 'A user already exists with this email' },
		});
	}

	const user = await createUser(result.data.email, result.data.password);

	const inviteLink = await generateInviteLink(request.url, user.id);

	console.log('inviteLink', inviteLink);

	// await postmarkClient.sendEmail({
	//   "From": "hi@alexkulchenko.com",
	//   "To": email,
	//   "Subject": "Hello from Postmark",
	//   "HtmlBody": `<strong>Hello</strong> dear App user. Here you invite link <a href='${inviteLink}'>Token</a>`,
	//   "TextBody": "Hello from Postmark!",
	//   "MessageStream": "outbound"
	// })

	return createUserSession({
		request,
		userId: user.id,
		remember: false,
		redirectTo: result.data.redirectTo ?? '/',
	});
};

export const meta: MetaFunction = () => {
	return {
		title: 'Sign Up',
	};
};

export default function Join() {
	const [searchParams] = useSearchParams();
	const transition = useTransition();

	const isLoading =
		transition.state === 'submitting' || transition.state === 'loading';

	const redirectTo = searchParams.get('redirectTo') ?? undefined;
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

	const handleCreateSessionId = () => {
		sessionStorage.setItem('sessionId', nanoid());
	};

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
				Create account
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
					defaultValue={'alex@alex.com'}
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
					aria-describedby="password-error"
					defaultValue={'alexalex'}
					error={actionData?.errors?.passwordError}
					pb={actionData?.errors?.passwordError ? 0 : 20}
					withAsterisk={false}
				/>
				<Text mt={12}>
					Already have an account?{' '}
					<Anchor
						component={Link}
						to={{
							pathname: '/login',
							search: searchParams.toString(),
						}}
						color={'emerald'}
					>
						Login
					</Anchor>
				</Text>
				<PrimaryButton
					fullWidth
					mt="xl"
					type={'submit'}
					loading={isLoading}
					onClick={handleCreateSessionId}
				>
					Sign up
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

export function ErrorBoundary({ error }: { error: Error }) {
	console.error(error);

	return <div>An unexpected error occurred: {error.message}</div>;
}
