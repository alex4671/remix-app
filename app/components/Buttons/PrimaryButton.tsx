// import type { ButtonProps} from "@mantine/core";
import {Button, useMantineTheme} from "@mantine/core";

// type ButtonType = ButtonProps[] & {children?: string}

export const PrimaryButton = (props: any) => {
  const theme = useMantineTheme()

  return (
    <Button variant={theme.colorScheme === "dark" ? "white": "filled"} color="dark" {...props}>
      {props.children}
    </Button>
  )
}
