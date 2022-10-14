import {prisma} from "~/server/db.server";
import type {
  SubscriptionCancelledWebhook,
  SubscriptionCreatedWebhook,
  SubscriptionPaymentFailedWebhook,
  SubscriptionPaymentRefundedWebhook,
  SubscriptionPaymentSucceededWebhook,
  SubscriptionUpdatedWebhook
} from "@invertase/node-paddle-sdk";


// todo check if needed
export enum PaymentStatus {
  Success = 'success',
  Error = 'error',
  Refund = 'refund',
}

// todo try catch prisma

export const subscriptionCreated = (paddle: SubscriptionCreatedWebhook) => {
  const {next_bill_date, status, subscription_plan_id, update_url, subscription_id, cancel_url, email} = paddle;


  return prisma.userPayment.upsert({
    where: {
      subscriptionId: subscription_id
    },
    create: {
      subscriptionId: subscription_id,
      subscriptionStatus: status,
      subscriptionPlanId: subscription_plan_id,
      subscriptionEndDate: new Date(next_bill_date),
      subscriptionUpdateUrl: update_url,
      subscriptionCancelUrl: cancel_url,
      user: {
        connect: {
          email: email
        }
      }
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
  const {subscription_id, status, subscription_plan_id, update_url, next_bill_date, cancel_url} = paddle;

  return prisma.userPayment.update({
    where: {
      subscriptionId: subscription_id
    },
    data: {
      subscriptionStatus: status,
      subscriptionPlanId: subscription_plan_id,
      subscriptionEndDate: new Date(next_bill_date),
      subscriptionUpdateUrl: update_url,
      subscriptionCancelUrl: cancel_url,
    },
  });

};

export const subscriptionCanceled = (paddle: SubscriptionCancelledWebhook) => {
  const {subscription_id, cancellation_effective_date, status} = paddle;


  return prisma.userPayment.update({
    where: {
      subscriptionId: subscription_id
    },
    data: {
      subscriptionStatus: status,
      subscriptionEndDate: new Date(cancellation_effective_date),
    },
  });

};

export const subscriptionPaymentSucceeded = async (paddle: SubscriptionPaymentSucceededWebhook) => {
  const {
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
    country,
    email
  } = paddle;

  console.log("email", email)
  // user payment first because sometimes subscriptionCreated not fired????
  await prisma.userPaymentHistory.create({
    data: {
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
      user: {
        connect: {
          email: email
        }
      }
    }
  })

  await prisma.userPayment.update({
    where: {
      subscriptionId: subscription_id
    },
    data: {
      // subscriptionId: subscription_id, // todo check if needed
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
    subscription_id,
    attempt_number,
    email
  } = paddle;

  await prisma.userPayment.update({
    where: {
      subscriptionId: subscription_id
    },
    data: {
      subscriptionEndDate: new Date(next_retry_date),
    },
  });

  await prisma.userPaymentHistory.create({
    data: {
      status: PaymentStatus.Error,
      subscriptionId: subscription_id,
      subscriptionPaymentId: subscription_payment_id,
      subscriptionPlanId: subscription_plan_id,
      currency: currency,
      amount: amount,
      attemptNumber: attempt_number,
      nextRetryDate: next_retry_date ? new Date(next_retry_date) : undefined,
      user: {
        connect: {
          email: email
        }
      }

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
    subscription_id,
    gross_refund,
    email
  } = paddle ;

  await prisma.userPaymentHistory.create({
    data: {
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
      user: {
        connect: {
          email: email
        }
      }

    }
  })
};


