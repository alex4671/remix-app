import {prisma} from "~/server/db.server";
import type {
  SubscriptionCancelledWebhook,
  SubscriptionCreatedWebhook,
  SubscriptionPaymentFailedWebhook,
  SubscriptionPaymentRefundedWebhook,
  SubscriptionPaymentSucceededWebhook,
  SubscriptionUpdatedWebhook
} from "@invertase/node-paddle-sdk";

export enum PaymentStatus {
  Success = 'success',
  Error = 'error',
  Refund = 'refund',
}

// todo try catch prisma
// todo remove passthrough
export const subscriptionCreated = (paddle: SubscriptionCreatedWebhook) => {
  const {next_bill_date, status, subscription_plan_id, passthrough, update_url, subscription_id, cancel_url} = paddle;
  const { userId } = JSON.parse(passthrough)

  return prisma.userPayment.upsert({
    where: {
      userId: userId
    },
    create: {
      subscriptionId: subscription_id,
      subscriptionStatus: status,
      subscriptionPlanId: subscription_plan_id,
      subscriptionEndDate: new Date(next_bill_date),
      subscriptionUpdateUrl: update_url,
      subscriptionCancelUrl: cancel_url,
      userId: userId
    },
    update: {
      subscriptionId: subscription_id,
      subscriptionStatus: status,
      subscriptionPlanId: subscription_plan_id,
      subscriptionEndDate: new Date(next_bill_date),
      subscriptionUpdateUrl: update_url,
      subscriptionCancelUrl: cancel_url,
    }
  });
};

export const subscriptionUpdated = (paddle: SubscriptionUpdatedWebhook) => {
  // @ts-ignore
  const {status, subscription_plan_id, passthrough, update_url, next_bill_date, cancel_url} = paddle;
  const { userId } = JSON.parse(passthrough)

  return prisma.userPayment.update({
    where: {
      userId: userId
    },
    data: {
      subscriptionStatus: status,
      subscriptionPlanId: subscription_plan_id,
      subscriptionEndDate: new Date(next_bill_date),
      subscriptionUpdateUrl: update_url!,
      subscriptionCancelUrl: cancel_url,
    },
  });

};

export const subscriptionCanceled = (paddle: SubscriptionCancelledWebhook) => {
  const {passthrough, cancellation_effective_date, status} = paddle;
  const { userId } = JSON.parse(passthrough)
  console.log("subscriptionCanceled userId", userId);
  return prisma.userPayment.update({
    where: {
      userId: userId
    },
    data: {
      subscriptionStatus: status,
      subscriptionEndDate: new Date(cancellation_effective_date),
    },
  });

};

export const subscriptionPaymentSucceeded = async (paddle: SubscriptionPaymentSucceededWebhook) => {
  const {
    passthrough,
    payment_tax,
    payment_method,
    receipt_url,
    fee,
    status,
    subscription_payment_id,
    currency,
    sale_gross,
    subscription_plan_id,
    subscription_id,
    next_bill_date,
    customer_name,
    country
  } = paddle;
  const { userId } = JSON.parse(passthrough)


  // user payment first because sometimes subscriptionCreated not fired????
  await prisma.userPaymentHistory.create({
    data: {
      userId: userId,
      status: PaymentStatus.Success,
      subscriptionId: subscription_id,
      subscriptionPaymentId: subscription_payment_id,
      subscriptionPlanId: subscription_plan_id,
      currency: currency,
      amount: sale_gross,
      amountTax: payment_tax,
      paddleFee: fee,
      paymentMethod: payment_method,
      receiptUrl: receipt_url,
      customerName: customer_name,
      userCountry: country,
    }
  })


  await prisma.userPayment.update({
    where: {
      userId: userId
    },
    data: {
      subscriptionId: subscription_id,
      subscriptionStatus: status,
      subscriptionPlanId: subscription_plan_id,
      subscriptionEndDate: new Date(next_bill_date),
    },
  });
};


export const subscriptionPaymentFailed = async (paddle: SubscriptionPaymentFailedWebhook) => {
  const {
    subscription_payment_id,
    subscription_plan_id,
    currency,
    next_retry_date,
    amount,
    passthrough,
    subscription_id,
    attempt_number
  } = paddle;
  const { userId } = JSON.parse(passthrough)

  await prisma.userPayment.update({
    where: {
      userId: userId
    },
    data: {
      subscriptionEndDate: next_retry_date ? new Date(next_retry_date) : undefined,
    },
  });

  await prisma.userPaymentHistory.create({
    data: {
      userId: userId,
      status: PaymentStatus.Error,
      subscriptionId: subscription_id,
      subscriptionPaymentId: subscription_payment_id,
      subscriptionPlanId: subscription_plan_id,
      currency: currency,
      amount: amount,
      attemptNumber: attempt_number,
      nextRetryDate: next_retry_date ? new Date(next_retry_date) : undefined,
    }
  })
};

export const subscriptionPaymentRefunded = async (paddle: SubscriptionPaymentRefundedWebhook) => {
  const {
    subscription_payment_id,
    fee_refund,
    tax_refund,
    refund_reason,
    refund_type,
    subscription_plan_id,
    currency,
    passthrough,
    subscription_id,
    gross_refund
  } = paddle ;
  const { userId } = JSON.parse(passthrough)

  await prisma.userPaymentHistory.create({
    data: {
      userId: userId, // todo no userId when refunded
      status: PaymentStatus.Refund,
      subscriptionId: subscription_id,
      subscriptionPaymentId: subscription_payment_id,
      subscriptionPlanId: subscription_plan_id,
      currency: currency,
      amount: gross_refund,
      amountTax: tax_refund,
      paddleFee: fee_refund,
      refundReason: refund_reason,
      refundType: refund_type,
    }
  })
};


