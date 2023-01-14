// // Need to create a cookie we can use to manage anonymous preferences
import { createCookie } from '@remix-run/node';
import invariant from 'tiny-invariant';

invariant(process.env.SESSION_SECRET, 'SESSION_SECRET must be set');

export const anonUserPreferences = createCookie('anonUserPreferences', {
	httpOnly: true,
	maxAge: 60 * 60 * 24 * 365, // 1 year
	path: '/',
	sameSite: 'strict',
	secrets: [process.env.SESSION_SECRET],
	secure: process.env.NODE_ENV === 'production',
});
//
// // Default preferences used as fallback if cookie has been deleted by client
// const defaultPreferences = {
// 	preferences: {
// 		preferenceKey: 'value',
// 	},
// };
//
// /**
//  * Isomorphic function that saves data to the correct location based on the
//  * existence of a user.
//  *
//  * We return an object with response and headers since the call site will need
//  * to commit the cookie in the Response.
//  **/
// async function updateUserPreference(
// 	request: Request,
// 	key: string,
// 	user?: User,
// ) {
// 	const formData = await request.clone().formData();
// 	const preferenceValue = formData.get(key);
//
// 	if (typeof preferenceValue !== 'string') {
// 		throw new Error('Missing preference value.');
// 	}
//
// 	if (user) {
// 		await updateUser({
// 			preferences: { ...user.preferences, [key]: preferenceValue },
// 		});
//
// 		return { response: { success: true } };
// 	} else {
// 		const { preferences } =
// 			(await anonUserPreferences.parse(request.headers.get('Cookie'))) ||
// 			defaultPreferences;
//
// 		return {
// 			response: { success: true },
// 			headers: {
// 				'Set-Cookie': await anonUserPreferences.serialize({
// 					preferences: { ...preferences, [key]: preferenceValue },
// 				}),
// 			},
// 		};
// 	}
// }
//
// // This in Remix is how a server request is managed
// export async function action({ request }: ActionArgs) {
// 	const maybeUser = getOptionalUser(request);
//
// 	try {
// 		const { response, headers } = await updateUserPreference(
// 			request,
// 			'preferenceKey',
// 			maybeUser,
// 		);
//
// 		return json(response, { headers });
// 	} catch (e) {
// 		// Because redirects work by throwing a Response, you need to check if the
// 		// caught error is a response and return it or throw it again
// 		if (e instanceof Response) return e;
// 		if (e instanceof Error) {
// 			throw json({ message: e.message });
// 		}
//
// 		throw json({ message: 'Unknown server error.' });
// 	}
// }
//
// /**
//  * Isomorphic function that fetches data from the correct location based on the
//  * existence of a user.
//  *
//  * We return an object with preferences and headers since the call site will need
//  * to commit the cookie in the Response.
//  **/
// async function fetchUserPreference(request: Request, user?: User) {
// 	if (user) {
// 		return { preferences: user.preferences };
// 	} else {
// 		const { preferences } =
// 		(await anonUserPreferences.parse(request.headers.get("Cookie"))) ||
// 		defaultPreferences;
//
// 		return {
// 			response: { preferences },
// 			headers: {
// 				"Set-Cookie": await anonUserPreferences.serialize({ preferences }),
// 			},
// 		};
// 	}
// }
//
// // This is the server portion of loading a page in Remix
// export async function loader({ request }: LoaderArgs) {
// 	const maybeUser = getOptionalUser(request);
//
// 	try {
// 		const { preferences, headers } = await fetchUserPreference(
// 			request,
// 			maybeUser
// 		);
//
// 		// Do what ever you want with the preferences
//
// 		// I'm passing null here, but in a real world use case you would
// 		// probably have some data you want to pass along on page load
// 		return json(null, { headers });
// 	} catch (e) {
// 		// Because redirects work by throwing a Response, you need to check if the
// 		// caught error is a response and return it or throw it again
// 		if (e instanceof Response) return e;
// 		if (e instanceof Error) {
// 			throw json({ message: e.message });
// 		}
//
// 		throw json({ message: "Unknown server error." });
// 	}
// }
