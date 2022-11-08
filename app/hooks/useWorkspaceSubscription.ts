import {useEffect} from "react";
import {EventType} from "~/hooks/useSubscription";
import {useDataRefresh} from "remix-utils";

export const useWorkspaceSubscription = (href: string, events: string[]) => {
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

    eventSource.addEventListener(EventType.CREATE_WORKSPACE, handler)
    eventSource.addEventListener(EventType.DELETE_WORKSPACE, handler)
    eventSource.addEventListener(EventType.REORDER_WORKSPACE, handler)
    eventSource.addEventListener(EventType.INVITE_MEMBER, handler)
    eventSource.addEventListener(EventType.REMOVE_ACCESS, handler)
    eventSource.addEventListener(EventType.UPDATE_NAME_WORKSPACE, handler)
    eventSource.addEventListener(EventType.UPDATE_RIGHTS, handler)

    return () => {
      eventSource.close()
    }

  }, [href])


  return null
}
