import { MantineProvider } from "@mantine/core";
import { StylesPlaceholder } from "@mantine/remix";
import type { MetaFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Saas",
  viewport: "width=device-width,initial-scale=1",
});

export default function App() {
  return (
    <MantineProvider theme={{}} withGlobalStyles withNormalizeCSS>
      <html lang="en">
      <head>
        <Meta />
        <Links />
        <StylesPlaceholder />
      </head>
      <body>
      <Outlet />
      <ScrollRestoration />
      <Scripts />
      <LiveReload />
      </body>
      </html>
    </MantineProvider>
  );
}
