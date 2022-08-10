import {Container, MantineProvider} from "@mantine/core";
import {StylesPlaceholder} from "@mantine/remix";
import type {LoaderArgs, MetaFunction} from "@remix-run/node";
import {json} from "@remix-run/node";
import {Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration} from "@remix-run/react";
import {getUser} from "~/server/session.server";
import {colors} from "~/utils/colors";

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Saas",
  viewport: "width=device-width,initial-scale=1",
});

export async function loader({request}: LoaderArgs) {
  return json({
    user: await getUser(request),
  });
}

export default function App() {
  return (
    <MantineProvider
      theme={{
        fontFamily: "Inter, sans-serif",
        primaryShade: {light: 5, dark: 8},
        colors: {...colors},
      }}
      withGlobalStyles
      withNormalizeCSS
    >
      <html lang="en">
      <head>
        <Meta/>
        <Links/>
        <StylesPlaceholder/>
      </head>
      <body>
      <Container size={"xl"} px={12}>
        <Outlet/>
      </Container>
      <ScrollRestoration/>
      <Scripts/>
      <LiveReload/>
      </body>
      </html>
    </MantineProvider>
  );
}
