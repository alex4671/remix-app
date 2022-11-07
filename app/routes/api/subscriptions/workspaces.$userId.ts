import type {LoaderArgs} from "@remix-run/node";
import {EventType} from "~/hooks/useSubscription";
import {emitter} from "~/server/emitter.server";
import {eventStream} from "~/utils/eventStream";
import invariant from "tiny-invariant";


export const loader = ({request, params}: LoaderArgs) => {
  return eventStream(request, send => {

    invariant(typeof params.userId === "string", "User id must be provided")

    const handler1 = (userId: string[], sessionId: string) => {

      if (userId.includes(params.userId ?? "")) {
        send(EventType.CREATE_WORKSPACE, sessionId)
      }
    }

    const handler2 = (userId: string[], sessionId: string) => {
      if (userId.includes(params.userId ?? "")) {
        send(EventType.INVITE_MEMBER, sessionId)
      }
    }

    const handler3 = (userId: string[], sessionId: string) => {
      if (userId.includes(params.userId ?? "")) {
        send(EventType.REMOVE_ACCESS, sessionId)
      }
    }

    const handler4 = (userId: string[], sessionId: string) => {
      if (userId.includes(params.userId ?? "")) {
        send(EventType.DELETE_WORKSPACE, sessionId)
      }
    }

    const handler5 = (userId: string[], sessionId: string) => {
      if (userId.includes(params.userId ?? "")) {
        send(EventType.REORDER_WORKSPACE, sessionId)
      }
    }

    const handler6 = (userId: string[], sessionId: string) => {
      if (userId.includes(params.userId ?? "")) {
        send(EventType.UPDATE_NAME_WORKSPACE, sessionId)
      }
    }

    const handler7 = (userId: string[], sessionId: string) => {
      if (userId.includes(params.userId ?? "")) {
        send(EventType.UPDATE_RIGHTS, sessionId)
      }
    }

    emitter.addListener(EventType.CREATE_WORKSPACE, handler1)
    emitter.addListener(EventType.INVITE_MEMBER, handler2)
    emitter.addListener(EventType.REMOVE_ACCESS, handler3)
    emitter.addListener(EventType.DELETE_WORKSPACE, handler4)
    emitter.addListener(EventType.REORDER_WORKSPACE, handler5)
    emitter.addListener(EventType.UPDATE_NAME_WORKSPACE, handler6)
    emitter.addListener(EventType.UPDATE_RIGHTS, handler7)

    return () => {
      emitter.removeListener(EventType.CREATE_WORKSPACE, handler1)
      emitter.removeListener(EventType.INVITE_MEMBER, handler2)
      emitter.removeListener(EventType.REMOVE_ACCESS, handler3)
      emitter.removeListener(EventType.DELETE_WORKSPACE, handler4)
      emitter.removeListener(EventType.REORDER_WORKSPACE, handler5)
      emitter.removeListener(EventType.UPDATE_NAME_WORKSPACE, handler6)
      emitter.removeListener(EventType.UPDATE_RIGHTS, handler7)
    }

  })
}
