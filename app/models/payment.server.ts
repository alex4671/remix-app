import {prisma} from "~/server/db.server";
import type {
  SubscriptionCancelledWebhook,
  SubscriptionCreatedWebhook,
  SubscriptionPaymentFailedWebhook,
  SubscriptionPaymentRefundedWebhook,
  SubscriptionPaymentSucceededWebhook,
  SubscriptionUpdatedWebhook
} from "@invertase/node-paddle-sdk";


export const subscriptionCreated = async (paddle: SubscriptionCreatedWebhook) => {
  const {p_signature, alert_name, ...paddleData} = paddle;
  const {next_bill_date, status, subscription_plan_id, update_url, subscription_id, cancel_url, email} = paddleData;

  const user = await prisma.user.findUnique({where: {email}})

  const userPayment = await prisma.userPayment.upsert({
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
      subscriptionStatus: status,
      subscriptionPlanId: subscription_plan_id,
      subscriptionEndDate: new Date(next_bill_date),
      subscriptionUpdateUrl: update_url,
      subscriptionCancelUrl: cancel_url,
    }
  });


  await prisma.userPaymentHistory.create({
    data: {
      userId: userPayment?.userId,
      alert_name: alert_name,
      historyData: paddleData
    }
  })
};

export const subscriptionUpdated = async (paddle: SubscriptionUpdatedWebhook) => {
  const {p_signature, alert_name, ...paddleData} = paddle;
  const {email, status, subscription_plan_id, update_url, next_bill_date, cancel_url} = paddleData;

  const user = await prisma.user.findUnique({where: {email}})

  const userPayment = await prisma.userPayment.update({
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

  await prisma.userPaymentHistory.create({
    data: {
      userId: userPayment?.userId,
      alert_name: alert_name,
      historyData: paddleData
    }
  })


};

export const subscriptionCanceled = async (paddle: SubscriptionCancelledWebhook) => {
  const {p_signature, alert_name, ...paddleData} = paddle;
  const {email, cancellation_effective_date, status} = paddleData;

  const user = await prisma.user.findUnique({where: {email}})

  const userPayment = await prisma.userPayment.update({
    where: {
      userId: user?.id
    },
    data: {
      subscriptionStatus: status,
      subscriptionEndDate: new Date(cancellation_effective_date),
    },
  });

  await prisma.userPaymentHistory.create({
    data: {
      userId: userPayment?.userId,
      alert_name: alert_name,
      historyData: paddleData
    }
  })


};

export const subscriptionPaymentSucceeded = async (paddle: SubscriptionPaymentSucceededWebhook) => {
  const {p_signature, alert_name, ...paddleData} = paddle;
  const {status, subscription_plan_id, next_bill_date, email, subscription_id} = paddleData;

  const user = await prisma.user.findUnique({where: {email}})

  const userPayment = await prisma.userPayment.upsert({
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

  await prisma.userPaymentHistory.create({
    data: {
      userId: userPayment?.userId,
      alert_name: alert_name,
      historyData: paddleData
    }
  })
};


export const subscriptionPaymentFailed = async (paddle: SubscriptionPaymentFailedWebhook) => {
  const {p_signature, alert_name, ...paddleData} = paddle;
  const {email, next_retry_date} = paddleData;

  const user = await prisma.user.findUnique({where: {email}})

  const userPayment = await prisma.userPayment.update({
    where: {
      userId: user?.id
    },
    data: {
      subscriptionEndDate: new Date(next_retry_date),
    },
  });
  await prisma.userPaymentHistory.create({
    data: {
      userId: userPayment?.userId,
      alert_name: alert_name,
      historyData: paddleData
    }
  })
};

export const subscriptionPaymentRefunded = async (paddle: SubscriptionPaymentRefundedWebhook) => {
  const {p_signature, alert_name, ...paddleData} = paddle;
  const {email} = paddleData;
  const user = await prisma.user.findUnique({where: {email}})

  if (user) {
    await prisma.userPaymentHistory.create({
      data: {
        userId: user?.id,
        alert_name: alert_name,
        historyData: paddleData
      }
    })

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


