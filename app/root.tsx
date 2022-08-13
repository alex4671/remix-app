import {Container, MantineProvider} from "@mantine/core";
import {StylesPlaceholder} from "@mantine/remix";
import type {LoaderArgs, MetaFunction} from "@remix-run/node";
import {json} from "@remix-run/node";
import type {ShouldReloadFunction} from "@remix-run/react";
import {Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration, useCatch, useLoaderData} from "@remix-run/react";
import {getUser} from "~/server/session.server";
import {colors} from "~/utils/colors";
import {ErrorPage} from "~/components/ErrorPage";
import {ColorSwitch} from "~/components/ColorSwitch";
import {getTheme} from "~/utils/theme";

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Saas",
  viewport: "width=device-width,initial-scale=1",
});

export async function loader({request}: LoaderArgs) {
  const [{theme}, user] = await Promise.all([
    getTheme(request),
    getUser(request)
  ])
  return json({
    theme,
    user
  });
}

export const unstable_shouldReload: ShouldReloadFunction = ({ submission }) => submission?.action === "/api/set-theme";

export default function App() {
  const { theme } = useLoaderData<typeof loader>()

  return (
    <MantineProvider
      theme={{
        colorScheme: theme,
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
        <ColorSwitch/>
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

export function CatchBoundary() {
  const caught = useCatch();
  console.log("caught.statusText", caught);
  return (
    <MantineProvider withGlobalStyles withNormalizeCSS>
      <html>
      <head>
        <title>Oops!</title>
        <Meta/>
        <Links/>
        <StylesPlaceholder/>
      </head>
      <body>
      <ErrorPage status={caught.status}/>
      <Scripts/>
      </body>
      </html>
    </MantineProvider>
  );
}
