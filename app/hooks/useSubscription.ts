import {useEffect} from "react";
import {useDataRefresh} from "remix-utils";

const FILES_SUBSCRIPTION_PATH = "/api/subscriptions/workspaces"

export enum EventType {
  CREATE_WORKSPACE = "CREATE_WORKSPACE",
  DELETE_WORKSPACE = "DELETE_WORKSPACE",
  UPDATE_RIGHTS = "UPDATE_RIGHTS",
  INVITE_MEMBER = "INVITE_MEMBER",
  REMOVE_ACCESS = "REMOVE_ACCESS",
  UPDATE_FILE = "UPDATE_FILE",
  UPLOAD_FILE = "UPLOAD_FILE",
  DELETE_FILE = "DELETE_FILE",
  CREATE_COMMENT = "CREATE_COMMENT",
  DELETE_COMMENT = "DELETE_COMMENT",
  REORDER_WORKSPACE = "REORDER_WORKSPACE",
}


export function useSubscription(events: EventType[] = [], isSubmitting: boolean) {
  let {refresh} = useDataRefresh();

  useEffect(() => {
    let eventSource = new EventSource(FILES_SUBSCRIPTION_PATH);

    events.forEach((event) => {
      eventSource.addEventListener(event, handler)
    })

    function handler(event: MessageEvent) {
      if (!isSubmitting) {
        refresh()
      }
    }


    return () => {
      eventSource.close()
    }

  }, [])

  return null
}
