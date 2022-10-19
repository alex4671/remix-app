import {Badge, Box, Group, Paper, Select, Stack, Text, Title, Tooltip} from "@mantine/core";
import {useFetcher, useLoaderData, useNavigate} from "@remix-run/react";
import usePaddle from "~/hooks/usePaddle";
import type {loader} from "~/routes/settings/pro";
import dayjs from "dayjs";
import {useEffect, useState} from "react";
import {LoadingProgress} from "~/components/Utils/LoadingProgress";
import {formatMoney} from "~/utils/utils";
import {IconChevronDown, IconInfoCircle} from "@tabler/icons";
import {SecondaryButton} from "~/components/Buttons/SecondaryButton";
import {PrimaryButton} from "~/components/Buttons/PrimaryButton";
import {DangerButton} from "~/components/Buttons/DangerButtom";

const plans: Record<string, string> = {
  "26607": "daily",
  "26608": "monthly",
  "26609": "yearly"
};

export const ManageSubscriptionSettings = () => {
  const {payment, userSubscription} = useLoaderData<typeof loader>()

  const navigate = useNavigate()
  const fetcher = useFetcher()
  const [selectedPlan, setSelectedPlan] = useState<string | null>(userSubscription.plan_id === 26607 ? "26608" : "26607");


  useEffect(() => {
    if (fetcher.data?.success) {
      setSelectedPlan(selectedPlan === "26607" ? "26608" : "26607")
    }
  }, [fetcher.data])


  const {paddle} = usePaddle({environment: "sandbox", vendor: 3808});

  const handleCancelSubscription = () => {
    paddle.Checkout.open({
      override: userSubscription.cancel_url,
      successCallback: checkoutCancelComplete,
      closeCallback: checkoutClosed
    })
  }

  const handleUpdateSubscription = () => {
    paddle.Checkout.open({
      override: userSubscription.update_url,
      successCallback: checkoutUpdateComplete,
      closeCallback: checkoutClosed
    })
  }

  const checkoutCancelComplete = (data: any) => {
    console.log("data", data);
    console.log("data", data.checkout.completed);

    if (data.checkout.completed) {
      navigate("/payment/unsubscribed", {state: dayjs(payment?.subscriptionEndDate).format("MMMM D, YYYYYY")});
    }
  };

  const checkoutUpdateComplete = (data: any) => {
    console.log("data", data);
    console.log("data", data.checkout.completed);
  };

  const checkoutClosed = (data: any) => {
    console.log("checkoutClosed", data);
  };

  return (
    <>
      <LoadingProgress state={fetcher.state}/>
      <Paper shadow="0" withBorder mb={12}>
        <Box p={"lg"}>
          <Group spacing={6}>
            <Title order={2}>Manage pro settings</Title>
            <Tooltip
              withArrow
              arrowSize={6}
              label={<Text>Next payment {formatMoney(userSubscription?.next_payment?.amount, userSubscription?.next_payment?.currency)} {dayjs(userSubscription?.next_payment?.date).format("MMMM D, YYYY")}</Text>}
              events={{ hover: true, focus: true, touch: true }}
            >
              <Badge color={"emerald"} sx={{cursor: "pointer"}} rightSection={<IconInfoCircle style={{marginTop: "6px"}} size={12}/>}>Pro ({plans[String(userSubscription.plan_id)]})</Badge>
            </Tooltip>
          </Group>
          <Text color={"dimmed"}>Manage current subscription</Text>
          <Box my={12}>
            {userSubscription.state === "deleted" ? (
              <Text>Subscription canceled, but active until <Badge color={"emerald"}>{dayjs(payment?.subscriptionEndDate).format("MMMM D, YYYY")}</Badge></Text>
            ) : (
              <fetcher.Form method={"post"}>
                <Stack align={"start"}>
                  <Select
                    mt={6}
                    value={selectedPlan}
                    onChange={setSelectedPlan}
                    name={"planId"}
                    label="Select plan"
                    data={[
                      {label: "Daily", value: "26607", disabled: userSubscription.plan_id === 26607},
                      {label: "Monthly", value: "26608", disabled: userSubscription.plan_id === 26608},
                      {label: "Yearly", value: "26609", disabled: userSubscription.plan_id === 26609}
                    ]}
                    styles={(theme) => ({
                      item: {
                        borderRadius: 0,
                        '&[data-selected]': {
                          '&, &:hover': {
                            backgroundColor:
                              theme.colorScheme === 'dark' ?  theme.colors.dark[5] : theme.colors.gray[2],
                            color: theme.colorScheme === 'dark' ? theme.white : theme.colors.dark[5],
                          },
                        },
                      },
                    })}
                    rightSection={<IconChevronDown size={14} />}
                  />
                  <SecondaryButton
                    compact
                    type={"submit"}
                    name={"intent"}
                    value={"updatePlan"}
                  >
                    Change plan
                  </SecondaryButton>
                </Stack>
              </fetcher.Form>
            )}
          </Box>
          <Box py={12}>
            {userSubscription.state === "deleted" ? (
              <Text>You can subscribe again when current subscription expires</Text>
            ) : (
              <Group mt={12} position={"apart"}>
                <PrimaryButton
                  onClick={handleUpdateSubscription}
                >
                  Update payment method
                </PrimaryButton>
                <DangerButton
                  onClick={handleCancelSubscription}
                >
                  Cancel subscription
                </DangerButton>
              </Group>
            )}

          </Box>
        </Box>
      </Paper>
    </>
  )
}
