import { Button, useMantineTheme } from '@mantine/core';

// type ButtonType = ButtonProps[] & {children?: string}

// interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

export const PrimaryButton = (props: any) => {
	const theme = useMantineTheme();

	return (
		<Button
			variant={theme.colorScheme === 'dark' ? 'white' : 'filled'}
			color="dark"
			{...props}
		>
			{props.children}
		</Button>
	);
};
