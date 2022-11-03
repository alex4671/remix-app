import type {LoaderFunction} from "@remix-run/node";
import {emitter} from "~/server/emitter.server";
import {eventStream} from "~/utils/eventStream";
import {EventType} from "~/hooks/useSubscription";


export const loader: LoaderFunction = ({request}) => {
  // @ts-ignore
  return eventStream(request, send => {

    const handler1 = () => {
      send(EventType.CREATE_WORKSPACE)
    }
    const handler2 = () => {
      send(EventType.DELETE_WORKSPACE)
    }
    const handler3 = () => {
      send(EventType.UPLOAD_FILE)
    }
    const handler4 = () => {
      send(EventType.DELETE_FILE)
    }
    const handler5 = () => {
      send(EventType.UPDATE_RIGHTS)
    }
    const handler6 = () => {
      send(EventType.INVITE_MEMBER)
    }
    const handler7 = () => {
      send(EventType.REMOVE_ACCESS)
    }
    const handler8 = () => {
      send(EventType.UPDATE_FILE)
    }
    const handler9 = () => {
      send(EventType.CREATE_COMMENT)
    }
    const handler10 = () => {
      send(EventType.DELETE_COMMENT)
    }


    emitter.addListener(EventType.CREATE_WORKSPACE, handler1)
    emitter.addListener(EventType.DELETE_WORKSPACE, handler2)
    emitter.addListener(EventType.UPLOAD_FILE, handler3)
    emitter.addListener(EventType.DELETE_FILE, handler4)
    emitter.addListener(EventType.UPDATE_RIGHTS, handler5)
    emitter.addListener(EventType.INVITE_MEMBER, handler6)
    emitter.addListener(EventType.REMOVE_ACCESS, handler7)
    emitter.addListener(EventType.UPDATE_FILE, handler8)
    emitter.addListener(EventType.CREATE_COMMENT, handler9)
    emitter.addListener(EventType.DELETE_COMMENT, handler10)

    return () => {
      emitter.removeListener(EventType.CREATE_WORKSPACE, handler1)
      emitter.removeListener(EventType.DELETE_WORKSPACE, handler2)
      emitter.removeListener(EventType.UPLOAD_FILE, handler3)
      emitter.removeListener(EventType.DELETE_FILE, handler4)
      emitter.removeListener(EventType.UPDATE_RIGHTS, handler5)
      emitter.removeListener(EventType.INVITE_MEMBER, handler6)
      emitter.removeListener(EventType.REMOVE_ACCESS, handler7)
      emitter.removeListener(EventType.UPDATE_FILE, handler8)
      emitter.removeListener(EventType.CREATE_COMMENT, handler9)
      emitter.removeListener(EventType.DELETE_COMMENT, handler10)
    }

  })
}
// export const loader: LoaderFunction = ({request}) => {
//   // @ts-ignore
//   return eventStream(request, send => {
//
//     Object.keys(EventType).forEach((key) => {
//       emitter.addListener(key, () => send(key))
//     })
//
//
//     return () => {
//       Object.keys(EventType).forEach((key) => {
//         emitter.removeListener(key, () => send(key))
//       })
//     }
//
//   })
// }
