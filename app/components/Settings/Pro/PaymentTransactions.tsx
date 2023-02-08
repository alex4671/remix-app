import {
	Anchor,
	Badge,
	Box,
	Paper,
	ScrollArea,
	Table,
	Tabs,
	Text,
	Title,
} from '@mantine/core';
import { upperFirst } from '@mantine/hooks';
import { useLoaderData } from '@remix-run/react';
import dayjs from 'dayjs';
import type { loader } from '~/routes/settings/pro';
import { formatMoney } from '~/utils/utils';

const plans: Record<string, string> = {
	'26607': 'daily',
	'26608': 'monthly',
	'26609': 'yearly',
};

export const PaymentTransactions = () => {
	const { receipts, userPaymentHistory } = useLoaderData<typeof loader>();
	console.log('userPaymentHistory', userPaymentHistory);

	// todo generate what happened e.g. Monthly -> Daily, One off charge etc.
	const paymentHistoryRows = userPaymentHistory?.map((t) => (
		<tr key={t.id}>
			<td>{dayjs(t.createdAt).format('MMMM D, YYYY')}</td>
			<td>
				<Badge color={'emerald'}>{t.alert_name}</Badge>
			</td>
			<td>
				{t.historyData.old_subscription_plan_id
					? `${upperFirst(
							plans[t.historyData?.old_subscription_plan_id!],
					  )} -> ${upperFirst(plans[t.historyData?.subscription_plan_id!])}`
					: upperFirst(plans[t.historyData?.subscription_plan_id!])}
			</td>
			<td>
				{formatMoney(t.historyData?.sale_gross!, t.historyData?.currency!)}
			</td>
		</tr>
	));

	const receiptsRows = receipts?.map((t) => (
		<tr key={t.order_id}>
			<td>{dayjs(t.created_at).format('MMMM D, YYYY')}</td>
			<td>
				<Badge color={'emerald'}>{t.status}</Badge>
			</td>
			<td>{t.is_one_off ? 'One Off' : upperFirst(plans[t.product_id])}</td>
			<td>{formatMoney(t.amount, t.currency)}</td>
			<td>
				<Anchor
					component={'a'}
					target={'_blank'}
					href={t.receipt_url}
				>
					Receipt
				</Anchor>
			</td>
		</tr>
	));

	// todo make timeline
	return receipts.length > 0 ? (
		<Paper
			shadow="0"
			p="md"
			my={6}
			withBorder
		>
			<Title order={2}>Transactions ({receipts.length})</Title>
			<Text color={'dimmed'}>History of you transactions and receipts</Text>
			<Box my={12}>
				<Tabs
					defaultValue="history"
					color={'dark'}
				>
					<Tabs.List>
						<Tabs.Tab value="history">History</Tabs.Tab>
						<Tabs.Tab value="receipts">Receipts</Tabs.Tab>
					</Tabs.List>
					<Tabs.Panel
						value="history"
						pt="xs"
					>
						<ScrollArea>
							<Table sx={{ minWidth: 576 }}>
								<thead>
									<tr>
										<th>Date</th>
										<th>Action</th>
										<th>Plan</th>
										<th>Currency/Amount</th>
									</tr>
								</thead>
								<tbody>{paymentHistoryRows}</tbody>
							</Table>
						</ScrollArea>
					</Tabs.Panel>
					<Tabs.Panel
						value="receipts"
						pt="xs"
					>
						<ScrollArea>
							<Table sx={{ minWidth: 576 }}>
								<thead>
									<tr>
										<th>Date</th>
										<th>Status</th>
										<th>Plan</th>
										<th>Currency/Amount</th>
										<th>Receipt URL</th>
									</tr>
								</thead>
								<tbody>{receiptsRows}</tbody>
							</Table>
						</ScrollArea>
					</Tabs.Panel>
				</Tabs>
			</Box>
		</Paper>
	) : null;
};

// <Suspense fallback={<p>Loading package location...</p>}>
// 	<Await
// 		resolve={userPaymentHistory}
// 		errorElement={<p>Error loading package location!</p>}
// 	>
// 		{(userPaymentHistory) =>
// 			userPaymentHistory?.map((t) => (
// 				<tr key={t.id}>
// 					<td>{dayjs(t.createdAt).format('MMMM D, YYYY')}</td>
// 					<td>
// 						<Badge color={'emerald'}>{t.alert_name}</Badge>
// 					</td>
// 					<td>
// 						{t.historyData.old_subscription_plan_id
// 							? `${upperFirst(
// 								plans[
// 									t.historyData?.old_subscription_plan_id!
// 									],
// 							)} -> ${upperFirst(
// 								plans[t.historyData?.subscription_plan_id!],
// 							)}`
// 							: upperFirst(
// 								plans[t.historyData?.subscription_plan_id!],
// 							)}
// 					</td>
// 					<td>
// 						{formatMoney(
// 							t.historyData?.sale_gross!,
// 							t.historyData?.currency!,
// 						)}
// 					</td>
// 				</tr>
// 			))
// 		}
// 	</Await>
// </Suspense>
