import type { ActionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { nodejsWebHookHandler } from '~/utils/lemon.server';

export const action = async ({ request }: ActionArgs) => {
	const success = await nodejsWebHookHandler({
		async onData(payload) {
			// console.log(JSON.stringify(payload, null, 2));

			if (payload.event_name === 'order_created') {
				// console.log('order_created', payload.data.attributes);
				console.log('order_created');
			}
			if (payload.event_name === 'subscription_created') {
				console.log('subscription_created');
			}

			if (payload.event_name === 'subscription_updated') {
				console.log('subscription_updated');
			}

			// else if (
			// 	payload.event_name === 'subscription_created' ||
			// 	payload.event_name === 'subscription_cancelled' ||
			// 	payload.event_name === 'subscription_expired' ||
			// 	payload.event_name === 'subscription_paused' ||
			// 	payload.event_name === 'subscription_resumed' ||
			// 	payload.event_name === 'subscription_unpaused' ||
			// 	payload.event_name === "subscription_updated"
			// ) {
			// 	let sub = payload.data;
			// } else if (payload.event_name === 'license_key_created') {
			// 	// upsert license key in database
			// } else if (
			// 	payload.event_name === 'subscription_payment_success' ||
			// 	payload.event_name === 'subscription_payment_failed' ||
			// 	payload.event_name === 'subscription_payment_recovered'
			// ) {
			// 	// do something when a subscription payment is successful, failed or recovered
			// }
		},
		request,
	});

	console.log('success', success);

	if (success) {
		return json({ success: true });
	} else {
		return json(
			{ success: false, message: 'Error processing webhook' },
			{ status: 400 },
		);
	}
};
