import {Box, Paper, Text, Title} from "@mantine/core";
import {PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer} from "recharts";
import {useLoaderData} from "@remix-run/react";
import type {loader} from "~/routes/settings/files";
import {formatBytes} from "~/utils/utils";

export const FilesStorage = () => {
  const {userFilesSize, maxSizeLimit} = useLoaderData<typeof loader>()

  const fileUsagePercent = Math.round((100 / maxSizeLimit) * userFilesSize)

  return (
    <Paper shadow="0" p="md" withBorder mb={24}>
      <Title order={2}>Files</Title>
      <Text mt={6} mb={12}>View storage usage</Text>
      <Box sx={{height: "200px", width: "30%"}}>
        <ResponsiveContainer width="100%" height="100%" >
          <RadialBarChart
            data={[{value: fileUsagePercent, fill: '#82ca9d'}]}
            innerRadius="60%"
            outerRadius="80%"
            // outerRadius={18}
            startAngle={180}
            endAngle={0}
          >
            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              angleAxisId={0}
              tick={false}
            />
            <RadialBar
              background
              dataKey="value"
              // cornerRadius={30 / 2}
              isAnimationActive={false}
            />

          </RadialBarChart>
        </ResponsiveContainer>
        <Box pos={"relative"} bottom={84}>
          <Text size={"lg"} align={"center"} >{`${formatBytes(userFilesSize)} of ${formatBytes(maxSizeLimit)}`}</Text>
        </Box>
      </Box>
    </Paper>
  )
}
