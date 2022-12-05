import type {
	SubscriptionCancelledWebhook,
	SubscriptionCreatedWebhook,
	SubscriptionPaymentFailedWebhook,
	SubscriptionPaymentRefundedWebhook,
	SubscriptionPaymentSucceededWebhook,
	SubscriptionUpdatedWebhook,
} from '@invertase/node-paddle-sdk';
import { prisma } from '~/server/db.server';

// todo remove new Date
export const subscriptionCreated = async (
	paddle: SubscriptionCreatedWebhook,
) => {
	const { p_signature, alert_name, ...paddleData } = paddle;
	const { email } = paddleData;

	const user = await prisma.user.findUnique({ where: { email } });

	if (user) {
		await prisma.userPaymentHistory.create({
			data: {
				userId: user.id,
				alert_name: alert_name,
				historyData: paddleData,
			},
		});
	} else {
		console.log('subscriptionCreated no user found');
	}
};

export const subscriptionUpdated = async (
	paddle: SubscriptionUpdatedWebhook,
) => {
	const { p_signature, alert_name, ...paddleData } = paddle;
	const { email, subscription_plan_id, next_bill_date, status } = paddleData;

	const user = await prisma.user.findUnique({ where: { email } });

	const userPayment = await prisma.userPayment.update({
		where: {
			userId: user?.id,
		},
		data: {
			subscriptionStatus: status,
			subscriptionPlanId: subscription_plan_id,
			subscriptionEndDate: next_bill_date,
		},
	});

	await prisma.userPaymentHistory.create({
		data: {
			userId: userPayment?.userId,
			alert_name: alert_name,
			historyData: paddleData,
		},
	});
};

export const subscriptionCanceled = async (
	paddle: SubscriptionCancelledWebhook,
) => {
	const { p_signature, alert_name, ...paddleData } = paddle;
	const { email, cancellation_effective_date, status } = paddleData;

	const user = await prisma.user.findUnique({ where: { email } });

	const userPayment = await prisma.userPayment.update({
		where: {
			userId: user?.id,
		},
		data: {
			subscriptionStatus: status,
			subscriptionEndDate: cancellation_effective_date,
		},
	});

	await prisma.userPaymentHistory.create({
		data: {
			userId: userPayment?.userId,
			alert_name: alert_name,
			historyData: paddleData,
		},
	});
};

export const subscriptionPaymentSucceeded = async (
	paddle: SubscriptionPaymentSucceededWebhook,
) => {
	const { p_signature, alert_name, ...paddleData } = paddle;
	const {
		subscription_plan_id,
		next_bill_date,
		email,
		subscription_id,
		status,
	} = paddleData;

	const user = await prisma.user.findUnique({ where: { email } });

	const userPayment = await prisma.userPayment.upsert({
		where: {
			userId: user?.id,
		},
		create: {
			subscriptionStatus: status,
			subscriptionId: subscription_id,
			subscriptionPlanId: subscription_plan_id,
			subscriptionEndDate: next_bill_date,
			user: {
				connect: {
					email: email,
				},
			},
		},
		update: {
			subscriptionStatus: status,
			subscriptionPlanId: subscription_plan_id,
			subscriptionEndDate: next_bill_date,
		},
	});
	// todo check uniqueness of alert_id or make in unique in schema
	await prisma.userPaymentHistory.create({
		data: {
			userId: userPayment?.userId,
			alert_name: alert_name,
			historyData: paddleData,
		},
	});
};

export const subscriptionPaymentFailed = async (
	paddle: SubscriptionPaymentFailedWebhook,
) => {
	const { p_signature, alert_name, ...paddleData } = paddle;
	const { email, next_retry_date, status } = paddleData;

	const user = await prisma.user.findUnique({ where: { email } });

	const userPayment = await prisma.userPayment.update({
		where: {
			userId: user?.id,
		},
		data: {
			subscriptionStatus: status,
			subscriptionEndDate: next_retry_date,
		},
	});
	await prisma.userPaymentHistory.create({
		data: {
			userId: userPayment?.userId,
			alert_name: alert_name,
			historyData: paddleData,
		},
	});
};

export const subscriptionPaymentRefunded = async (
	paddle: SubscriptionPaymentRefundedWebhook,
) => {
	const { p_signature, alert_name, ...paddleData } = paddle;
	const { email } = paddleData;
	const user = await prisma.user.findUnique({ where: { email } });

	if (user) {
		await prisma.userPaymentHistory.create({
			data: {
				userId: user?.id,
				alert_name: alert_name,
				historyData: paddleData,
			},
		});
	}

	// figure out what to do when user refunded
	// const user = await prisma.user.findUnique({where: {email}})
	//
	// return prisma.userPayment.delete({
	//   where: {
	//     userId: user?.id
	//   },
	// });
};
