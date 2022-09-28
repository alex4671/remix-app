import { Container } from "@mantine/core";
import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return {
    title: "Forgot password"
  };
};

export default function Forgot() {
  return (
    <Container size={400} mt={"40%"}>
      <h1>Forgot password TODO</h1>
    </Container>
  )
}
