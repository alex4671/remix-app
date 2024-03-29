import {
	Avatar,
	createStyles,
	Group,
	Indicator,
	Menu,
	Text,
	UnstyledButton,
} from '@mantine/core';
import { Link, useSubmit } from '@remix-run/react';
import {
	IconChevronDown,
	IconLogout,
	IconPlayerPause,
	IconSettings,
	IconSwitchHorizontal,
	IconTrash,
} from '@tabler/icons-react';
import { useState } from 'react';
import { isNowBeforeDate, useUser } from '~/utils/utils';

const useStyles = createStyles((theme) => ({
	user: {
		color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.black,
		padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
		transition: 'background-color 100ms ease',

		'&:hover': {
			backgroundColor:
				theme.colorScheme === 'dark'
					? theme.colors.dark[6]
					: theme.colors.gray[1],
		},
	},

	userActive: {
		backgroundColor:
			theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.white,
	},

	userEmail: {
		[theme.fn.smallerThan('sm')]: {
			display: 'none',
		},
	},
}));

export const NavbarMenu = () => {
	const user = useUser();
	const submit = useSubmit();
	const { classes, cx } = useStyles();
	const [userMenuOpened, setUserMenuOpened] = useState(false);

	const handleLogout = () => {
		submit(null, { method: 'post', action: '/logout' });
	};

	// @ts-ignore
	const isPro = isNowBeforeDate(user?.payment?.subscriptionEndDate);

	return (
		<Menu
			width={260}
			position="bottom-end"
			transition="pop-top-right"
			onClose={() => setUserMenuOpened(false)}
			onOpen={() => setUserMenuOpened(true)}
			closeOnClickOutside
		>
			<Menu.Target>
				<UnstyledButton
					className={cx(classes.user, { [classes.userActive]: userMenuOpened })}
				>
					<Group spacing={7}>
						<Indicator
							size={8}
							offset={1}
							color="grape"
							disabled={!isPro}
						>
							<Avatar
								src={user.avatarUrl}
								alt={user.email}
								radius="xl"
								size={24}
							/>
						</Indicator>
						<Text
							weight={500}
							size="md"
							mr={3}
							className={classes.userEmail}
						>
							{user.email}
						</Text>
						<IconChevronDown
							size={12}
							stroke={1.5}
						/>
					</Group>
				</UnstyledButton>
			</Menu.Target>
			<Menu.Dropdown>
				<Menu.Label>
					<Text size={'lg'}>{user.email}</Text>
				</Menu.Label>

				<Menu.Label>Settings</Menu.Label>
				<Menu.Item
					component={Link}
					to={'/settings/account'}
					icon={
						<IconSettings
							size={14}
							stroke={1.5}
						/>
					}
				>
					Account settings
				</Menu.Item>
				<Menu.Item
					icon={
						<IconSwitchHorizontal
							size={14}
							stroke={1.5}
						/>
					}
					disabled
				>
					Change account
				</Menu.Item>

				<Menu.Divider />

				<Menu.Label>Danger zone</Menu.Label>
				<Menu.Item
					component={Link}
					to={'/settings/pro'}
					icon={
						<IconPlayerPause
							size={14}
							stroke={1.5}
						/>
					}
				>
					Manage subscription
				</Menu.Item>
				<Menu.Item
					component={Link}
					to={'/settings/danger'}
					color="red"
					icon={
						<IconTrash
							size={14}
							stroke={1.5}
						/>
					}
				>
					Delete account
				</Menu.Item>
				<Menu.Item
					icon={
						<IconLogout
							size={14}
							stroke={1.5}
						/>
					}
					onClick={handleLogout}
				>
					Logout
				</Menu.Item>
			</Menu.Dropdown>
		</Menu>
	);
};
