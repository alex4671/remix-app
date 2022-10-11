import {Container, createEmotionCache, MantineProvider} from "@mantine/core";
import {StylesPlaceholder} from "@mantine/remix";
import type {LinksFunction, LoaderArgs, MetaFunction} from "@remix-run/node";
import {json} from "@remix-run/node";
import type {ShouldReloadFunction} from "@remix-run/react";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
  useLoaderData,
  useTransition
} from "@remix-run/react";
import {getUser} from "~/server/session.server";
import {colors} from "~/utils/colors";
import {ErrorPage} from "~/components/ErrorPage";
import {getTheme} from "~/utils/theme";
import {Navbar} from "~/components/Navbar/Navbar";
import {LoadingProgress} from "~/components/LoadingProgress";
import {NavigationProgress} from "@mantine/nprogress";
import {NotificationsProvider} from "@mantine/notifications";
import favicon from "./favicon.svg";

export const links: LinksFunction = () => {
  return [
    { rel: "icon", href: favicon },
  ];
};

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Saas",
  viewport: "width=device-width,initial-scale=1",
});

createEmotionCache({key: "mantine"});

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

export const unstable_shouldReload: ShouldReloadFunction = ({submission}) => {
  // only refetch if changing theme, logout and login
  return submission?.action === "/api/set-theme"
    || submission?.action === "/logout"
    || Boolean(submission?.action.includes("/login"))
    || Boolean(submission?.action.includes("/join"))
    || submission?.action === "/settings/account"
    || submission?.action === "/settings/danger"
    || submission?.action === undefined
};

export default function App() {
  const {theme, user} = useLoaderData<typeof loader>()
  const transition = useTransition()
  return (
    <MantineProvider
      withGlobalStyles
      withNormalizeCSS
      theme={{
        colorScheme: theme,
        fontFamily: "Inter, sans-serif",
        headings: {fontFamily: "Inter, sans-serif"},
        // primaryShade: {light: 5, dark: 8},
        colors: {...colors},
        defaultRadius: "0",
        // activeStyles: { transform: 'scale(0.95)', transition: "transform 0.03s ease-in-out" }
      }}
    >
      <html lang="en">
      <head>
        <StylesPlaceholder/>
        <Meta/>
        <Links/>
      </head>
      <body>
      <NavigationProgress color={"emerald"} autoReset/>
      <LoadingProgress state={transition.state}/>
      <NotificationsProvider position={"top-center"}>
        <Container size={"xl"} px={12}>
          {user && <Navbar/>}
          <Outlet/>
        </Container>
      </NotificationsProvider>
      <ScrollRestoration/>
      <Scripts/>
      <LiveReload/>
      </body>
      </html>
    </MantineProvider>
  );
}

export function ErrorBoundary({error}: { error: Error }) {
  console.error("error", error);

  return (
    <MantineProvider withGlobalStyles withNormalizeCSS>
      <html>
      <head>
        <StylesPlaceholder/>
        <title>Error!</title>
        <Meta/>
        <Links/>
      </head>
      <body>
      <ErrorPage/>
      <Scripts/>
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
        <StylesPlaceholder/>
        <title>Oops!</title>
        <Meta/>
        <Links/>
      </head>
      <body>
      <ErrorPage status={caught.status}/>
      <Scripts/>
      </body>
      </html>
    </MantineProvider>
  );
}
