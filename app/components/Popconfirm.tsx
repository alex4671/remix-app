import { Button, Group, Popover, Text } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { useState } from 'react';

interface Props {
	label?: string;
}

export const Popconfirm = ({ label = 'Are you sure?' }: Props) => {
	const [opened, setOpened] = useState(false);
	return (
		<Popover
			width={200}
			position="top"
			withArrow
			opened={opened}
			onChange={setOpened}
		>
			<Popover.Target>
				<Button onClick={() => setOpened((o) => !o)}>Toggle popover</Button>
			</Popover.Target>
			<Popover.Dropdown>
				<Group
					spacing={'xs'}
					mb={'xl'}
					align={'baseline'}
				>
					<IconInfoCircle size={14} />
					<Text>{label}</Text>
				</Group>
				<Group
					position={'right'}
					spacing={'xs'}
				>
					<Button
						compact
						variant={'outline'}
						color={'dark'}
						onClick={() => setOpened(false)}
					>
						No
					</Button>
					<Button
						compact
						color={'emerald'}
						onClick={() => console.log('yes')}
					>
						Yes
					</Button>
				</Group>
			</Popover.Dropdown>
		</Popover>
	);
};
