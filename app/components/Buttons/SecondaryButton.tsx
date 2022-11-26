import { Button, useMantineTheme } from '@mantine/core';

export const SecondaryButton = (props: any) => {
	const theme = useMantineTheme();
	const btnColor = theme.colorScheme === 'dark' ? 'gray.0' : 'dark.5';

	return (
		<Button
			variant="outline"
			color={btnColor}
			{...props}
		>
			{props.children}
		</Button>
	);
};
