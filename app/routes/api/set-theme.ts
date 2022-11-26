import type { ActionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { getTheme, setTheme } from '~/utils/theme';

export const action = async ({ request }: ActionArgs) => {
	let { theme } = await getTheme(request);
	const formData = await request.formData();
	theme = String(formData.get('theme') ?? theme);

	return json(
		{},
		{
			headers: {
				'Set-Cookie': await setTheme({ theme }),
			},
		},
	);
};
