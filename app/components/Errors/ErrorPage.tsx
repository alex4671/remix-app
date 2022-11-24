import {Box, Button, Container, Group, Text, Title} from '@mantine/core';

export const ErrorPage = ({status}: {status?: number}) => {
  return (
    <Box h={"100vh"} pt={80} pb={120}>
      <Container>
        {status ? <Box fz={{base: "120px", sm: "220px"}} ta={"center"} fw={900} lh={1} mb={"xl"}>{status}</Box> : null}
        <Title ta={"center"} fw={900} order={1}>Something bad just happened...</Title>
        <Text size="lg" align="center" maw={"540px"} m={"auto"} mt={"xl"} mb={"xl"}>
          Our servers could not handle your request. Don&apos;t worry, our development team was
          already notified. Try refreshing the page.
        </Text>
        <Group position="center">
          <Button variant="filled" size="md" color={"dark"} onClick={() => window.location.replace("/")}>Go home</Button>
        </Group>
      </Container>
    </Box>
  );
}
