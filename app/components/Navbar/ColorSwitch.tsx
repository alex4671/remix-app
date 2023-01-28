import { ActionIcon } from '@mantine/core';
import { useHotkeys } from '@mantine/hooks';
import { useFetcher } from '@remix-run/react';
import { IconMoon, IconSun } from '@tabler/icons-react';
import { useAppTheme } from '~/utils/utils';

export const ColorSwitch = () => {
	const theme = useAppTheme();
	const fetcher = useFetcher();

	useHotkeys([
		[
			'mod+J',
			() => {
				fetcher.submit(
					{ theme: theme === 'dark' ? 'light' : 'dark' },
					{ method: 'post', action: '/api/set-theme' },
				);
			},
		],
	]);

	return (
		<>
			<fetcher.Form
				method="post"
				action="/api/set-theme"
			>
				{theme === 'dark' ? (
					<ActionIcon
						color={'yellow'}
						title="Toggle color scheme"
						type={'submit'}
						name="theme"
						value={'light'}
					>
						<IconSun size={18} />
					</ActionIcon>
				) : (
					<ActionIcon
						color={'gray'}
						title="Toggle color scheme"
						type={'submit'}
						name="theme"
						value={'dark'}
					>
						<IconMoon size={18} />
					</ActionIcon>
				)}
			</fetcher.Form>
		</>
	);
};
