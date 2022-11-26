import { MediaQuery } from '@mantine/core';

export const DesktopOnly = ({ children }: { children: JSX.Element }) => {
	return (
		<MediaQuery
			smallerThan="sm"
			styles={{ display: 'none' }}
		>
			{children}
		</MediaQuery>
	);
};
