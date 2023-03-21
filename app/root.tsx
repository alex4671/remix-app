import { Container, MantineProvider } from '@mantine/core';
import { NotificationsProvider } from '@mantine/notifications';
import { NavigationProgress } from '@mantine/nprogress';
import type { LinksFunction, LoaderArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import type { ShouldRevalidateFunction } from '@remix-run/react';
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
import { Banner } from '~/components/Banner/Banner';
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

export const shouldRevalidate: ShouldRevalidateFunction = (args) => {
	// console.log('args', args);

	return (
		args?.formAction === '/api/set-theme' ||
		args?.formAction === '/logout' ||
		Boolean(args?.formAction?.includes('/login')) ||
		Boolean(args?.formAction?.includes('/join')) ||
		args?.formAction === '/settings/account' ||
		args?.formAction === '/settings/danger'
	);
};

export async function loader({ request, params }: LoaderArgs) {
	const [{ theme }, user] = await Promise.all([
		getTheme(request),
		getUser(request),
	]);
	// const test = encrypt(JSON.stringify({ data: 'Test', success: true }));
	//
	// const decrypted = decrypt(test);
	// console.log('encrypted text', test);
	// console.log('decrypted text', JSON.parse(decrypted));
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
	primaryColor: 'dark',
	// activeStyles: { transform: 'scale(0.95)', transition: "transform 0.03s ease-in-out" },
	components: {
		Badge: {
			defaultProps: {
				radius: 0,
			},
		},
		Chip: {
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
					// focusRingStyles: {
					// 	styles: (theme) => ({
					// 		outline: `1px solid ${theme.colors.dark[1]}`,
					// 	}),
					// 	inputStyles: (theme) => ({
					// 		border: `1px solid ${theme.colors.dark[1]}`,
					// 	}),
					// },
					...mantineTheme,
					// globalStyles: (theme) => ({
					// 	body: {
					// 		backgroundColor:
					// 			theme.colorScheme === 'dark'
					// 				? theme.colors.dark[7]
					// 				: theme.colors.gray[1],
					// 	},
					// }),
				}}
				withGlobalStyles
				withNormalizeCSS
			>
				<NavigationProgress
					color={theme === 'dark' ? 'white' : 'dark'}
					autoReset
				/>
				<NotificationsProvider position={'top-center'}>
					<Banner />
					<Container
						size={'xl'}
						px={{ base: '12' }}
					>
						{user && !params.fileId && <Navbar />}
						{/*<motion.main*/}
						{/*	key={pathname}*/}
						{/*	initial={{ opacity: 0, y: 15 }}*/}
						{/*	animate={{ opacity: 1, y: 0 }}*/}
						{/*	exit={{ opacity: 0, y: 15 }}*/}
						{/*	transition={{ delay: 0.25 }}*/}
						{/*>*/}
						{/*	{outlet}*/}
						{/*</motion.main>*/}
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
