import { Button, useMantineTheme } from '@mantine/core';

export const DashedButton = (props: any) => {
	const theme = useMantineTheme();
	const btnColor = theme.colorScheme === 'dark' ? 'gray.0' : 'dark.5';

	return (
		<Button
			variant={'outline'}
			color={btnColor}
			styles={(theme) => ({
				root: {
					borderStyle: 'dashed',
					'&:hover': {
						backgroundColor:
							theme.colorScheme === 'dark'
								? theme.colors.dark[6]
								: theme.colors.gray[0],
					},
				},
				label: {
					color:
						theme.colorScheme === 'dark'
							? theme.colors.white
							: theme.colors.gray[5],
				},
				leftIcon: {
					color:
						theme.colorScheme === 'dark'
							? theme.colors.white
							: theme.colors.gray[5],
				},
			})}
			{...props}
		>
			{props.children}
		</Button>
	);
};
