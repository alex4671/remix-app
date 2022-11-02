import {Container, MantineProvider} from "@mantine/core";
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
  useParams,
  useTransition
} from "@remix-run/react";
import {getUser} from "~/server/session.server";
import {colors} from "~/utils/colors";
import {getTheme} from "~/utils/theme";
import {Navbar} from "~/components/Navbar/Navbar";
import {LoadingProgress} from "~/components/Utils/LoadingProgress";
import {NavigationProgress} from "@mantine/nprogress";
import {NotificationsProvider} from "@mantine/notifications";
import favicon from "./assets/favicon.svg";
import {useHydrated} from "remix-utils";
import type {ReactNode} from "react";
import {ErrorPage} from "~/components/ErrorPage";

export const links: LinksFunction = () => {
  return [
    {rel: "icon", href: favicon},
  ];
};

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Saas",
  viewport: "width=device-width,initial-scale=1",
});

export const unstable_shouldReload: ShouldReloadFunction = ({submission}) => {
  // only refetch if changing theme, logout and login
  return submission?.action === "/api/set-theme"
    || submission?.action === "/logout"
    || Boolean(submission?.action.includes("/login"))
    || Boolean(submission?.action.includes("/join"))
    || submission?.action === "/settings/account"
    || submission?.action === "/settings/danger"
  // || submission?.action === undefined
  // || Boolean(submission?.action.includes("/media"))
};

export async function loader({request, params}: LoaderArgs) {
  const [{theme}, user] = await Promise.all([
    getTheme(request),
    getUser(request)
  ])
  return json({
    theme,
    user
  });
}

const Document = ({children, title = "App"}: { children: ReactNode, title?: string }) => {
  let isHydrated = useHydrated();

  return (
    <html lang="en">
    <head>
      <Meta/>
      <title>{title}</title>
      <Links/>
    </head>
    <body>
    {isHydrated ? children : null}
    <ScrollRestoration/>
    <Scripts/>
    <LiveReload/>
    </body>
    </html>
  );
}


export default function App() {
  const {theme, user} = useLoaderData<typeof loader>()
  const params = useParams()
  const transition = useTransition()

  return (
    <Document>
      <MantineProvider
        theme={{
          colorScheme: theme,
          fontFamily: "Inter, sans-serif",
          headings: {fontFamily: "Inter, sans-serif"},
          // primaryShade: {light: 5, dark: 9},
          colors: {...colors},
          defaultRadius: "0",
          // activeStyles: { transform: 'scale(0.95)', transition: "transform 0.03s ease-in-out" }
          components: {
            Badge: {
              defaultProps: {
                radius: 0,
              },
            }
          }
        }}
        withGlobalStyles
        withNormalizeCSS
      >
        <NavigationProgress color={theme === "dark" ? "white" : "dark"} autoReset/>
        <LoadingProgress state={transition.state}/>
        <NotificationsProvider position={"top-center"}>
          <Container size={"xl"} px={12}>
            {user && !params.fileId && <Navbar/>}
            <Outlet/>
          </Container>
        </NotificationsProvider>
        <ScrollRestoration/>
        <Scripts/>
        <LiveReload/>
      </MantineProvider>
    </Document>
  );
}

export function CatchBoundary() {
  const caught = useCatch();
  return (
    <Document title={`${caught.status} ${caught.statusText}`}>
      <MantineProvider>
        <ErrorPage status={caught.status}/>
      </MantineProvider>
    </Document>
  );
}

// How ChakraProvider should be used on ErrorBoundary
export function ErrorBoundary({error}: { error: Error }) {
  return (
    <Document title="Error!">
      <MantineProvider>
        <ErrorPage/>
      </MantineProvider>
    </Document>
  );
}

