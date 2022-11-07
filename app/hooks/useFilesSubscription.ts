import {useEffect} from "react";
import {EventType} from "~/hooks/useSubscription";
import {useDataRefresh} from "remix-utils";

export const useFilesSubscription = (href: string, events: string[]) => {
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

    eventSource.addEventListener(EventType.DELETE_WORKSPACE, handler)
    eventSource.addEventListener(EventType.REMOVE_ACCESS, handler)
    eventSource.addEventListener(EventType.UPDATE_RIGHTS, handler)
    eventSource.addEventListener(EventType.UPLOAD_FILE, handler)
    eventSource.addEventListener(EventType.DELETE_FILE, handler)
    eventSource.addEventListener(EventType.UPDATE_FILE, handler)
    eventSource.addEventListener(EventType.CREATE_COMMENT, handler)
    eventSource.addEventListener(EventType.DELETE_COMMENT, handler)

    return () => {
      eventSource.close()
    }

  }, [href])


  return null
}
