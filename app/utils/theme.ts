import { createCookie } from '@remix-run/node';

const themeCookie = createCookie('theme', {
	path: '/',
	httpOnly: true,
	maxAge: 31_536_000,
});

const DEFAULT_THEME = 'light';

export enum ThemeEnum {
	DARK = 'dark',
	LIGHT = 'light',
}

export type Theme = 'light' | 'dark';

export async function getTheme(request: Request) {
	return (
		(await themeCookie.parse(request.headers.get('cookie'))) ?? {
			theme: DEFAULT_THEME,
		}
	);
}

export async function setTheme({ theme }: { theme: string }) {
	return await themeCookie.serialize({ theme });
}
