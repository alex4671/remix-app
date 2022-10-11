import usePaddle from "~/hooks/usePaddle";
import {
  Anchor,
  Badge,
  Button,
  Checkbox,
  Group,
  NumberInput,
  Paper,
  Radio,
  ScrollArea,
  SegmentedControl,
  Stack,
  Table,
  Text,
  TextInput
} from "@mantine/core";
import type {ActionArgs, LoaderArgs, MetaFunction} from "@remix-run/node";
import {json} from "@remix-run/node";
import {paddle} from "~/server/paddle.server";
import {useState} from "react";
import {upperFirst} from "@mantine/hooks";
import {useUser} from "~/utils/utils";
import {requireUser} from "~/server/session.server";
import {useActionData, useFetcher, useLoaderData} from "@remix-run/react";
import {IconCurrencyDollar} from "@tabler/icons";
import dayjs from "dayjs";
import {LoadingProgress} from "~/components/Utils/LoadingProgress";


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

export const meta: MetaFunction = () => {
  return {
    title: "Settings | Pro"
  };
};


export const loader = async ({request}: LoaderArgs) => {
  await requireUser(request)
  // const data = await paddle.listPlans({})
  // const data = await paddle.refundPayment({order_id: "431366-2849694",  reason: "Test refund"})
  const transactions = await paddle.listTransactions({entity: "subscription", entity_id: 332688})
  // const test = await paddle.updateUser({subscription_id: 336541, pause: false})
  //
  // console.log("test", test)
  // const data = await paddle.getWebhookHistory({})
  const modifiers = await paddle.listModifiers({subscription_id: "332688"})
  // const data = await paddle.deleteModifier({modifier_id: 344501})

  // const data = await paddle.createOneOffCharge({subscription_id: 332688, charge_name: "Test", amount: 100 })
  // const data = await paddle.updateUser({subscription_id: 332688, pause: false, })

  const userSubscription = await paddle.listUsers({subscription_id: 332688})
  // const data = await paddle.createModifier({subscription_id: 332688, modifier_amount: 12, modifier_recurring: true})
  // const data  = await paddleSdk.createSubscriptionModifier({subscriptionId: 332688, amount: -22, isRecurring: true, description: "Test"})
  // console.log("data", await data.json())
  // const test = await data
  return json({transactions, modifiers, userSubscription})
}

export const action = async ({request}: ActionArgs) => {
  const formData = await request.formData();
  const intent = formData.get("intent");


  console.log("intent", intent)

  if (intent === "payExtra") {
    const extraAmount = formData.get("extraAmount");
    try {
      const data = await paddle.createOneOffCharge({
        subscription_id: 332688,
        charge_name: "Test",
        amount: Number(extraAmount)
      })
      if (data.status === "success") {
        return json({success: true, intent})
      }
    } catch (e) {
      console.log("error", e)
      return json({success: false, intent})
    }

  }
  if (intent === "pause") {

    try {
      const userSubscription = await paddle.listUsers({subscription_id: 332688})
      // @ts-ignore
      await paddle.updateUser({subscription_id: 332688, pause: !userSubscription[0].paused_at})
      return json({success: true, intent})

    } catch (e) {
      return json({success: false, intent})
    }
  }
  if (intent === "refund") {
    const orderId = formData.get("orderId");

    try {
      await paddle.refundPayment({order_id: String(orderId)})

      return json({success: true, intent})

    } catch (e) {
      return json({success: false, intent})
    }
  }

  if (intent === "removeModifier") {
    const modifierId = formData.get("modifierId");

    try {
      await paddle.deleteModifier({modifier_id: Number(modifierId)})

      return json({success: true, intent})

    } catch (e) {
      return json({success: false, intent})
    }
  }

  if (intent === "addModifier") {
    const modifierType = formData.get("modifierType");
    const modifierAmount = formData.get("modifierAmount");
    const modifierDescription = formData.get("modifierDescription");
    const modifierRecurring = formData.get("modifierRecurring");


    const amount = modifierType === "remove" ? `-${modifierAmount}` : modifierAmount

    try {
      await paddle.createModifier({
        modifier_amount: Number(amount),
        modifier_description: String(modifierDescription),
        subscription_id: 332688,
        modifier_recurring: Boolean(modifierRecurring)
      })

      return json({success: true, intent})

    } catch (e) {
      return json({success: false, intent})
    }
  }


  return json({success: false, intent: null})
};


export default function Pro() {
  const data = useActionData<typeof action>()

  const fetcher = useFetcher()

  // if (data?.intent === "removeModifier") {
  //   showNotification({
  //     title: 'Default notification',
  //     message: 'Hey there, your code is awesome! 🤥',
  //   })
  // }

  const {transactions, modifiers, userSubscription} = useLoaderData<typeof loader>()
  const user = useUser()

  const {paddle} = usePaddle({environment: "sandbox", vendor: 3808});
  const [selectedPlan, setSelectedPlan] = useState("26607");
  const [extra, setExtra] = useState(0);

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

  const handleCancelSubscription = () => {
    paddle.Checkout.open({
      override: userSubscription[0].cancel_url,
      successCallback: checkoutComplete,
      closeCallback: checkoutClosed
    })
  }

  const handleUpdateSubscription = () => {
    paddle.Checkout.open({
      override: userSubscription[0].update_url,
      successCallback: checkoutComplete,
      closeCallback: checkoutClosed
    })
  }


  const isPaused = !!userSubscription[0].paused_at
  console.log("userSubscription", userSubscription)

  const priceWithModifiers = modifiers.reduce((acc, item) => acc + parseInt(item.amount), 0)



  const rows = transactions.map((t) => (
    <tr key={t.order_id}>
      <td>{dayjs(t.created_at).format("MMM D, YY H:mm")}</td>
      <td>
        <Badge color={"green"}>{t.status}</Badge>
      </td>
      <td>{t.is_one_off ? "One Off" : upperFirst(plans[t.product_id])}</td>
      <td>{t.amount}/{t.currency}</td>
      <td>
        <Anchor component={"a"} target={"_blank"} href={t.receipt_url}>Receipt</Anchor>
      </td>
      <td>
        <fetcher.Form method={"post"}>
          <input type="hidden" name="orderId" value={t.order_id}/>
          <Button
            compact
            size={"xs"}
            type={"submit"}
            name={"intent"}
            value={"refund"}
            // @ts-ignore
            disabled={t.status === "refunded"}
          >
            Refund
          </Button>
        </fetcher.Form>
      </td>
    </tr>
  ));


  const modifiersRow = modifiers.map((m) => (
    <tr key={m.modifier_id}>
      <td>{parseInt(m.amount)}/{m.currency}</td>
      <td>
        <Badge color={"green"}>{m.is_recurring ? "Yes" : "No"}</Badge>
      </td>
      <td>{m.description}</td>
      <td>
        <fetcher.Form method={"post"}>
          <input type="hidden" name="modifierId" value={m.modifier_id}/>
          <Button
            color={"red"}
            compact
            size={"xs"}
            type={"submit"}
            name={"intent"}
            value={"removeModifier"}
          >
            Remove
          </Button>
        </fetcher.Form>
      </td>
    </tr>
  ));


  return (
    <>
      <LoadingProgress state={fetcher.state}/>
      <Paper shadow="0" p="md" mb={6} withBorder>
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
      </Paper>
      <Paper shadow="0" p="md" my={6} withBorder>
        <Text>Next payment: {isPaused ? "Paused" : dayjs(userSubscription?.[0]?.next_payment?.date).format("MMM, D")}. {userSubscription?.[0]?.next_payment?.amount ?? 0}$</Text>
        <fetcher.Form method={"post"}>
          <Group mt={12}>
            <Button
              color={"emerald"}
              onClick={handleUpdateSubscription}
            >
              Update subscription
            </Button>
            <Button
              color={isPaused ? "green" : "red"}
              type={"submit"}
              name={"intent"}
              value={"pause"}
            >
              {isPaused ? "Resume subscription" : "Pause subscription"}
            </Button>
            <Button
              color={"red"}
              onClick={handleCancelSubscription}
            >
              Cancel subscription
            </Button>
          </Group>
        </fetcher.Form>
      </Paper>
      <Paper shadow="0" p="md" my={6} withBorder>
        <fetcher.Form method={"post"}>
          <Stack align="flex-start">
            <Text>Pay extra</Text>
            <NumberInput
              value={extra}
              onChange={(val) => setExtra(val ?? 0)}
              placeholder={"Amount"}
              defaultValue={100}
              parser={(value) => value?.replace(/\$\s?|(,*)/g, '')}
              name={"extraAmount"}
              max={1200}
              min={0}
              hideControls
              icon={<IconCurrencyDollar size={18}/>}
            />
            <Button
              variant={"filled"}
              color={"dark"}
              type={"submit"}
              name={"intent"}
              value={"payExtra"}
            >
              Pay
            </Button>


          </Stack>
        </fetcher.Form>
      </Paper>
      <Paper shadow="0" p="md" my={6} withBorder>
        <Text>Add modifiers</Text>
        <fetcher.Form method={"post"}>
          <Stack my={12} align="flex-start">
            <Radio.Group
              name="modifierType"
              defaultValue={"add"}
            >
              <Radio value="add" label="Add"/>
              <Radio value="remove" label="Remove"/>
            </Radio.Group>
            <NumberInput
              placeholder={"Amount"}
              parser={(value) => value?.replace(/\$\s?|(,*)/g, '')}
              name={"modifierAmount"}
              max={1200}
              min={0}
              hideControls
            />
            <TextInput
              name={"modifierDescription"}
              placeholder={"Description"}></TextInput>
            <Checkbox
              label="Is recurring"
              name={"modifierRecurring"}
              defaultChecked
            />
            <Button
              type={"submit"}
              name={"intent"}
              value={"addModifier"}
            >
              Submit
            </Button>
          </Stack>
        </fetcher.Form>
      </Paper>
      <Paper shadow="0" p="md" my={6} withBorder>
        <Text>Modifiers</Text>
        <ScrollArea>
          <Table sx={{minWidth: 600}}>
            <thead>
            <tr>
              <th>Currency/Amount</th>
              <th>Is recurring</th>
              <th>Description</th>
              <th>Remove</th>
            </tr>
            </thead>
            <tbody>{modifiersRow}</tbody>
            <tfoot>
            <tr>
              <th>{priceWithModifiers}</th>
              <th></th>
              <th></th>
              <th></th>
            </tr>
            </tfoot>
          </Table>
        </ScrollArea>
      </Paper>
      <Paper shadow="0" p="md" my={6} withBorder>

        <Text>Transactions</Text>
        <ScrollArea>
          <Table sx={{minWidth: 600}}>
            <thead>
            <tr>
              <th>Date</th>
              <th>Status</th>
              <th>Plan</th>
              <th>Currency/Amount</th>
              <th>Receipt URL</th>
              <th>Refund</th>
            </tr>
            </thead>
            <tbody>{rows}</tbody>
          </Table>
        </ScrollArea>

      </Paper>
    </>
  )
}
