import {useEffect} from "react";
import {useDataRefresh} from "remix-utils";

export enum EventType {
  CREATE_WORKSPACE = "CREATE_WORKSPACE",
  DELETE_WORKSPACE = "DELETE_WORKSPACE",
  UPDATE_NAME_WORKSPACE = "UPDATE_NAME_WORKSPACE",
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


export function useSubscription(href: string, events: string[]) {
  let {refresh} = useDataRefresh();

  useEffect(() => {
    let eventSource = new EventSource(href);

    const handler = (event: MessageEvent) => {
      const sessionId = sessionStorage.getItem("sessionId") ?? ""

      if (events.includes(event.type)) {
        if (event.data !== sessionId) {
          refresh()
        }
      }
    }
    events.forEach(event => {
      eventSource.addEventListener(event, handler)
    })

    return () => {
      eventSource.close()
    }

  }, [href])


  return null}
