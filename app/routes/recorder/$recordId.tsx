import { AspectRatio, Box, Group } from '@mantine/core';
import type { LoaderArgs, MetaFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { useLoaderData, useNavigate } from '@remix-run/react';
import { IconChevronLeft } from '@tabler/icons';
import invariant from 'tiny-invariant';
import { SecondaryButton } from '~/components/Buttons/SecondaryButton';
import { getRecordById } from '~/models/media.server';
import { requireUser } from '~/server/session.server';

export const meta: MetaFunction = () => {
	return {
		title: 'Notes',
	};
};

export const loader = async ({ request, params }: LoaderArgs) => {
	await requireUser(request);
	const recordId = params.recordId;
	invariant(typeof recordId === 'string', 'Record Id must be provided');

	const record = await getRecordById(recordId);

	if (!record) {
		return redirect('/recorder');
	}

	return json({
		record,
	});
};

export default function RecordId() {
	const { record } = useLoaderData<typeof loader>();
	const navigate = useNavigate();
	console.log('record', record);

	const handleGoBack = () => {
		navigate('/recorder');
	};

	return (
		<>
			<Group my={'xl'}>
				<SecondaryButton
					onClick={handleGoBack}
					leftIcon={<IconChevronLeft size={14} />}
				>
					Go back
				</SecondaryButton>
			</Group>

			<AspectRatio ratio={16 / 9}>
				{record.type.includes('video') ? (
					<video
						controls
						preload="metadata"
					>
						<source
							src={`${record.fileUrl}#t=0.5`}
							type={record.type}
						/>
					</video>
				) : (
					<Box
						sx={(theme) => ({
							background:
								theme.colorScheme === 'dark'
									? theme.colors.dark[4]
									: theme.colors.gray[2],
						})}
					>
						<audio controls>
							<source
								src={record.fileUrl}
								type={record.type}
							/>
						</audio>
					</Box>
				)}
			</AspectRatio>
			{/*<RangeSlider*/}
			{/*	color="gray"*/}
			{/*	size="sm"*/}
			{/*/>*/}
		</>
	);
}
