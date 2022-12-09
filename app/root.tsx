import { Container, MantineProvider } from '@mantine/core';
import { NotificationsProvider } from '@mantine/notifications';
import { NavigationProgress } from '@mantine/nprogress';
import type { LinksFunction, LoaderArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import type { ShouldReloadFunction } from '@remix-run/react';
import {
	Links,
	LiveReload,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useLoaderData,
	useParams,
} from '@remix-run/react';
import type { ReactNode } from 'react';
import { useHydrated } from 'remix-utils';
import { Navbar } from '~/components/Navbar/Navbar';
import { useLoadingProgress } from '~/hooks/useLoadingProgress';
import { useNotification } from '~/hooks/useNotification';
import { getUser } from '~/server/session.server';
import { colors } from '~/utils/colors';
import { getTheme } from '~/utils/theme';
import favicon from './assets/favicon.svg';
import { useSessionId } from './hooks/useSessionId';

export const links: LinksFunction = () => {
	return [{ rel: 'icon', href: favicon }];
};

export const meta: MetaFunction = () => ({
	charset: 'utf-8',
	title: 'Files',
	viewport: 'width=device-width,initial-scale=1',
});

export const unstable_shouldReload: ShouldReloadFunction = ({ submission }) => {
	// only refetch if changing theme, logout and login
	return (
		submission?.action === '/api/set-theme' ||
		submission?.action === '/logout' ||
		Boolean(submission?.action.includes('/login')) ||
		Boolean(submission?.action.includes('/join')) ||
		submission?.action === '/settings/account' ||
		submission?.action === '/settings/danger'
	);
	// || submission?.action === undefined
	// || Boolean(submission?.action.includes("/media"))
};

export async function loader({ request, params }: LoaderArgs) {
	const [{ theme }, user] = await Promise.all([
		getTheme(request),
		getUser(request),
	]);

	return json({
		theme,
		user,
	});
}

const Document = ({
	children,
	title = 'App',
}: {
	children: ReactNode;
	title?: string;
}) => {
	let isHydrated = useHydrated();

	return (
		<html lang="en">
			<head>
				<Meta />
				<title>{title}</title>
				<Links />
			</head>
			<body>
				{isHydrated ? children : null}
				<ScrollRestoration />
				<Scripts />
				<LiveReload />
			</body>
		</html>
	);
};

const mantineTheme = {
	fontFamily: 'Inter, sans-serif',
	headings: { fontFamily: 'Inter, sans-serif' },
	// primaryShade: {light: 5, dark: 9},
	colors: { ...colors },
	defaultRadius: '0',
	// activeStyles: { transform: 'scale(0.95)', transition: "transform 0.03s ease-in-out" },
	components: {
		Badge: {
			defaultProps: {
				radius: 0,
			},
		},
	},
};

export default function App() {
	const { theme, user } = useLoaderData<typeof loader>();
	const params = useParams();

	useLoadingProgress();
	useNotification();
	useSessionId();

	return (
		<Document>
			<MantineProvider
				theme={{
					colorScheme: theme,
					focusRingStyles: {
						styles: (theme) => ({
							outline: `1px solid ${theme.colors.dark[1]}`,
						}),
						inputStyles: (theme) => ({
							border: `1px solid ${theme.colors.dark[1]}`,
						}),
					},
					...mantineTheme,
				}}
				withGlobalStyles
				withNormalizeCSS
			>
				<NavigationProgress
					color={theme === 'dark' ? 'white' : 'dark'}
					autoReset
				/>
				<NotificationsProvider position={'top-center'}>
					<Container
						size={'xl'}
						px={{ base: '12' }}
					>
						{user && !params.fileId && <Navbar />}
						<Outlet />
					</Container>
				</NotificationsProvider>
				<ScrollRestoration />
				<Scripts />
				<LiveReload />
			</MantineProvider>
		</Document>
	);
}

// todo add general catch and error boundaries not using mantine
