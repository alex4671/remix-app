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

export const subscriptionCreated = async (paddle: SubscriptionCreatedWebhook) => {
  const {next_bill_date, status, subscription_plan_id, update_url, subscription_id, cancel_url, email} = paddle;

  const user = await prisma.user.findUnique({where: {email}})

  return prisma.userPayment.upsert({
    where: {
      userId: user?.id
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

export const subscriptionUpdated = async (paddle: SubscriptionUpdatedWebhook) => {
  const {email, status, subscription_plan_id, update_url, next_bill_date, cancel_url} = paddle;

  const user = await prisma.user.findUnique({where: {email}})

  return prisma.userPayment.update({
    where: {
      userId: user?.id
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

export const subscriptionCanceled = async (paddle: SubscriptionCancelledWebhook) => {
  const {email, cancellation_effective_date, status} = paddle;

  const user = await prisma.user.findUnique({where: {email}})

  return prisma.userPayment.update({
    where: {
      userId: user?.id
    },
    data: {
      subscriptionStatus: status,
      subscriptionEndDate: new Date(cancellation_effective_date),
    },
  });

};

export const subscriptionPaymentSucceeded = async (paddle: SubscriptionPaymentSucceededWebhook) => {
  const {
    status,
    subscription_plan_id,
    next_bill_date,
    email,
    subscription_id
  } = paddle;


  const user = await prisma.user.findUnique({where: {email}})

  return prisma.userPayment.upsert({
    where: {
      userId: user?.id
    },
    create: {
      subscriptionId: subscription_id,
      subscriptionStatus: status,
      subscriptionPlanId: subscription_plan_id,
      subscriptionEndDate: new Date(next_bill_date),
      subscriptionUpdateUrl: "",
      subscriptionCancelUrl: "",
      user: {
        connect: {
          email: email
        }
      }
    },
    update: {
      subscriptionStatus: status,
      subscriptionPlanId: subscription_plan_id,
      subscriptionEndDate: new Date(next_bill_date),
    },
  });
};


export const subscriptionPaymentFailed = async (paddle: SubscriptionPaymentFailedWebhook) => {
  const {
    email,
    next_retry_date,
    subscription_id,
  } = paddle;
  const user = await prisma.user.findUnique({where: {email}})

  return  prisma.userPayment.update({
    where: {
      userId: user?.id
    },
    data: {
      subscriptionEndDate: new Date(next_retry_date),
    },
  });
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

  // await prisma.userPaymentHistory.create({
  //   data: {
  //     status: PaymentStatus.Refund,
  //     subscriptionId: subscription_id,
  //     subscriptionPaymentId: subscription_payment_id,
  //     subscriptionPlanId: subscription_plan_id,
  //     currency: currency,
  //     amount: gross_refund,
  //     amountTax: tax_refund,
  //     paddleFee: fee_refund,
  //     refundReason: refund_reason,
  //     refundType: refund_type,
  //     user: {
  //       connect: {
  //         email: email
  //       }
  //     }
  //
  //   }
  // })
};


