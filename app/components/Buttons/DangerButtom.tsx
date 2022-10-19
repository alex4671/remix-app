import {Button} from "@mantine/core";

export const DangerButton = (props: any) => {

  return (
    <Button color={"red"} {...props}>
      {props.children}
    </Button>
  )
}
