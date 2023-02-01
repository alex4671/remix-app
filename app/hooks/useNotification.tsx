import { showNotification } from '@mantine/notifications';
import { useFetchers } from '@remix-run/react';
import { IconCheck, IconX } from '@tabler/icons-react';

export const useNotification = () => {
	const fetchers = useFetchers();
	const activeData = fetchers.find((f) => f.state === 'loading')?.data;

	if (activeData?.intent) {
		showNotification({
			title: activeData?.message,
			message: undefined,
			color: activeData?.success ? 'green' : 'red',
			autoClose: 2000,
			icon: activeData?.success ? <IconCheck /> : <IconX />,
		});
	}

	return null;
};
