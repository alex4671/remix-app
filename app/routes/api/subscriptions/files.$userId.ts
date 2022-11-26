import type { LoaderArgs } from '@remix-run/node';
import invariant from 'tiny-invariant';
import { EventType } from '~/hooks/useSubscription';
import { emitter } from '~/server/emitter.server';
import { eventStream } from '~/utils/eventStream';

export const loader = ({ request, params }: LoaderArgs) => {
	return eventStream(request, (send) => {
		invariant(typeof params.userId === 'string', 'User id must be provided');

		const handler1 = (userId: string[], sessionId: string) => {
			if (userId.includes(params.userId ?? '')) {
				send(EventType.REMOVE_ACCESS, sessionId);
			}
		};

		const handler2 = (userId: string[], sessionId: string) => {
			if (userId.includes(params.userId ?? '')) {
				send(EventType.DELETE_WORKSPACE, sessionId);
			}
		};

		const handler3 = (userId: string[], sessionId: string) => {
			if (userId.includes(params.userId ?? '')) {
				send(EventType.UPLOAD_FILE, sessionId);
			}
		};
		const handler4 = (userId: string[], sessionId: string) => {
			if (userId.includes(params.userId ?? '')) {
				send(EventType.DELETE_FILE, sessionId);
			}
		};
		const handler5 = (userId: string[], sessionId: string) => {
			if (userId.includes(params.userId ?? '')) {
				send(EventType.UPDATE_FILE, sessionId);
			}
		};
		const handler6 = (userId: string[], sessionId: string) => {
			if (userId.includes(params.userId ?? '')) {
				send(EventType.CREATE_COMMENT, sessionId);
			}
		};
		const handler7 = (userId: string[], sessionId: string) => {
			if (userId.includes(params.userId ?? '')) {
				send(EventType.DELETE_COMMENT, sessionId);
			}
		};
		const handler8 = (userId: string[], sessionId: string) => {
			if (userId.includes(params.userId ?? '')) {
				send(EventType.UPDATE_RIGHTS, sessionId);
			}
		};

		// const handler6 = (userId: string[], sessionId: string) => {
		//   if (userId.includes(params.userId ?? "")) {
		//     send(EventType.UPDATE_NAME_WORKSPACE, sessionId)
		//   }
		// }

		emitter.addListener(EventType.REMOVE_ACCESS, handler1);
		emitter.addListener(EventType.DELETE_WORKSPACE, handler2);
		emitter.addListener(EventType.UPLOAD_FILE, handler3);
		emitter.addListener(EventType.DELETE_FILE, handler4);
		emitter.addListener(EventType.UPDATE_FILE, handler5);
		emitter.addListener(EventType.CREATE_COMMENT, handler6);
		emitter.addListener(EventType.DELETE_COMMENT, handler7);
		emitter.addListener(EventType.UPDATE_RIGHTS, handler8);
		// emitter.addListener(EventType.UPDATE_NAME_WORKSPACE, handler6)

		return () => {
			emitter.removeListener(EventType.REMOVE_ACCESS, handler1);
			emitter.removeListener(EventType.DELETE_WORKSPACE, handler2);
			emitter.removeListener(EventType.UPLOAD_FILE, handler3);
			emitter.removeListener(EventType.DELETE_FILE, handler4);
			emitter.removeListener(EventType.UPDATE_FILE, handler5);
			emitter.removeListener(EventType.CREATE_COMMENT, handler6);
			emitter.removeListener(EventType.DELETE_COMMENT, handler7);
			emitter.removeListener(EventType.UPDATE_RIGHTS, handler8);
			// emitter.removeListener(EventType.UPDATE_NAME_WORKSPACE, handler6)
		};
	});
};

// import type {LoaderArgs} from "@remix-run/node";
// import {EventType} from "~/hooks/useSubscription";
// import {emitter} from "~/server/emitter.server";
// import {eventStream} from "~/utils/eventStream";
// import invariant from "tiny-invariant";
//
//
// export const loader = ({request, params}: LoaderArgs) => {
//   return eventStream(request, send => {
//
//     invariant(typeof params.userId === "string", "User id must be provided")
//
//     const events = [
//       EventType.REMOVE_ACCESS,
//       EventType.DELETE_WORKSPACE,
//       EventType.UPLOAD_FILE,
//       EventType.DELETE_FILE,
//       EventType.UPDATE_FILE,
//       EventType.CREATE_COMMENT,
//       EventType.DELETE_COMMENT,
//       EventType.UPDATE_RIGHTS,
//     ]
//
//
//     const handler = (userId: string[], sessionId: string, event: string) => {
//       if (userId.includes(params.userId ?? "")) {
//         send(event, sessionId)
//       }
//     }
//
//     events.forEach((event) => {
//       emitter.addListener(event, (userId, sessionId) => handler(userId, sessionId, event))
//     })
//
//     return () => {
//       events.forEach((event) => {
//         emitter.removeListener(event, (userId, sessionId) => handler(userId, sessionId, event))
//       })
//     }
//
//   })
// }
