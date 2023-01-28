import {
	Affix,
	Group,
	Popover,
	Select,
	Text,
	Textarea,
	useMantineTheme,
} from '@mantine/core';
import { useFetcher } from '@remix-run/react';
import { IconMessage } from '@tabler/icons-react';
import type { ChangeEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import { PrimaryButton } from '~/components/Buttons/PrimaryButton';
import { SecondaryButton } from '~/components/Buttons/SecondaryButton';
import { DesktopOnly } from '~/components/Utils/DesktopOnly';
import type { action } from '~/routes/settings';

export const Feedback = () => {
	const theme = useMantineTheme();
	const fetcher = useFetcher<typeof action>();
	const formRef = useRef<HTMLFormElement>(null);

	const [opened, setOpened] = useState<boolean>(false);
	const [isDisabled, setIsDisabled] = useState<boolean>(true);

	useEffect(() => {
		if (fetcher?.data?.success) {
			formRef?.current?.reset();
			setIsDisabled(true);
			setOpened(false);
		}
	}, [fetcher.data]);

	const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
		setIsDisabled(!e.target.value);
	};

	return (
		<DesktopOnly>
			<Popover
				width={400}
				withArrow
				shadow="md"
				trapFocus
				opened={opened}
				onChange={setOpened}
			>
				<Popover.Target>
					<Affix
						zIndex={2}
						position={{ bottom: 20, right: 20 }}
						onClick={() => setOpened((o) => !o)}
					>
						<SecondaryButton
							leftIcon={<IconMessage size={16} />}
							// styles={{
							// 	root: {
							// 		backgroundColor: '#fff',
							// 		...theme.fn.hover({ backgroundColor: theme.colors.gray[3] }),
							// 	},
							// }}
						>
							Feedback
						</SecondaryButton>
					</Affix>
				</Popover.Target>
				<Popover.Dropdown>
					<Text
						size={'lg'}
						mb={'lg'}
					>
						Send feedback
					</Text>
					<fetcher.Form method={'post'}>
						<Select
							placeholder="Pick one"
							defaultValue={'feature'}
							name={'type'}
							label={'Type'}
							data={[
								{ value: 'feature', label: 'Feature request' },
								{ value: 'bug', label: 'Bug' },
								{ value: 'other', label: 'Other' },
							]}
						/>
						<Textarea
							mt={12}
							autosize
							minRows={4}
							name={'feedback'}
							label={'Feedback'}
							required
							withAsterisk={false}
							onChange={handleTextChange}
							error={!fetcher.data?.success ? fetcher.data?.message : null}
						/>
						<Group
							my={12}
							position={'right'}
						>
							<PrimaryButton
								type={'submit'}
								disabled={isDisabled}
							>
								Send
							</PrimaryButton>
						</Group>
					</fetcher.Form>
				</Popover.Dropdown>
			</Popover>
		</DesktopOnly>
	);
};
