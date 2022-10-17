import { Button, Container, Mark, Text, Title } from "@mantine/core";
import { useLocation, useNavigate } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/node";


export const meta: MetaFunction = () => {
  return {
    title: "Unsubscribed"
  };
};


export default function Unsubscribed () {
  const navigate = useNavigate()
  const location = useLocation()

  const handleGoHome = () => {
    navigate('/')
  }

  return (
    <Container size={600}>
      <Title order={1}>You successfully unsubscribed</Title>
      <Text size={'lg'}>Processing could take couple minutes, you subscription is canceled and will be disabled <Mark color="emerald">{String(location.state)}</Mark></Text>
      <Button mt={12} color={"gray"} variant={"outline"} onClick={handleGoHome}>Go Home</Button>
    </Container>
  )
}
