import type {ActionArgs} from "@remix-run/node";
import {json} from "@remix-run/node";
import {paddle} from "~/server/paddle.server";
import type {PaddleWebhook} from "@invertase/node-paddle-sdk";
import {
  subscriptionCanceled,
  subscriptionCreated, subscriptionPaymentFailed, subscriptionPaymentRefunded,
  subscriptionPaymentSucceeded,
  subscriptionUpdated
} from "~/models/payment.server";

export const action = async ({request}: ActionArgs) => {
  const text = await request.text();
  const urlParams = new URLSearchParams(text);
  const payload = Object.fromEntries(urlParams)

  const verified = paddle.verifyWebhook(payload);

  if (!verified) {
    return json({error: "Invalid webhook request."}, 403)
  }

  const event = payload as PaddleWebhook;
  if (event.alert_name === 'subscription_created') {
    console.log("subscription_created", event.subscription_id);
    await subscriptionCreated(event)
  }
  if (event.alert_name === 'subscription_updated') {
    console.log("subscription_updated", event.subscription_id);
    await subscriptionUpdated(event)
  }
  if (event.alert_name === 'subscription_cancelled') {
    console.log("subscription_cancelled", event.subscription_id);
    await subscriptionCanceled(event)
  }
  if (event.alert_name === 'subscription_payment_succeeded') {
    console.log("subscription_payment_succeeded", event.subscription_id);
    await subscriptionPaymentSucceeded(event)
  }
  if (event.alert_name === 'subscription_payment_failed') {
    console.log("subscription_payment_failed", event.subscription_id);
    await subscriptionPaymentFailed(event)
  }
  if (event.alert_name === 'subscription_payment_refunded') {
    console.log("subscription_payment_refunded", event.subscription_id);
    await subscriptionPaymentRefunded(event)
  }


  return json({success: true}, 200);
};
