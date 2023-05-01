import type { User } from '@invertase/node-paddle-sdk/src/types';
import { Box, Button, Group, Title } from '@mantine/core';
import type { ActionArgs, LoaderArgs, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { ManageSubscriptionSettings } from '~/components/Settings/Pro/ManageSubscriptionSettings';
import { PaymentTransactions } from '~/components/Settings/Pro/PaymentTransactions';
import { SubscribeToPro } from '~/components/Settings/Pro/SubscribeToPro';
import {
	getUserPaymentData,
	getUserPaymentHistory,
} from '~/models/user.server';
import { paddle } from '~/server/paddle.server';
import { getUser } from '~/server/session.server';
import { isNowBeforeDate, useUser } from '~/utils/utils';

export const meta: MetaFunction = () => {
	return {
		title: 'Settings | Pro',
	};
};

type UserSubscriptionResponse = Partial<
	Pick<User, 'cancel_url' | 'update_url' | 'state' | 'next_payment' | 'plan_id'>
>;

export const loader = async ({ request }: LoaderArgs) => {
	const user = await getUserPaymentData(request);
	const userPaymentHistory = await getUserPaymentHistory(request);

	if (user?.payment) {
		const isSubscriptionActive = isNowBeforeDate(
			user.payment.subscriptionEndDate,
		);

		const userSubscription = await paddle.listUsers({
			subscription_id: Number(user?.payment?.subscriptionId),
		});

		const { cancel_url, update_url, state, next_payment, plan_id } =
			userSubscription[0];

		const userSubscriptionResponse: UserSubscriptionResponse = {
			cancel_url,
			update_url,
			state,
			next_payment,
			plan_id,
		};

		const subscriptionId = user.payment.subscriptionId;

		const receipts = [];
		let page = 1;
		while (true) {
			const items = await paddle.listTransactions({
				entity: 'subscription',
				entity_id: subscriptionId,
				page,
			});
			receipts.push(...items);

			if (items.length === 15) {
				page++;
				continue;
			}
			break;
		}

		return json({
			payment: user?.payment,
			userSubscription: userSubscriptionResponse,
			isSubscriptionActive,
			receipts,
			userPaymentHistory,
		});
	}

	return json({
		payment: user?.payment,
		userSubscription: {} as UserSubscriptionResponse,
		isSubscriptionActive: false,
		receipts: [],
		userPaymentHistory: [],
	});
};

export const action = async ({ request }: ActionArgs) => {
	const formData = await request.formData();
	const intent = formData.get('intent');

	if (intent === 'updatePlan') {
		const planId = formData.get('planId');
		try {
			const user = await getUserPaymentData(request);
			await paddle.updateUser({
				subscription_id: Number(user?.payment?.subscriptionId),
				plan_id: Number(planId),
			});
			return json({
				success: true,
				intent,
				message: 'Subscription plan updated',
			});
		} catch (e) {
			return json({ success: false, intent, message: 'Error updating plan' });
		}
	}

	if (intent === 'generatePayLink') {
		const planId = formData.get('planId');
		try {
			const user = await getUser(request);
			const payLink = await paddle.generatePayLink({
				product_id: Number(planId),
				customer_email: user?.email,
				// prettier-ignore
				// "prices": [
				// 	"USD:19.99",
				// 	"EUR:15.99"
				// ],
				// // prettier-ignore
				// "recurring_prices": [
				// 	'USD:19.99',
				// 	'EUR:15.99'
				// ],
			});
			return json({ success: true, intent: null, payLink });
		} catch (e) {
			console.log('e', e);
			return json({
				success: false,
				intent,
				message: 'Error generating pay link',
			});
		}
	}

	return json({ success: false, intent });
};

export default function Pro() {
	const { isSubscriptionActive } = useLoaderData<typeof loader>();
	const user = useUser();

	console.log('isSubscriptionActive', isSubscriptionActive);

	// useEffect(() => {
	// 	// @ts-ignore
	// 	window?.createLemonSqueezy();
	// }, []);

	const handlePayment = () => {
		window.LemonSqueezy.Url.Open(
			`https://saas222.lemonsqueezy.com/checkout/buy/542ac9f2-b90f-4450-8bae-01e2a8f5652e?embed=1&checkout[email]=${user.email}`,
		);
	};

	return (
		<>
			{isSubscriptionActive ? (
				<ManageSubscriptionSettings />
			) : (
				<SubscribeToPro />
			)}
			<PaymentTransactions />

			<Box>
				<Title>Lemon</Title>
				<Group my={'lg'}>
					<Button onClick={handlePayment}>Test</Button>
					<Button
						component={Link}
						className="lemonsqueezy-button"
						to={`https://saas222.lemonsqueezy.com/checkout/buy/542ac9f2-b90f-4450-8bae-01e2a8f5652e?embed=1&checkout[email]=${user.email}`}
					>
						Pro Monthly (9.99)
					</Button>
					<Button
						component={Link}
						className="lemonsqueezy-button"
						to={`https://saas222.lemonsqueezy.com/checkout/buy/67798a14-9cb4-42a0-8987-7b0b1e7d5f96?embed=1&checkout[email]=${user.email}`}
					>
						Pro Yearly (99.00)
					</Button>
					<Button
						component={Link}
						className="lemonsqueezy-button"
						to={`https://saas222.lemonsqueezy.com/checkout/buy/67798a14-9cb4-42a0-8987-7b0b1e7d5f96?embed=1&checkout[email]=${user.email}`}
					>
						Inline
					</Button>
				</Group>
			</Box>
		</>
	);
}
