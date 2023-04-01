import type { ActionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import crypto from 'crypto';

export const action = async ({ request }: ActionArgs) => {
	const text = await request.text();
	const urlParams = new URLSearchParams(text);
	const payload = Object.fromEntries(urlParams);

	const secret = '1231233123'; // todo check with wrong signature

	const hmac = crypto.createHmac('sha256', secret);
	const digest = Buffer.from(hmac.update(text).digest('hex'), 'utf8');
	const signature = Buffer.from(
		request.headers.get('X-Signature') || '',
		'utf8',
	);

	if (!crypto.timingSafeEqual(digest, signature)) {
		throw new Error('Invalid signature.');
	}

	// console.log('payload', payload);

	const event: WebhookPayload = JSON.parse(text);

	const eventName = event.meta.event_name;

	console.log(eventName, event);
	console.log('------------------------------------------------------------');

	// const event = payload as PaddleWebhook;
	// if (event.alert_name === 'subscription_created') {
	// 	try {
	// 		console.log('subscription_created', event.subscription_id);
	// 		await subscriptionCreated(event);
	// 	} catch (e) {
	// 		console.log('error', e);
	// 		console.log('subscription_created_error', event);
	// 	}
	// }
	// if (event.alert_name === 'subscription_updated') {
	// 	try {
	// 		console.log('subscription_updated', event.subscription_id);
	// 		await subscriptionUpdated(event);
	// 	} catch (e) {
	// 		console.log('error', e);
	// 		console.log('subscription_updated_error', event);
	// 	}
	// }
	// if (event.alert_name === 'subscription_cancelled') {
	// 	try {
	// 		console.log('subscription_cancelled', event.subscription_id);
	// 		await subscriptionCanceled(event);
	// 	} catch (e) {
	// 		console.log('error', e);
	// 		console.log('subscription_cancelled_error', event);
	// 	}
	// }
	// if (event.alert_name === 'subscription_payment_succeeded') {
	// 	try {
	// 		console.log('subscription_payment_succeeded', event.subscription_id);
	// 		await subscriptionPaymentSucceeded(event);
	// 	} catch (e) {
	// 		console.log('error', e);
	// 		console.log('subscription_payment_succeeded_error', event);
	// 	}
	// }
	// if (event.alert_name === 'subscription_payment_failed') {
	// 	try {
	// 		console.log('subscription_payment_failed', event.subscription_id);
	// 		await subscriptionPaymentFailed(event);
	// 	} catch (e) {
	// 		console.log('error', e);
	// 		console.log('subscription_payment_failed_error', event);
	// 	}
	// }
	// if (event.alert_name === 'subscription_payment_refunded') {
	// 	try {
	// 		console.log('subscription_payment_refunded', event.subscription_id);
	// 		await subscriptionPaymentRefunded(event);
	// 	} catch (e) {
	// 		console.log('error', e);
	// 		console.log('subscription_payment_refunded_error', event);
	// 	}
	// }

	return json({ success: true }, 200);
};

type SubscriptionEventNames =
	| 'subscription_created'
	| 'subscription_cancelled'
	| 'subscription_resumed'
	| 'subscription_expired'
	| 'subscription_paused'
	| 'subscription_unpaused';

type SubscriptionInvoiceEventNames =
	| 'subscription_payment_success'
	| 'subscription_payment_failed'
	| 'subscription_payment_recovered';

type OrderEventNames = 'order_created' | 'order_refunded';

type LicenseKeyEventNames = 'license_key_created';

export type WebhookPayload<CustomData = any> = {
	meta: {
		event_name:
			| SubscriptionEventNames
			| SubscriptionInvoiceEventNames
			| OrderEventNames
			| LicenseKeyEventNames;
		custom_data: CustomData;
	};
	data: Subscription | SubscriptionInvoice | Order | LicenseKey;
};

// augmented type to make TypeScript discriminated unions work: https://www.typescriptlang.org/docs/handbook/unions-and-intersections.html#discriminating-unions
export type DiscriminatedWebhookPayload<CustomData = any> =
	| {
			event_name: SubscriptionEventNames;
			meta: {
				event_name: SubscriptionEventNames;

				custom_data: CustomData;
			};
			data: Subscription;
	  }
	| {
			event_name: SubscriptionInvoiceEventNames;
			meta: {
				event_name: SubscriptionInvoiceEventNames;
				custom_data: CustomData;
			};
			data: SubscriptionInvoice;
	  }
	| {
			event_name: OrderEventNames;
			meta: { event_name: OrderEventNames; custom_data: CustomData };
			data: Order;
	  }
	| {
			event_name: LicenseKeyEventNames;
			meta: { event_name: LicenseKeyEventNames; custom_data: CustomData };
			data: LicenseKey;
	  };

export type EventName = WebhookPayload['meta']['event_name'];

export type SubscriptionInvoice = {
	type: 'subscription-invoices';
	id: string;
	attributes: {
		store_id: number;
		subscription_id: number;
		billing_reason: string;
		card_brand: string;
		card_last_four: string;
		currency: string;
		currency_rate: string;
		subtotal: number;
		discount_total: number;
		tax: number;
		total: number;
		subtotal_usd: number;
		discount_total_usd: number;
		tax_usd: number;
		total_usd: number;
		status: string;
		status_formatted: string;
		refunded: number;
		refunded_at: any;
		subtotal_formatted: string;
		discount_total_formatted: string;
		tax_formatted: string;
		total_formatted: string;
		urls: {
			invoice_url: string;
		};
		created_at: string;
		updated_at: string;
		test_mode: boolean;
	};
	relationships: {
		store: {
			links: {
				related: string;
				self: string;
			};
		};
		subscription: {
			links: {
				related: string;
				self: string;
			};
		};
	};
	links: {
		self: string;
	};
};

export type Subscription = {
	type: 'subscriptions';
	id: string;
	attributes: {
		store_id: number;
		order_id: number;
		order_item_id: number;
		product_id: number;
		variant_id: number;
		product_name: string;
		variant_name: string;
		user_name: string;
		user_email: string;
		status: SubscriptionStatus;
		status_formatted: string;
		pause: any | null;
		cancelled: boolean;
		trial_ends_at: string | null;
		billing_anchor: number;
		urls: {
			update_payment_method: string;
		};
		renews_at: string;
		/**
		 * If the subscription has as status of cancelled or expired, this will be an ISO-8601 formatted date-time string indicating when the subscription expires (or expired). For all other status values, this will be null.
		 */
		ends_at: string | null;
		created_at: string;
		updated_at: string;
		test_mode: boolean;
	};
};

export type Order = {
	type: 'orders';
	id: string;
	attributes: {
		store_id: number;
		identifier: string;
		order_number: number;
		user_name: string;
		user_email: string;
		currency: string;
		currency_rate: string;
		subtotal: number;
		discount_total: number;
		tax: number;
		total: number;
		subtotal_usd: number;
		discount_total_usd: number;
		tax_usd: number;
		total_usd: number;
		tax_name: string;
		tax_rate: string;
		status: string;
		status_formatted: string;
		refunded: number;
		refunded_at: any;
		subtotal_formatted: string;
		discount_total_formatted: string;
		tax_formatted: string;
		total_formatted: string;
		first_order_item: {
			id: number;
			order_id: number;
			product_id: number;
			variant_id: number;
			product_name: string;
			variant_name: string;
			price: number;
			created_at: string;
			updated_at: string;
			test_mode: boolean;
		};
		created_at: string;
		updated_at: string;
	};
};

export type LicenseKey = {
	type: 'license-keys';
	id: string;
	attributes: {
		store_id: number;
		order_id: number;
		order_item_id: number;
		product_id: number;
		user_name: string;
		user_email: string;
		key: string;
		key_short: string;
		activation_limit: number;
		instances_count: number;
		disabled: number;
		status: string;
		status_formatted: string;
		expires_at: any;
		created_at: string;
		updated_at: string;
	};
};

type SubscriptionStatus =
	| 'on_trial'
	| 'active'
	| 'paused'
	| 'past_due'
	| 'unpaid'
	| 'cancelled'
	| 'expired';
