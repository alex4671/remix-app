import type {ActionArgs, LoaderArgs, MetaFunction} from "@remix-run/node";
import {json} from "@remix-run/node";
import {ManageSubscriptionSettings} from "~/components/Settings/Pro/ManageSubscriptionSettings";
import {useLoaderData} from "@remix-run/react";
import {SubscribeToPro} from "~/components/Settings/Pro/SubscribeToPro";
import {getUserPaymentData} from "~/models/user.server";
import {paddle} from "~/server/paddle.server";
import type {User} from "@invertase/node-paddle-sdk/src/types";
import dayjs from "dayjs";
import {PaymentTransactions} from "~/components/Settings/Pro/PaymentTransactions";


export const meta: MetaFunction = () => {
  return {
    title: "Settings | Pro"
  };
};

type UserSubscriptionResponse = Partial<Pick<User, "cancel_url" | "update_url" | "state" | "next_payment" | "plan_id">>

export const loader = async ({request}: LoaderArgs) => {
  const user = await getUserPaymentData(request)

  if (user?.payment) {
    const isSubscriptionActive = dayjs().isBefore(dayjs(user.payment.subscriptionEndDate))

    const userSubscription = await paddle.listUsers({subscription_id: Number(user?.payment?.subscriptionId)})
    console.log("userSubscription", userSubscription[0])
    const {cancel_url, update_url, state, next_payment, plan_id} = userSubscription[0]

    const userSubscriptionResponse: UserSubscriptionResponse = {cancel_url, update_url, state, next_payment, plan_id}

    const subscriptionId = user.payment.subscriptionId

    // todo add pagination
    const transactions = await paddle.listTransactions({entity: "subscription", entity_id: subscriptionId})


    return json({payment: user?.payment, userSubscription: userSubscriptionResponse, isSubscriptionActive, transactions})
  }

  return json({
    payment: user?.payment,
    userSubscription: {} as UserSubscriptionResponse,
    isSubscriptionActive: false,
    transactions: []
  })

}

export const action = async ({request}: ActionArgs) => {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "updatePlan") {
    const planId = formData.get("planId");
    try {
      const user = await getUserPaymentData(request)
      await paddle.updateUser({subscription_id: Number(user?.payment?.subscriptionId), plan_id: Number(planId)})
      return json({success: true, intent})

    } catch (e) {
      return json({success: false, intent})
    }
  }

  return json({success: false, intent})
};


export default function Pro() {
  const {isSubscriptionActive, userSubscription} = useLoaderData<typeof loader>()

  return (
    <>
      {isSubscriptionActive ? <ManageSubscriptionSettings/> : <SubscribeToPro/>}
      <PaymentTransactions/>
    </>
  )
}
