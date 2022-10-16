import dayjs from "dayjs";
import {Anchor, Badge, Paper, ScrollArea, Table, Text} from "@mantine/core";
import {upperFirst} from "@mantine/hooks";
import {useLoaderData} from "@remix-run/react";
import type {loader} from "~/routes/settings/pro";

const plans: Record<string, string> = {
  "26607": "daily",
  "26608": "monthly",
  "26609": "yearly"
};


export const PaymentTransactions = () => {
  const {transactions} = useLoaderData<typeof loader>()

  const rows = transactions?.map((t) => (
    <tr key={t.order_id}>
      <td>{dayjs(t.created_at).format("MMMM D, YY")}</td>
      <td>
        <Badge color={"green"}>{t.status}</Badge>
      </td>
      <td>{t.is_one_off ? "One Off" : upperFirst(plans[t.product_id])}</td>
      <td>{t.amount}/{t.currency}</td>
      <td>
        <Anchor component={"a"} target={"_blank"} href={t.receipt_url}>Receipt</Anchor>
      </td>
    </tr>
  ));


  return transactions.length > 0 ? (
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
          </tr>
          </thead>
          <tbody>{rows}</tbody>
        </Table>
      </ScrollArea>

    </Paper>
  ) : null
}
