import { Group } from '@mantine/core';
import { ColorSwitch } from '~/components/Navbar/ColorSwitch';
import { NavbarLinks } from '~/components/Navbar/NavbarLinks';
import { NavbarMenu } from '~/components/Navbar/NavbarMenu';

export const Navbar = () => {
	return (
		<Group
			my={12}
			position={'apart'}
		>
			<NavbarLinks />
			<Group spacing={6}>
				{/*<Notifications/>*/}
				{/*<SpotlightWrapper />*/}
				<ColorSwitch />
				<NavbarMenu />
			</Group>
		</Group>
	);
};
