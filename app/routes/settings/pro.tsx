import type {ActionArgs, LoaderArgs, MetaFunction} from "@remix-run/node";
import {json} from "@remix-run/node";
import {requireUser} from "~/server/session.server";
import {ManageSubscriptionSettings} from "~/components/Settings/Pro/ManageSubscriptionSettings";
import {useLoaderData} from "@remix-run/react";
import {SubscribeToPro} from "~/components/Settings/Pro/SubscribeToPro";
import {getUserPaymentData} from "~/models/user.server";
import {paddle} from "~/server/paddle.server";
import type {User} from "@invertase/node-paddle-sdk/src/types";
import dayjs from "dayjs";


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

    return json({payment: user?.payment, userSubscription: userSubscriptionResponse, isSubscriptionActive})
  }

  return json({
    payment: user?.payment,
    userSubscription: {} as UserSubscriptionResponse,
    isSubscriptionActive: false
  })

}

export const action = async ({request}: ActionArgs) => {
  const formData = await request.formData();
  const intent = formData.get("intent");


  return json({success: false, intent: null})
};


export default function Pro() {
  const {isSubscriptionActive, userSubscription} = useLoaderData<typeof loader>()


  return (
    <>
      {isSubscriptionActive ? <ManageSubscriptionSettings/> : <SubscribeToPro/>}
      Transactions...
    </>
  )
}
