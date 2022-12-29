import { useRevalidator } from '@remix-run/react';
import { nanoid } from 'nanoid';
import { useEffect } from 'react';

export enum EventType {
	CREATE_WORKSPACE = 'CREATE_WORKSPACE',
	DELETE_WORKSPACE = 'DELETE_WORKSPACE',
	UPDATE_NAME_WORKSPACE = 'UPDATE_NAME_WORKSPACE',
	UPDATE_RIGHTS = 'UPDATE_RIGHTS',
	INVITE_MEMBER = 'INVITE_MEMBER',
	REMOVE_ACCESS = 'REMOVE_ACCESS',
	UPDATE_FILE = 'UPDATE_FILE',
	UPLOAD_FILE = 'UPLOAD_FILE',
	DELETE_FILE = 'DELETE_FILE',
	CREATE_COMMENT = 'CREATE_COMMENT',
	DELETE_COMMENT = 'DELETE_COMMENT',
	REORDER_WORKSPACE = 'REORDER_WORKSPACE',
	NOTIFIER = 'NOTIFIER',
}

export function useSubscription(href: string, events: string[]) {
	let revalidator = useRevalidator();

	useEffect(() => {
		let eventSource = new EventSource(href);

		const handler = (event: MessageEvent) => {
			const sessionId = sessionStorage.getItem('sessionId') ?? nanoid();

			if (events.includes(event.type)) {
				if (event.data !== sessionId) {
					revalidator.revalidate();
				}
			}
		};
		events.forEach((event) => {
			eventSource.addEventListener(event, handler);
		});

		return () => {
			events.forEach((event) => {
				eventSource.removeEventListener(event, handler);
			});
			eventSource.close();
		};
	}, [href, revalidator, events]);

	return null;
}
