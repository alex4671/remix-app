import {
	Anchor,
	Badge,
	Button,
	Checkbox,
	Group,
	NumberInput,
	Paper,
	Radio,
	ScrollArea,
	Stack,
	Table,
	Text,
	TextInput,
} from '@mantine/core';
import { upperFirst } from '@mantine/hooks';
import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useFetcher, useLoaderData, useNavigate } from '@remix-run/react';
import { IconCurrencyDollar } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useState } from 'react';
import invariant from 'tiny-invariant';
import usePaddle from '~/hooks/usePaddle';
import { prisma } from '~/server/db.server';
import { paddle } from '~/server/paddle.server';
import { requireUser } from '~/server/session.server';
import { useUser } from '~/utils/utils';

const plans: Record<string, string> = {
	'26607': 'daily',
	'26608': 'monthly',
	'26609': 'yearly',
};

const planPrices: Record<string, string> = {
	'26607': '1$/day',
	'26608': '24$/month',
	'26609': '230$/year',
};

export const loader = async ({ request, params }: LoaderArgs) => {
	await requireUser(request);
	const userId = params.userId;
	invariant(typeof userId === 'string', 'User Id must be provided');
	const user = await prisma.user.findUnique({
		where: {
			id: userId,
		},
		select: {
			payment: true,
		},
	});

	if (user?.payment) {
		const subscriptionId = user.payment.subscriptionId;
		const transactions = await paddle.listTransactions({
			entity: 'subscription',
			entity_id: subscriptionId,
		});
		// const test = await paddle.updateUser({subscription_id: 336541, pause: false})

		// console.log("test", test)
		// const data = await paddle.getWebhookHistory({})
		const modifiers = await paddle.listModifiers({
			subscription_id: subscriptionId,
		});
		// const data = await paddle.deleteModifier({modifier_id: 344501})

		// const data = await paddle.createOneOffCharge({subscription_id: 332688, charge_name: "Test", amount: 100 })
		// const data = await paddle.updateUser({subscription_id: 332688, pause: false, })

		const userSubscription = await paddle.listUsers({
			subscription_id: Number(subscriptionId),
		});
		// const data = await paddle.createModifier({subscription_id: 332688, modifier_amount: 12, modifier_recurring: true})
		// const data  = await paddleSdk.createSubscriptionModifier({subscriptionId: 332688, amount: -22, isRecurring: true, description: "Test"})
		// console.log("data", await data.json())
		// const test = await data

		return json({
			userPayment: user.payment,
			transactions,
			modifiers,
			userSubscription,
		});
	}

	return json({
		userPayment: null,
		transactions: [],
		modifiers: [],
		userSubscription: [],
	});
};

export default function UserPayment() {
	const { userPayment, transactions, modifiers, userSubscription } =
		useLoaderData<typeof loader>();

	console.log('userPayment', userPayment);

	// const data = useActionData<typeof action>()
	// console.log("data", data)
	const fetcher = useFetcher();
	const navigate = useNavigate();
	// if (data?.intent === "removeModifier") {
	//   showNotification({
	//     title: 'Default notification',
	//     message: 'Hey there, your code is awesome! 🤥',
	//   })
	// }

	console.log('transactions', transactions);

	const { paddle } = usePaddle({ environment: 'sandbox', vendor: 3808 });
	const user = useUser();
	const [selectedPlan, setSelectedPlan] = useState('26607');
	const [extra, setExtra] = useState(0);

	if (!userPayment) {
		return <div>No payment for this user</div>;
	}

	const checkoutComplete = (data: any) => {
		console.log('data', data);
		console.log('data', data.checkout.completed);

		if (data.checkout.completed) {
			navigate('/payment/subscribed');
		}
	};

	const checkoutClosed = (data: any) => {
		console.log('checkoutClosed', data);
	};

	const handleCancelSubscription = () => {
		paddle.Checkout.open({
			override: userSubscription[0].cancel_url,
			successCallback: checkoutComplete,
			closeCallback: checkoutClosed,
		});
	};

	const handleUpdateSubscription = () => {
		paddle.Checkout.open({
			override: userSubscription[0].update_url,
			successCallback: checkoutComplete,
			closeCallback: checkoutClosed,
		});
	};

	const isPaused = !!userSubscription?.[0]?.paused_at;
	console.log('userSubscription', userSubscription);

	const priceWithModifiers = modifiers?.reduce(
		(acc, item) => acc + parseInt(item.amount),
		0,
	);

	const rows = transactions?.map((t) => (
		<tr key={t.order_id}>
			<td>{dayjs(t.created_at).format('MMM D, YY H:mm')}</td>
			<td>
				<Badge color={'green'}>{t.status}</Badge>
			</td>
			<td>{t.is_one_off ? 'One Off' : upperFirst(plans[t.product_id])}</td>
			<td>
				{t.amount}/{t.currency}
			</td>
			<td>
				<Anchor
					component={'a'}
					target={'_blank'}
					href={t.receipt_url}
				>
					Receipt
				</Anchor>
			</td>
			<td>
				<fetcher.Form method={'post'}>
					<input
						type="hidden"
						name="orderId"
						value={t.order_id}
					/>
					<Button
						compact
						size={'xs'}
						type={'submit'}
						name={'intent'}
						value={'refund'}
						// @ts-ignore
						disabled={t.status === 'refunded'}
					>
						Refund
					</Button>
				</fetcher.Form>
			</td>
		</tr>
	));

	const modifiersRow = modifiers?.map((m) => (
		<tr key={m.modifier_id}>
			<td>
				{parseInt(m.amount)}/{m.currency}
			</td>
			<td>
				<Badge color={'green'}>{m.is_recurring ? 'Yes' : 'No'}</Badge>
			</td>
			<td>{m.description}</td>
			<td>
				<fetcher.Form method={'post'}>
					<input
						type="hidden"
						name="modifierId"
						value={m.modifier_id}
					/>
					<Button
						color={'red'}
						compact
						size={'xs'}
						type={'submit'}
						name={'intent'}
						value={'removeModifier'}
					>
						Remove
					</Button>
				</fetcher.Form>
			</td>
		</tr>
	));

	return (
		<>
			<Paper
				shadow="0"
				p="md"
				my={6}
				withBorder
			>
				<Text>
					Next payment:{' '}
					{isPaused
						? 'Paused'
						: dayjs(userSubscription?.[0]?.next_payment?.date).format('MMM, D')}
					. {userSubscription?.[0]?.next_payment?.amount ?? 0}$
				</Text>
				<fetcher.Form method={'post'}>
					<Group mt={12}>
						<Button
							color={'emerald'}
							onClick={handleUpdateSubscription}
						>
							Update subscription
						</Button>
						<Button
							color={isPaused ? 'green' : 'red'}
							type={'submit'}
							name={'intent'}
							value={'pause'}
						>
							{isPaused ? 'Resume subscription' : 'Pause subscription'}
						</Button>
						<Button
							color={'red'}
							onClick={handleCancelSubscription}
						>
							Cancel subscription
						</Button>
					</Group>
				</fetcher.Form>
			</Paper>
			<Paper
				shadow="0"
				p="md"
				my={6}
				withBorder
			>
				<fetcher.Form method={'post'}>
					<Stack align="flex-start">
						<Text>Pay extra</Text>
						<NumberInput
							value={extra}
							onChange={(val) => setExtra(val ?? 0)}
							placeholder={'Amount'}
							defaultValue={100}
							parser={(value) => value?.replace(/\$\s?|(,*)/g, '')}
							name={'extraAmount'}
							max={1200}
							min={0}
							hideControls
							icon={<IconCurrencyDollar size={18} />}
						/>
						<Button
							variant={'filled'}
							color={'dark'}
							type={'submit'}
							name={'intent'}
							value={'payExtra'}
						>
							Pay
						</Button>
					</Stack>
				</fetcher.Form>
			</Paper>
			<Paper
				shadow="0"
				p="md"
				my={6}
				withBorder
			>
				<Text>Add modifiers</Text>
				<fetcher.Form method={'post'}>
					<Stack
						my={12}
						align="flex-start"
					>
						<Radio.Group
							name="modifierType"
							defaultValue={'add'}
						>
							<Radio
								value="add"
								label="Add"
							/>
							<Radio
								value="remove"
								label="Remove"
							/>
						</Radio.Group>
						<NumberInput
							placeholder={'Amount'}
							parser={(value) => value?.replace(/\$\s?|(,*)/g, '')}
							name={'modifierAmount'}
							max={1200}
							min={0}
							hideControls
						/>
						<TextInput
							name={'modifierDescription'}
							placeholder={'Description'}
						></TextInput>
						<Checkbox
							label="Is recurring"
							name={'modifierRecurring'}
							defaultChecked
						/>
						<Button
							type={'submit'}
							name={'intent'}
							value={'addModifier'}
						>
							Submit
						</Button>
					</Stack>
				</fetcher.Form>
			</Paper>
			<Paper
				shadow="0"
				p="md"
				my={6}
				withBorder
			>
				<Text>Modifiers</Text>
				<ScrollArea>
					<Table sx={{ minWidth: 576 }}>
						<thead>
							<tr>
								<th>Currency/Amount</th>
								<th>Is recurring</th>
								<th>Description</th>
								<th>Remove</th>
							</tr>
						</thead>
						<tbody>{modifiersRow}</tbody>
						<tfoot>
							<tr>
								<th>{priceWithModifiers}</th>
								<th></th>
								<th></th>
								<th></th>
							</tr>
						</tfoot>
					</Table>
				</ScrollArea>
			</Paper>
			<Paper
				shadow="0"
				p="md"
				my={6}
				withBorder
			>
				<Text>Transactions</Text>
				<ScrollArea>
					<Table sx={{ minWidth: 576 }}>
						<thead>
							<tr>
								<th>Date</th>
								<th>Status</th>
								<th>Plan</th>
								<th>Currency/Amount</th>
								<th>Receipt URL</th>
								<th>Refund</th>
							</tr>
						</thead>
						<tbody>{rows}</tbody>
					</Table>
				</ScrollArea>
			</Paper>
		</>
	);
}
