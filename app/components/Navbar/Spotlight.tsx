import { ActionIcon } from '@mantine/core';
import { useHotkeys } from '@mantine/hooks';
import type { SpotlightAction } from '@mantine/spotlight';
import { registerSpotlightActions, useSpotlight } from '@mantine/spotlight';
import type { NavigateFunction } from '@remix-run/react';
import { useFetcher, useNavigate } from '@remix-run/react';
import { IconCommand } from '@tabler/icons';
import { useEffect, useState } from 'react';

export const spotlightActions = (
	navigate: NavigateFunction,
	setSearchType,
): SpotlightAction[] => {
	return [
		{
			id: 'workspaces',
			group: 'main',
			title: 'Search In Workspaces',
			description: 'Get to workspaces',
			onTrigger: () => setSearchType('workspaces'),
			closeOnTrigger: false,
		},
		{
			id: 'notes',
			group: 'main',
			title: 'Notes',
			description: 'Go to notes',
			onTrigger: () => setSearchType('notes'),
			closeOnTrigger: false,
		},
		{
			id: 'settings',
			group: 'main',
			title: 'Pro',
			description: 'Go to pro',
			onTrigger: () => setSearchType('settings'),
			closeOnTrigger: false,
		},
		// {
		// 	group: 'settings',
		// 	title: 'Workspaces',
		// 	description: 'Get to settings/workspaces',
		// 	onTrigger: () => navigate('/settings/workspaces/my'),
		// },
		// {
		// 	group: 'settings',
		// 	title: 'Settings | Files',
		// 	description: 'Get to settings/files',
		// 	onTrigger: () => navigate('/settings/files'),
		// },
		// {
		// 	group: 'settings',
		// 	title: 'Settings | Account',
		// 	description: 'Get to settings/account',
		// 	onTrigger: () => navigate('/settings/account'),
		// },
		// {
		// 	group: 'settings',
		// 	title: 'Settings | Pro',
		// 	description: 'Get to settings/pro',
		// 	onTrigger: () => navigate('/settings/pro'),
		// },
		// {
		// 	group: 'settings',
		// 	title: 'Settings | Notifications',
		// 	description: 'Get to settings/notifications',
		// 	onTrigger: () => navigate('/settings/notifications'),
		// },
		// {
		// 	group: 'settings',
		// 	title: 'Settings | Danger zone',
		// 	description: 'Get to settings/danger',
		// 	onTrigger: () => navigate('/settings/danger'),
		// },
	];
};

export const Spotlight = () => {
	const spotlight = useSpotlight();
	const navigate = useNavigate();
	const [searchType, setSearchType] = useState('');
	const fetcher = useFetcher();

	const openSpotlight = () => {
		registerSpotlightActions(spotlightActions(navigate, setSearchType));
		spotlight.openSpotlight();
	};

	useEffect(() => {
		switch (searchType) {
			case 'workspaces':
				spotlight.removeActions(['notes', 'settings']);
				fetcher.load('/api/spotlight?search=workspaces');
				break;
			case 'notes':
				spotlight.removeActions(['workspaces', 'settings']);
				fetcher.load('/api/spotlight?search=notes');

				break;
		}
	}, [searchType]);

	useEffect(() => {
		if (fetcher.data) {
			const { search, data } = fetcher.data;
			console.log('search', search);
			console.log('data', data);
			if (search === 'notes') {
				console.log('notes');
				spotlight.registerActions(
					data.map((item) => ({
						id: item.id,
						title: item.name,
						onTrigger: () => navigate(`/notes/${item.id}`),
						closeOnTrigger: true,
					})),
				);
			} else if (search === 'workspaces') {
				console.log(
					'workspaces',
					data.map((item) => ({
						id: item.id,
						title: item.name,
						onTrigger: () => navigate(`/workspaces/${item.id}`),
						closeOnTrigger: true,
					})),
				);
				spotlight.registerActions(
					data.map((item) => ({
						id: item.id,
						title: item.name,
						onTrigger: () => navigate(`/workspaces/${item.id}`),
						closeOnTrigger: true,
					})),
				);
			}
		}
	}, [fetcher.data]);

	useHotkeys([['mod + P', openSpotlight]]);
	return (
		<ActionIcon
			onClick={openSpotlight}
			mr={'xs'}
		>
			<IconCommand size={18} />
		</ActionIcon>
	);
};
