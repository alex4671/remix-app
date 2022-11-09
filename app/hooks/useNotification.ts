import {useEffect} from "react";
import {showNotification} from "@mantine/notifications";
import {IconCheck, IconX} from "@tabler/icons";

export const useNotification = (actionData: any) => {

  // useEffect(() => {
  //   if (actionData) {
  //     showNotification({
  //       title: actionData?.message,
  //       message: undefined,
  //       color: actionData?.success ? "green" : "red",
  //       autoClose: 2000,
  //       icon: actionData?.success ? <IconCheck /> : <IconX />,
  //     })
  //   }
  // }, [actionData])

  return null
}

