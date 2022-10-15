import {Badge, Box, Button, Group, Paper, SegmentedControl, Text, Title} from "@mantine/core";
import {upperFirst} from "@mantine/hooks";
import {useState} from "react";
import {useNavigate} from "@remix-run/react";
import usePaddle from "~/hooks/usePaddle";
import {useUser} from "~/utils/utils";

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

export const SubscribeToPro = () => {


  const user = useUser()
  const navigate = useNavigate()

  const {paddle} = usePaddle({environment: "sandbox", vendor: 3808});
  const [selectedPlan, setSelectedPlan] = useState("26607");

  const checkoutComplete = (data: any) => {
    console.log("data", data);
    console.log("data", data.checkout.completed);

    if (data.checkout.completed) {
      navigate("/payment/subscribed");
    }
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
    <Paper shadow="0" withBorder mb={12}>
      <Box p={"lg"}>
        <Group>
          <Title order={2}>Subscribe to pro</Title>
          <Badge color={"gray"}>Free</Badge>
        </Group>
        <Text color={"dimmed"}>Get access to all premium features</Text>
        <Box my={12}>
          <Text>Selected plan: <Text component="span" weight={700}>{upperFirst(plans[selectedPlan])}</Text></Text>
          <SegmentedControl
            mt={6}
            value={selectedPlan}
            onChange={setSelectedPlan}
            data={[
              {label: "Daily", value: "26607"},
              {label: "Monthly", value: "26608"},
              {label: "Yearly", value: "26609"}
            ]}
          />
        </Box>
        <Box py={12}>
          <Button
            variant={"filled"}
            color={"emerald"}
            onClick={handleBuy}
          >
            Pay {upperFirst(planPrices[selectedPlan])}
          </Button>
        </Box>
      </Box>

    </Paper>
  )
}
