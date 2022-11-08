import {Box, Paper, Text, Title} from "@mantine/core";
import {PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer} from "recharts";
import {useState} from "react";
import {useLoaderData} from "@remix-run/react";
import type {loader} from "~/routes/settings/files";
import {formatBytes} from "~/utils/utils";

export const FilesStorage = () => {
  const {userFiles, userFilesSize, maxSizeLimit} = useLoaderData<typeof loader>()

  // const fileUsagePercent = Math.round((100 / maxSizeLimit) * userFilesSize)
  const fileUsagePercent = 34

  return (
    <Paper shadow="0" p="md" withBorder mb={24}>
      <Title order={2}>Files</Title>
      <Text mt={6} mb={12}>View storage usage</Text>
      {`${formatBytes(userFilesSize)} of ${formatBytes(maxSizeLimit)}`}
      <Box sx={{border: "1px solid red", height: "200px", width: "30%"}}>
        <ResponsiveContainer width="100%" height="100%" >
          <RadialBarChart
            data={[{value: fileUsagePercent, fill: '#82ca9d'}]}
            innerRadius="60%"
            outerRadius="80%"
            // outerRadius={18}
            startAngle={180}
            endAngle={0}
          >
            {/*<text*/}
            {/*  fontSize={22}*/}
            {/*  fill={"#82ca9d"}*/}
            {/*  textAnchor="middle"*/}
            {/*  dominantBaseline="middle"*/}
            {/*>*/}
            {/*  24 GB*/}
            {/*</text>*/}
            {/*<text*/}
            {/*  fontSize={14}*/}
            {/*  fill={"gray"}*/}
            {/*  textAnchor="middle"*/}
            {/*  dominantBaseline="middle"*/}
            {/*>*/}
            {/*  Used of 100GB*/}
            {/*</text>*/}
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
      </Box>
    </Paper>
  )
}
