import type {ActionFunction, LoaderFunction, MetaFunction} from "@remix-run/node";
import {json, redirect} from "@remix-run/node";
import {Form, Link, useActionData, useSearchParams, useTransition} from "@remix-run/react";
import {createUserSession, getUserId} from "~/server/session.server";
import {createUser, generateInviteLink, getUserByEmail} from "~/models/user.server";
import {validateEmail} from "~/utils/utils";
import {Anchor, Button, Container, PasswordInput, Text, TextInput, Title} from "@mantine/core";
import {useEffect, useRef} from "react";
import {postmarkClient} from "~/server/postmark.server";
import {PrimaryButton} from "~/components/Buttons/PrimaryButton";

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserId(request);
  if (userId) return redirect("/");
  return json({});
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");
  const redirectTo = formData.get("redirectTo");

  if (!validateEmail(email)) {
    return json(
      { errors: { email: "Email is invalid" } },
      { status: 400 }
    );
  }

  if (typeof password !== "string") {
    return json(
      { errors: { password: "Password is required" } },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return json(
      { errors: { password: "Password is too short" } },
      { status: 400 }
    );
  }

  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return json(
      { errors: { email: "A user already exists with this email" } },
      { status: 400 }
    );
  }

  const user = await createUser(email, password);


  const inviteLink = await generateInviteLink(request.url, user.id)

  console.log("inviteLink", inviteLink)

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
    redirectTo: typeof redirectTo === "string" ? redirectTo : "/",
  });
};

export const meta: MetaFunction = () => {
  return {
    title: "Sign Up",
  };
};

export default function Join() {
  const [searchParams] = useSearchParams();
  const transition = useTransition();

  const isLoading = transition.state === "submitting" || transition.state === "loading"

  const redirectTo = searchParams.get("redirectTo") ?? undefined;
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
    <Container size={400}>
      <Title
        align="center"
        mt={"40%"}
        mb={"lg"}
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
          defaultValue={"alex@alex.com"}
          error={actionData?.errors?.email}
          pb={actionData?.errors?.email ? 0 : 20}
        />
        <PasswordInput
          label="Password"
          required
          id="password"
          ref={passwordRef}
          name="password"
          autoComplete="current-password"
          aria-invalid={actionData?.errors?.password ? true : undefined}
          aria-describedby="password-error"
          defaultValue={"alexalex"}
          error={actionData?.errors?.password}
          pb={actionData?.errors?.password ? 0 : 20}
        />
        <Text mt={12}>
          Already have an account?{" "}
          <Anchor
            component={Link}
            to={{
              pathname: "/login",
              search: searchParams.toString()
            }}
            color={"emerald"}
          >
            Login
          </Anchor>
        </Text>
        <PrimaryButton fullWidth mt="xl" type={"submit"} loading={isLoading}>
          Sign up
        </PrimaryButton>
        <input type="hidden" name="redirectTo" value={redirectTo} />
      </Form>
    </Container>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);

  return <div>An unexpected error occurred: {error.message}</div>;
}
