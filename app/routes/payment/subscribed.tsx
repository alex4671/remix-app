import {Button, Container, Group, Text, Title} from "@mantine/core";
import {useFetcher, useNavigate} from "@remix-run/react";
import type {LoaderArgs, MetaFunction} from "@remix-run/node";
import {json} from "@remix-run/node";
import {isUserCurrentlyPro} from "~/models/user.server";
import {useEffect} from "react";
import {showNotification} from "@mantine/notifications";
import {IconCheck} from "@tabler/icons";

export const meta: MetaFunction = () => {
  return {
    title: "Subscribed"
  };
};

export const loader = async ({ request }: LoaderArgs) => {
  const isCurrentlyPro = await isUserCurrentlyPro(request)

  return json({isCurrentlyPro})

};

export default function Subscribed() {
  const statusFetcher = useFetcher();
  const navigate = useNavigate()

  const isLoading = statusFetcher.state === "loading"

  useEffect(() => {
    if (statusFetcher?.data?.isCurrentlyPro) {
      console.log(statusFetcher?.data?.isCurrentlyPro);
      showNotification({
        id: 'hello-there',
        disallowClose: true,
        autoClose: 3000,
        onClose: () => location.replace("/settings/pro"),
        title: "You subscription confirmed",
        message: 'You will redirected back in 3 second',
        icon: <IconCheck size={16}/>,
        color: "green",

      })
    }
  }, [statusFetcher.data])


  const handleCheckStatus = () => {
    console.log("Checking status...");
    statusFetcher.load("/payment/subscribed")
  }

  const handleGoHome = () => {
    navigate('/')
  }

  return (
    <Container size={600}>
      <Title order={1}>You now on pro plan</Title>
      <Text size={'lg'}>Processing could take couple minutes</Text>
      <Group mt={24}>
        <Button color={"emerald"} onClick={handleCheckStatus} loading={isLoading}>Check status</Button>
        <Button color={"gray"} variant={"outline"} onClick={handleGoHome}>Go Home</Button>
      </Group>
    </Container>
  )
}
