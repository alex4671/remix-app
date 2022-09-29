import {useNavigate} from "react-router";
import {Container, Title} from "@mantine/core";
import type {LoaderArgs} from "@remix-run/node";
import {json} from "@remix-run/node";
import invariant from "tiny-invariant";
import {useLoaderData} from "@remix-run/react";
import {isUserConfirmed, validateInviteLink} from "~/models/user.server";


export async function loader({request, params}: LoaderArgs) {
  await isUserConfirmed(request)
  invariant(params.inviteId, "Id must be provided")

  const isValidInvite = await validateInviteLink(request, params.inviteId)

  console.log("isValidInvite", isValidInvite)

  return json({isValidInvite})
}

export default function Invite() {
  const data = useLoaderData<typeof loader>()

  // const {inviteId} = useParams()
  // const navigate = useNavigate()


  // const handleGoHome = () => {
  //   navigate('/')
  // }

  return (
    <Container size={600}>
      {data?.isValidInvite ? (
        <Title order={1}>You email confirmed</Title>
      ) : (
        <Title order={1}>Some problem</Title>
      )}
      {/*<Title order={1}>Name:(Email) invited you, Name:(Email) to join the team (TeamName)</Title>*/}
      {/*<Text size={'lg'}>Processing could take couple minutes</Text>*/}
      {/*<Group mt={12}>*/}
      {/*  <Button color={"dark"} variant={"filled"} onClick={handleGoHome}>Accept</Button>*/}
      {/*  <Button color={"dark"} variant={"outline"} onClick={handleGoHome}>Go Home</Button>*/}
      {/*</Group>*/}
    </Container>
  )
}
