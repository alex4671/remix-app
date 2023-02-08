import { Button } from '@mantine/core';
import { Link, useLocation } from '@remix-run/react';

interface Props {
	to: string;
	title: string;
	disabled?: boolean;
}

export const TabLink = ({ to, title, disabled = false }: Props) => {
	const location = useLocation();

	return (
		<Button
			component={Link}
			to={`.${to}`}
			variant={location.pathname.includes(to) ? 'filled' : 'subtle'}
			disabled={disabled}
			// sx={(theme) => ({
			// 	display: 'block',
			// 	lineHeight: 1,
			// 	padding: '8px 16px',
			// 	textDecoration: 'none',
			// 	cursor: disabled ? 'not-allowed' : 'initial',
			// 	color:
			// 		theme.colorScheme === 'dark' ? theme.white : theme.colors.dark[5],
			// 	backgroundColor: disabled
			// 		? theme.colors.gray[2]
			// 		: location.pathname.includes(to)
			// 		? theme.colorScheme === 'dark'
			// 			? theme.colors.dark[4]
			// 			: theme.colors.gray[1]
			// 		: 'inherit',
			// 	fontSize: theme.fontSizes.lg,
			// 	fontWeight: 500,
			//
			// 	'&:hover': {
			// 		backgroundColor: disabled
			// 			? theme.colors.gray[3]
			// 			: location.pathname.includes(to)
			// 			? theme.colorScheme === 'dark'
			// 				? theme.colors.dark[4]
			// 				: theme.colors.gray[1]
			// 			: theme.colorScheme === 'dark'
			// 			? theme.colors.dark[6]
			// 			: theme.colors.gray[0],
			// 	},
			// })}
		>
			{title}
		</Button>
	);
};
