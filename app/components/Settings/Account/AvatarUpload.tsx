import {
	Avatar,
	Box,
	FileButton,
	Group,
	Paper,
	Text,
	Title,
} from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { useActionData, useFetcher } from '@remix-run/react';
import { IconExclamationMark, IconUpload } from '@tabler/icons';
import { useEffect, useRef, useState } from 'react';
import { DangerButton } from '~/components/Buttons/DangerButtom';
import { PrimaryButton } from '~/components/Buttons/PrimaryButton';
import { SecondaryButton } from '~/components/Buttons/SecondaryButton';
import { InfoTooltip } from '~/components/Utils/InfoTooltip';
import type { action } from '~/routes/settings/account';
import { useUser } from '~/utils/utils';

const UPLOAD_SIZE_LIMIT = 3145728;

export const AvatarUpload = () => {
	const actionData = useActionData<typeof action>();
	const fetcher = useFetcher();
	const user = useUser();
	const [file, setFile] = useState<File | null>(null);
	const [selectedAvatar, setSelectedAvatar] = useState(user.avatarUrl);

	const resetRef = useRef<() => void>(null);

	useEffect(() => {
		if (actionData?.success) {
			setFile(null);
			resetRef.current?.();
		}
	}, [actionData]);

	const handleSelectFile = (file: File) => {
		if (file?.size < UPLOAD_SIZE_LIMIT) {
			setFile(file);
			setSelectedAvatar(URL.createObjectURL(file));
		} else {
			setFile(null);
			resetRef.current?.();
			showNotification({
				title: 'Max avatar size is 3mb',
				message: undefined,
				color: 'yellow',
				autoClose: 5000,
				icon: <IconExclamationMark size={18} />,
			});
		}
	};

	const handleRemoveAvatar = () => {
		setSelectedAvatar(null);
		resetRef.current?.();
	};

	return (
		<Paper
			shadow="0"
			withBorder
			mb={12}
		>
			<fetcher.Form
				method={'post'}
				encType={'multipart/form-data'}
			>
				<Box p={'lg'}>
					<Title order={2}>Avatar</Title>
					<Group spacing={6}>
						<Text color={'dimmed'}>Set or remove avatar. </Text>
						<InfoTooltip label={'Max size is 3mb.'} />
					</Group>
					<Box my={12}>
						<Group>
							<Avatar
								src={selectedAvatar}
								alt={user.email}
								size={48}
							/>
							<FileButton
								resetRef={resetRef}
								onChange={handleSelectFile}
								accept="image/png, image/gif, image/jpeg, image/svg+xml, image/webp"
								name={'file'}
							>
								{(props) => (
									<SecondaryButton
										leftIcon={<IconUpload size={'14'} />}
										compact
										{...props}
									>
										Select avatar
									</SecondaryButton>
								)}
							</FileButton>
						</Group>
					</Box>
					<Box py={12}>
						<Group>
							<PrimaryButton
								type={'submit'}
								name={'intent'}
								value={'uploadAvatar'}
								disabled={!file}
							>
								Upload
							</PrimaryButton>
							<DangerButton
								type={'submit'}
								name={'intent'}
								value={'deleteAvatar'}
								onClick={handleRemoveAvatar}
							>
								Delete
							</DangerButton>
						</Group>
					</Box>
				</Box>
			</fetcher.Form>
		</Paper>
	);
};
