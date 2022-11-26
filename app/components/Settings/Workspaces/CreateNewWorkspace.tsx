import { Group, TextInput } from '@mantine/core';
import { useFetcher } from '@remix-run/react';
import { useEffect, useRef } from 'react';
import { PrimaryButton } from '~/components/Buttons/PrimaryButton';
import { HiddenSessionId } from '~/components/Utils/HiddenSessionId';

export const CreateNewWorkspace = () => {
	const fetcher = useFetcher();
	const formRef = useRef<HTMLFormElement>(null);

	useEffect(() => {
		if (fetcher?.data) {
			formRef?.current?.reset();
		}
	}, [fetcher?.data]);

	return (
		<fetcher.Form
			method={'post'}
			action={'/settings/workspaces'}
			ref={formRef}
		>
			<Group position={'right'}>
				<HiddenSessionId />
				<TextInput
					placeholder={'Workspace name'}
					required
					name={'workspaceName'}
				/>
				<PrimaryButton
					type={'submit'}
					name={'intent'}
					value={'createWorkspace'}
				>
					Create new workspace
				</PrimaryButton>
			</Group>
		</fetcher.Form>
	);
};
