import crypto from 'crypto';
import { LemonsqueezyClient } from 'lemonsqueezy.ts';
import invariant from 'tiny-invariant';

const { LEMON_SECRET } = process.env;

invariant(LEMON_SECRET, 'LEMON_SECRET must be set');

export async function nodejsWebHookHandler<CustomData = any>({
	request,
	onData,
}: {
	request: Request;
	onData: (data: DiscriminatedWebhookPayload<CustomData>) => any;
}) {
	const text = await request.text();

	try {
		const hmac = crypto.createHmac('sha256', LEMON_SECRET!);
		const digest = Buffer.from(hmac.update(text).digest('hex'), 'utf8');
		const signature = Buffer.from(
			request.headers.get('X-Signature') || '',
			'utf8',
		);

		if (!crypto.timingSafeEqual(digest, signature)) {
			console.log('invalid webhook');
			return false;
		}

		const payload: WebhookPayload = JSON.parse(text);

		const eventName = payload.meta.event_name;
		// const customData = payload.meta.custom_data;

		await onData({ event_name: eventName, ...payload } as any);
		return true;
	} catch (e: any) {
		return false;
	}
}

type SubscriptionEventNames =
	| 'subscription_created'
	| 'subscription_cancelled'
	| 'subscription_resumed'
	| 'subscription_expired'
	| 'subscription_paused'
	| 'subscription_unpaused'
	| 'subscription_updated';

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

const key =
	'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI5NGQ1OWNlZi1kYmI4LTRlYTUtYjE3OC1kMjU0MGZjZDY5MTkiLCJqdGkiOiI5ZjRkMzVlMWFhNjE3ZjgzNGJmN2EyZGE3ZjI0MTIzYjc3NDNiYzJmOTk0ODViMmI5YTkyYTYwZmIwOTA2NDk5ZDgwMDhjMTdmOTM2MDEzMSIsImlhdCI6MTY4MDM3NjM1OS45ODQ0ODgsIm5iZiI6MTY4MDM3NjM1OS45ODQ0OSwiZXhwIjoxNzExOTk4NzU5Ljk3NjY0Mywic3ViIjoiNTMxNSIsInNjb3BlcyI6W119.xDigXhUXg1raIBSsyWmNbxMg6JQApvNHZaSJKZrUqq_4M5WlMLbtBSi5TkbL6ps6n7LXzw6FNtlZ7-wTHgxmY4t8n_OMZkww4kyjEjvAceJZRdY2fsXHSf6wwellCgT_ig1cr8cwyOyHJxNbEs_qyXZgLLm33U0gxK-FVQqzq3BKvTZoz9AXeuHijbpia9JhTaUiah_wYlgIS3FEaBb7lxKzZ6FRC0znptTVXOcXm0B-evIrsssviIBvRgSQA6cAXOu8um0e2M18WdpeTRVgcooAxoVHkQ69pF-mP1_nwNxirYVAccgHxYxy2l0o4cNWT7-u__t3IZjORODjO2cDc16hSwJwDeMTh-mL5zWXRfkQF-NAxMOyS50tNC9q2uriM7Uo2Q1Rup6FvB2qkJiaRIlEEnraDkRsDYtERx01ZBtEpIrIWYJdwYThKlELJxijxg4PbT708SKkmCAeO_AW-aVgitGqs99y1Lbj6h1tmorQE59PbYDVHdMRyWk0XSLb';

const client = new LemonsqueezyClient(key);

export const getLemonSubscriptions = async () => {
	const lemonSubscriptions = await client.listAllSubscriptions();

	return lemonSubscriptions;
};
