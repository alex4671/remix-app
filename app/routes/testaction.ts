import type { ActionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { EventType } from '~/hooks/useSubscription';
import { emitter } from '~/server/emitter.server';

export const action = ({ request }: ActionArgs) => {
	emitter.emit(EventType.NOTIFIER);
	return json({ success: 'ok' });
};
