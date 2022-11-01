import type {ActionFunction, LoaderFunction, MetaFunction} from "@remix-run/node";
import {json, redirect} from "@remix-run/node";
import {Form, Link, useActionData, useTransition} from "@remix-run/react";
import {getUserId} from "~/server/session.server";
import {generateResetToken, getUserByEmail} from "~/models/user.server";
import {validateEmail} from "~/utils/utils";
import {Anchor, Box, Center, Container, Group, TextInput, Title} from "@mantine/core";
import {useEffect, useRef} from "react";
import {IconArrowLeft} from "@tabler/icons";
import {PrimaryButton} from "~/components/Buttons/PrimaryButton";

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserId(request);
  if (userId) return redirect("/");
  return json({});
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get("email");

  if (!validateEmail(email)) {
    return json(
      { errors: { email: "Email is invalid" } },
      { status: 400 }
    );
  }


  const user = await getUserByEmail(email);

  if (!user) {
    return json(
      { errors: { email: "Invalid email" } },
      { status: 400 }
    );
  }

  const resetToken = await generateResetToken(request.url, user.email)

  console.log("resetToken", resetToken)

  return json({})
};

export const meta: MetaFunction = () => {
  return {
    title: "Reset Password"
  };
};

export default function Forgot() {
  const transition = useTransition();
  const isLoading = transition.state === "submitting" || transition.state === "loading"

  const actionData = useActionData<typeof action>();
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (actionData?.errors?.email) {
      emailRef.current?.focus();
    }
  }, [actionData]);

  return (
    <Container size={"xs"} mt={"20%"} p={"md"}>
      <Title
        align="center"
        mb={"lg"}
      >
        Reset password
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
        <Group position="apart" mt="lg">
          <Anchor component={Link} to={"/login"} color={"emerald"} size="sm">
            <Center inline>
              <IconArrowLeft size={12} stroke={1.5} />
              <Box ml={5}>Back to login page</Box>
            </Center>
          </Anchor>
          <PrimaryButton type={"submit"} loading={isLoading}>Reset password</PrimaryButton>
        </Group>
      </Form>
    </Container>
  );
}
