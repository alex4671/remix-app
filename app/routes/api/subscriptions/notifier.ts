import type { LoaderArgs } from '@remix-run/node';
import { EventType } from '~/hooks/useSubscription';
import { emitter } from '~/server/emitter.server';
import { eventStream } from '~/utils/eventStream';

export const loader = ({ request }: LoaderArgs) => {
	return eventStream(request, (send) => {
		const handler1 = () => {
			send(EventType.NOTIFIER, 'test');
		};

		emitter.addListener(EventType.NOTIFIER, handler1);

		return () => {
			emitter.removeListener(EventType.NOTIFIER, handler1);
		};
	});
};
