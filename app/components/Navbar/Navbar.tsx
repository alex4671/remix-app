import { Group } from '@mantine/core';
import { ColorSwitch } from '~/components/Navbar/ColorSwitch';
import { NavbarLinks } from '~/components/Navbar/NavbarLinks';
import { NavbarMenu } from '~/components/Navbar/NavbarMenu';

export const Navbar = () => {
	// let state = useGlobalPendingState();
	return (
		<Group
			my={12}
			position={'apart'}
		>
			<NavbarLinks />
			<Group spacing={6}>
				{/*<Notifications/>*/}
				{/*<SpotlightWrapper />*/}
				{/*<SpotlightWrapper />*/}
				{/*{state !== 'idle' ? (*/}
				{/*	<Loader*/}
				{/*		color="dark"*/}
				{/*		size="sm"*/}
				{/*		mr={'sm'}*/}
				{/*	/>*/}
				{/*) : null}*/}
				<ColorSwitch />
				<NavbarMenu />
			</Group>
		</Group>
	);
};
