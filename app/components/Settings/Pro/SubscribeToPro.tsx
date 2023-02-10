import {
	Badge,
	Box,
	Group,
	Paper,
	Select,
	Stack,
	Text,
	Title,
} from '@mantine/core';
import { upperFirst } from '@mantine/hooks';
import { useFetcher, useNavigate } from '@remix-run/react';
import { IconChevronDown } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { PrimaryButton } from '~/components/Buttons/PrimaryButton';
import usePaddle from '~/hooks/usePaddle';

const planPrices: Record<string, string> = {
	'26607': '1$/day',
	'26608': '24$/month',
	'26609': '230$/year',
};

export const SubscribeToPro = () => {
	const navigate = useNavigate();
	const fetcher = useFetcher();

	useEffect(() => {
		if (fetcher.data) {
			paddle.Checkout.open({
				override: fetcher.data?.payLink?.url,
				disableLogout: true,
				successCallback: checkoutComplete,
				closeCallback: checkoutClosed,
			});
		}
	}, [fetcher.data]);

	const { paddle } = usePaddle({ environment: 'sandbox', vendor: 3808 });
	const [selectedPlan, setSelectedPlan] = useState<string | null>('26607');

	const checkoutComplete = (data: any) => {
		console.log('data', data);
		console.log('data', data.checkout.completed);

		if (data.checkout.completed) {
			navigate('/payment/subscribed');
		}
	};

	const checkoutClosed = (data: any) => {
		console.log('checkoutClosed', data);
	};

	return (
		<Paper
			shadow="0"
			withBorder
			mb={12}
		>
			<Box p={'lg'}>
				<Group>
					<Title order={2}>Subscribe to pro</Title>
					<Badge color={'gray'}>Basic</Badge>
				</Group>
				<Text color={'dimmed'}>Get access to all premium features</Text>
				<Box my={12}>
					<Stack align={'start'}>
						<Select
							mt={6}
							value={selectedPlan}
							onChange={setSelectedPlan}
							name={'planId'}
							label="Selected plan"
							data={[
								{ label: 'Daily', value: '26607' },
								{ label: 'Monthly', value: '26608' },
								{ label: 'Yearly', value: '26609' },
							]}
							// styles={(theme) => ({
							// 	item: {
							// 		borderRadius: 0,
							// 		'&[data-selected]': {
							// 			'&, &:hover': {
							// 				backgroundColor:
							// 					theme.colorScheme === 'dark'
							// 						? theme.colors.dark[5]
							// 						: theme.colors.gray[2],
							// 				color:
							// 					theme.colorScheme === 'dark'
							// 						? theme.white
							// 						: theme.colors.dark[5],
							// 			},
							// 		},
							// 	},
							// })}
							rightSection={<IconChevronDown size={14} />}
						/>
					</Stack>
				</Box>
				<Box py={12}>
					<fetcher.Form method={'post'}>
						<input
							type="hidden"
							name={'planId'}
							value={selectedPlan!}
						/>
						<PrimaryButton
							type={'submit'}
							name={'intent'}
							value={'generatePayLink'}
						>
							Pay {upperFirst(planPrices[String(selectedPlan)])}
						</PrimaryButton>
					</fetcher.Form>
				</Box>
			</Box>
		</Paper>
	);
};
