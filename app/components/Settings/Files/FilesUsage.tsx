import { Box, Group, Overlay, Paper, Select, Text, Title } from '@mantine/core';
import { Line, LineChart, ResponsiveContainer, Tooltip } from 'recharts';

const data = [
	{
		name: 'Page A',
		pv: 2400,
	},
	{
		name: 'Page B',
		pv: 1398,
	},
	{
		name: 'Page C',
		pv: 9800,
	},
	{
		name: 'Page D',
		pv: 3908,
	},
	{
		name: 'Page E',
		pv: 4800,
	},
	{
		name: 'Page F',
		pv: 3800,
	},
	{
		name: 'Page G',
		pv: 4300,
	},
];

export const FilesUsage = () => {
	return (
		<Paper
			shadow="0"
			p="md"
			withBorder
			mb={24}
			pos={'relative'}
		>
			<Overlay
				opacity={0.1}
				color="#000"
				zIndex={5}
				blur={1}
			/>
			<Title order={2}>Usage</Title>
			<Text
				mt={6}
				mb={12}
			>
				View storage usage and latest files
			</Text>
			<Group
				position={'right'}
				mt={24}
				mb={36}
			>
				<Select
					defaultValue={'24hours'}
					data={[
						{ value: '30min', label: 'Last 30 minutes' },
						{ value: '6hours', label: 'Last 6 hours' },
						{ value: '12hours', label: 'Last 12 hours' },
						{ value: '24hours', label: 'Last 24 hours' },
						{ value: 'week', label: 'Last week' },
						{ value: 'custom', label: 'Custom range' },
					]}
				/>
			</Group>
			<Box
				sx={{ height: '200px' }}
				py={12}
			>
				<ResponsiveContainer
					width="100%"
					height="100%"
				>
					<LineChart
						data={data}
						margin={{
							top: 5,
							right: 30,
							left: 20,
							bottom: 5,
						}}
					>
						{/*<XAxis dataKey="name" />*/}
						{/*<YAxis />*/}
						<Tooltip cursor={false} />
						<Line
							type="monotone"
							isAnimationActive={false}
							dataKey="pv"
							stroke="#8884d8"
							activeDot={{ r: 8 }}
						/>
					</LineChart>
				</ResponsiveContainer>
			</Box>
		</Paper>
	);
};
