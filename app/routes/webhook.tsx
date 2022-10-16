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
    try {
      console.log("subscription_created", event.subscription_id);
      await subscriptionCreated(event)
    } catch (e) {
      console.log("error", e)
      console.log("subscription_created_error", event);
    }
  }
  if (event.alert_name === 'subscription_updated') {
    try {
      console.log("subscription_updated", event.subscription_id);
      await subscriptionUpdated(event)
    } catch (e) {
      console.log("error", e)
      console.log("subscription_updated_error", event);
    }
  }
  if (event.alert_name === 'subscription_cancelled') {
    try {
      console.log("subscription_cancelled", event.subscription_id);
      await subscriptionCanceled(event)
    } catch (e) {
      console.log("error", e)
      console.log("subscription_cancelled_error", event);
    }
  }
  if (event.alert_name === 'subscription_payment_succeeded') {
    try {
      console.log("subscription_payment_succeeded", event.subscription_id);
      await subscriptionPaymentSucceeded(event)
    } catch (e) {
      console.log("error", e)
      console.log("subscription_payment_succeeded_error", event);
    }
  }
  if (event.alert_name === 'subscription_payment_failed') {
    try {
      console.log("subscription_payment_failed", event.subscription_id);
      await subscriptionPaymentFailed(event)
    } catch (e) {
      console.log("error", e)
      console.log("subscription_payment_failed_error", event);
    }
  }
  if (event.alert_name === 'subscription_payment_refunded') {
    try {
      console.log("subscription_payment_refunded", event.subscription_id);
      await subscriptionPaymentRefunded(event)
    } catch (e) {
      console.log("error", e)
      console.log("subscription_payment_refunded_error", event);
    }
  }


  return json({success: true}, 200);
};
