import { useMatches } from '@remix-run/react';
import { useMemo } from 'react';

import dayjs from 'dayjs';
import type { ZodError } from 'zod';
import type { User } from '~/models/user.server';
import type { Theme } from '~/utils/theme';

const DEFAULT_REDIRECT = '/';

/**
 * This should be used any time the redirect path is user-provided
 * (Like the query string on our login/signup pages). This avoids
 * open-redirect vulnerabilities.
 * @param {string} to The redirect destination
 * @param {string} defaultRedirect The redirect to use if the to is unsafe.
 */
export function safeRedirect(
	to: FormDataEntryValue | string | null | undefined,
	defaultRedirect: string = DEFAULT_REDIRECT,
) {
	if (!to || typeof to !== 'string') {
		return defaultRedirect;
	}

	if (!to.startsWith('/') || to.startsWith('//')) {
		return defaultRedirect;
	}

	return to;
}

/**
 * This base hook is used in other hooks to quickly search for specific data
 * across all loader data using useMatches.
 * @param {string} id The route id
 * @returns {JSON|undefined} The router data or undefined if not found
 */
export function useMatchesData(
	id: string,
): Record<string, unknown> | undefined {
	const matchingRoutes = useMatches();
	const route = useMemo(
		() => matchingRoutes.find((route) => route.id === id),
		[matchingRoutes, id],
	);
	return route?.data;
}

function isUser(user: any): user is User {
	return user && typeof user === 'object' && typeof user.email === 'string';
}

function isTheme(theme: any): theme is Theme {
	return theme && typeof theme === 'string';
}

export function useOptionalUser(): User | undefined {
	const data = useMatchesData('root');
	if (!data || !isUser(data.user)) {
		return undefined;
	}
	return data.user;
}

// todo check this
export function useAppTheme(): Theme | undefined {
	const data = useMatchesData('root');

	if (!data || !isTheme(data.theme)) {
		return undefined;
	}
	return data.theme;
}

export function useUser(): User {
	const maybeUser = useOptionalUser();
	if (!maybeUser) {
		throw new Error(
			'No user found in root loader, but user is required by useUser. If user is optional, try useOptionalUser instead.',
		);
	}
	return maybeUser;
}

export function validateEmail(email: unknown): email is string {
	return typeof email === 'string' && email.length > 3 && email.includes('@');
}

export const errorAtPath = (error: ZodError, path: string) => {
	return error.issues.find((issue) => issue.path[0] === path)?.message;
};

export const getFileKey = (fileUrl: string) => {
	const url = new URL(fileUrl);

	return url.pathname.substring(1);
};

export const formatMoney = (
	amount?: string | number,
	currency: string = 'USD',
): string => {
	if (amount !== undefined) {
		// todo check if locale can be removed
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency,
		}).format(Number(amount));
	}
	return '0';
};

export const formatBytes = (bytes: number | undefined, decimals = 2) => {
	if (!bytes) return '0'; // todo ???
	if (!+bytes) return '0 Bytes';

	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

export const isNowBeforeDate = (date: string | undefined) => {
	if (!date) return false;
	return dayjs().isBefore(dayjs(date).endOf('day').toDate());
};
