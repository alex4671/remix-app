import { SpotlightProvider } from '@mantine/spotlight';
import { IconSearch } from '@tabler/icons';
import { Spotlight } from '~/components/Navbar/Spotlight';

export const SpotlightWrapper = () => {
	return (
		<SpotlightProvider
			actions={[]}
			searchIcon={<IconSearch size={18} />}
			searchPlaceholder="Search..."
			limit={5}
			nothingFoundMessage="Nothing found..."
			onQueryChange={(val) => console.log('val', val)}
		>
			<Spotlight />
		</SpotlightProvider>
	);
};
