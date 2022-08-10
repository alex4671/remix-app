import type {ActionFunction, LoaderFunction, MetaFunction} from "@remix-run/node";
import {json, redirect} from "@remix-run/node";
import {Form, Link, useActionData, useSearchParams, useTransition} from "@remix-run/react";
import {createUserSession, getUserId} from "~/server/session.server";
import {verifyLogin} from "~/models/user.server";
import {validateEmail} from "~/utils/utils";
import {Anchor, Button, Checkbox, Container, Group, PasswordInput, Text, TextInput, Title} from "@mantine/core";
import {useEffect, useRef} from "react";

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
  const remember = formData.get("remember");

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

  const user = await verifyLogin(email, password);

  if (!user) {
    return json(
      { errors: { email: "Invalid email or password" } },
      { status: 400 }
    );
  }

  return createUserSession({
    request,
    userId: user.id,
    remember: remember === "on",
    redirectTo: typeof redirectTo === "string" ? redirectTo : "/"
  });
};

export const meta: MetaFunction = () => {
  return {
    title: "Login"
  };
};

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const transition = useTransition();
  const isLoading = transition.state === "submitting" || transition.state === "loading"

  const redirectTo = searchParams.get("redirectTo") || "/";
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
          aria-invalid={actionData?.errors?.email ? true : undefined}
          aria-describedby="email-error"
          label="Email"
          required
          defaultValue={"alex@alex.com"}
        />
        {actionData?.errors?.email && (
          <Text color={"red"} id="email-error">
            {actionData.errors.email}
          </Text>
        )}
        <PasswordInput
          label="Password"
          required
          mt="md"
          id="password"
          ref={passwordRef}
          name="password"
          autoComplete="current-password"
          aria-invalid={actionData?.errors?.password ? true : undefined}
          aria-describedby="password-error"
          defaultValue={"alexalex"}
        />
        {actionData?.errors?.password && (
          <Text color={"red"} id="password-error">
            {actionData.errors.password}
          </Text>
        )}
        <Group position="apart" mt="md" align={"flex-start"}>
          <Checkbox
            label="Remember me"
            id="remember"
            name="remember"
          />
          <Anchor component={Link} to={"/forgot"} size={"sm"}>Forgot password</Anchor>
        </Group>
        <Text mt={12}>
          Don't have an account?{" "}
          <Anchor
            component={Link}
            to={{
              pathname: "/join",
              search: searchParams.toString()
            }}
          >
            Sign up
          </Anchor>
        </Text>
        <Button fullWidth mt="xl" type={"submit"} loading={isLoading} color={"zinc"} variant={"filled"}>
          Sign in
        </Button>
        <input type="hidden" name="redirectTo" value={redirectTo} />
      </Form>
    </Container>
  );
}
