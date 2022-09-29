import usePaddle from "~/hooks/usePaddle";
import {Button, SegmentedControl, Stack, Text} from "@mantine/core";
import type {LoaderArgs} from "@remix-run/node";
import {json} from "@remix-run/node";
import {paddle} from "~/server/paddle.server";
import {useState} from "react";
import {upperFirst} from "@mantine/hooks";
import {useUser} from "~/utils/utils";
import {requireUser} from "~/server/session.server";


const plans: Record<string, string> = {
  "26607": "daily",
  "26608": "monthly",
  "26609": "yearly"
};

const planPrices: Record<string, string> = {
  "26607": "1$/day",
  "26608": "24$/month",
  "26609": "230$/year"
};


export const loader = async ({request}: LoaderArgs) => {
  await requireUser(request)
  // const data = await paddle.listPlans({})
  // const data = await paddle.refundPayment({order_id: "431366-2849694",  reason: "Test refund"})
  const data = await paddle.listTransactions({entity: "subscription", entity_id: 332688})
  // const test = await paddle.updateUser({subscription_id: 336541, pause: false})
  //
  // console.log("test", test)

  // const data = await paddle.getWebhookHistory({})
  // const data = await paddle.listModifiers({subscription_id: "332688"})
  // const data = await paddle.deleteModifier({modifier_id: 344501})

  // const data = await paddle.createOneOffCharge({subscription_id: 332688, charge_name: "Test", amount: 100 })
  // const data = await paddle.updateUser({subscription_id: 332688, pause: false, })

  // const data = await paddle.listUsers({plan_id: 26608})
  // const data = await paddle.createModifier({subscription_id: 332688, modifier_amount: 12, modifier_recurring: true})
  // const data  = await paddleSdk.createSubscriptionModifier({subscriptionId: 332688, amount: -22, isRecurring: true, description: "Test"})
  // console.log("data", await data.json())
  // const test = await data
  return json({data})
}


export default function Pro() {
  // const data = useActionData<typeof action>()


  // const {data} = useLoaderData<typeof loader>()
  const user = useUser()

  const {paddle} = usePaddle({environment: "sandbox", vendor: 3808});
  const [selectedPlan, setSelectedPlan] = useState("26607");


  const checkoutComplete = (data: any) => {
    console.log("data", data);
    console.log("data", data.checkout.completed);

  };

  const checkoutClosed = (data: any) => {
    console.log("checkoutClosed", data);
  };

  const handleBuy = () => {
    paddle.Checkout.open({
      product: Number(selectedPlan),
      email: user.email,
      disableLogout: true,
      successCallback: checkoutComplete,
      closeCallback: checkoutClosed
    })
  }

  return (
    <Stack align="flex-start">
      <Text>Selected plan: <Text component="span" weight={700}>{upperFirst(plans[selectedPlan])}</Text></Text>
      <SegmentedControl
        value={selectedPlan}
        onChange={setSelectedPlan}
        data={[
          {label: "Daily", value: "26607"},
          {label: "Monthly", value: "26608"},
          {label: "Yearly", value: "26609"}
        ]}
      />
      <Button
        variant={"filled"}
        color={"dark"}
        onClick={handleBuy}
      >
        Pay {upperFirst(planPrices[selectedPlan])}
      </Button>
    </Stack>
  )
}
