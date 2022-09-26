import { prisma } from "~/server/db.server";

export enum PaymentStatus {
  Success = 'success',
  Error = 'error',
  Refund = 'refund',
}

// todo try catch prisma
export const subscriptionCreated = (paddle) => {
  const { userId } = JSON.parse(paddle.passthrough)

  return prisma.userPayment.upsert({
    where: {
      userId: userId
    },
    create: {
      subscriptionId: paddle.subscription_id,
      subscriptionStatus: paddle.status,
      subscriptionPlanId: paddle.subscription_plan_id,
      subscriptionEndDate: new Date(paddle.next_bill_date),
      subscriptionUpdateUrl: paddle.update_url,
      subscriptionCancelUrl: paddle.cancel_url,
      userId: userId
    },
    update: {
      subscriptionId: paddle.subscription_id,
      subscriptionStatus: paddle.status,
      subscriptionPlanId: paddle.subscription_plan_id,
      subscriptionEndDate: new Date(paddle.next_bill_date),
      subscriptionUpdateUrl: paddle.update_url,
      subscriptionCancelUrl: paddle.cancel_url,
    }
  });
};

export const subscriptionUpdated = (paddle) => {
  const { userId } = JSON.parse(paddle.passthrough)

  return prisma.userPayment.update({
    where: {
      userId: userId
    },
    data: {
      subscriptionStatus: paddle.status,
      subscriptionPlanId: paddle.subscription_plan_id,
      subscriptionEndDate: new Date(paddle.next_bill_date),
      subscriptionUpdateUrl: paddle.update_url,
      subscriptionCancelUrl: paddle.cancel_url,
    },
  });

};

export const subscriptionCanceled = (paddle) => {
  const { userId } = JSON.parse(paddle.passthrough)
  console.log("subscriptionCanceled userId", userId);
  return prisma.userPayment.update({
    where: {
      userId: userId
    },
    data: {
      subscriptionStatus: paddle.status,
      subscriptionEndDate: new Date(paddle.cancellation_effective_date),
    },
  });

};

export const subscriptionPaymentSucceeded = async (paddle) => {
  const { userId } = JSON.parse(paddle.passthrough)


  // user payment first because sometimes subscriptionCreated not fired????
  await prisma.userPaymentHistory.create({
    data: {
      userId: userId,
      status: PaymentStatus.Success,
      subscriptionId: paddle.subscription_id,
      subscriptionPaymentId: paddle.subscription_payment_id,
      subscriptionPlanId: paddle.subscription_plan_id,
      currency: paddle.currency,
      amount: paddle.sale_gross,
      amountTax: paddle.payment_tax,
      paddleFee: paddle.fee,
      paymentMethod: paddle.payment_method,
      receiptUrl: paddle.receipt_url,
      customerName: paddle.customer_name,
      userCountry: paddle.country,
    }
  })


  await prisma.userPayment.update({
    where: {
      userId: userId
    },
    data: {
      subscriptionId: paddle.subscription_id,
      subscriptionStatus: paddle.status,
      subscriptionPlanId: paddle.subscription_plan_id,
      subscriptionEndDate: new Date(paddle.next_bill_date),
    },
  });
};


export const subscriptionPaymentFailed = async (paddle) => {
  const { userId } = JSON.parse(paddle.passthrough)

  await prisma.userPayment.update({
    where: {
      userId: userId
    },
    data: {
      subscriptionEndDate: paddle.next_retry_date ? new Date(paddle.next_retry_date) : undefined,
    },
  });

  await prisma.userPaymentHistory.create({
    data: {
      userId: userId,
      status: PaymentStatus.Error,
      subscriptionId: paddle.subscription_id,
      subscriptionPaymentId: paddle.subscription_payment_id,
      subscriptionPlanId: paddle.subscription_plan_id,
      currency: paddle.currency,
      amount: paddle.amount,
      attemptNumber: paddle.attempt_number,
      nextRetryDate: paddle.next_retry_date ? new Date(paddle.next_retry_date) : undefined,
    }
  })
};

export const subscriptionPaymentRefunded = async (paddle) => {
  const { userId } = JSON.parse(paddle.passthrough)

  await prisma.userPaymentHistory.create({
    data: {
      userId: userId, // todo no userId when refunded
      status: PaymentStatus.Refund,
      subscriptionId: paddle.subscription_id,
      subscriptionPaymentId: paddle.subscription_payment_id,
      subscriptionPlanId: paddle.subscription_plan_id,
      currency: paddle.currency,
      amount: paddle.gross_refund,
      amountTax: paddle.tax_refund,
      paddleFee: paddle.fee_refund,
      refundReason: paddle.refund_reason,
      refundType: paddle.refund_type,
    }
  })
};


