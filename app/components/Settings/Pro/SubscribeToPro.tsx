import {Badge, Box, Group, Paper, Select, Stack, Text, Title} from "@mantine/core";
import {upperFirst} from "@mantine/hooks";
import {useState} from "react";
import {useNavigate} from "@remix-run/react";
import usePaddle from "~/hooks/usePaddle";
import {useUser} from "~/utils/utils";
import {PrimaryButton} from "~/components/Buttons/PrimaryButton";
import {IconChevronDown} from "@tabler/icons";

const planPrices: Record<string, string> = {
  "26607": "1$/day",
  "26608": "24$/month",
  "26609": "230$/year"
};

export const SubscribeToPro = () => {


  const user = useUser()
  const navigate = useNavigate()

  const {paddle} = usePaddle({environment: "sandbox", vendor: 3808});
  const [selectedPlan, setSelectedPlan] = useState<string | null>("26607");

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
          <Stack align={"start"}>
            <Select
              mt={6}
              value={selectedPlan}
              onChange={setSelectedPlan}
              name={"planId"}
              label="Selected plan"
              data={[
                {label: "Daily", value: "26607"},
                {label: "Monthly", value: "26608"},
                {label: "Yearly", value: "26609"}
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
          </Stack>

        </Box>
        <Box py={12}>
          <PrimaryButton
            variant={"filled"}
            onClick={handleBuy}
          >
            Pay {upperFirst(planPrices[String(selectedPlan)])}
          </PrimaryButton>
        </Box>
      </Box>

    </Paper>
  )
}
