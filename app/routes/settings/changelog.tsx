import {
	Accordion,
	Box,
	Paper,
	Text,
	Title,
	TypographyStylesProvider,
} from '@mantine/core';
import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import dayjs from 'dayjs';
import { getChangelog } from '~/models/changelog.server';
import { requireUser } from '~/server/session.server';

export const loader = async ({ request }: LoaderArgs) => {
	await requireUser(request);
	const changelog = await getChangelog();

	return json({ changelog });
};

export default function Changelog() {
	const { changelog } = useLoaderData<typeof loader>();

	console.log('changelog', changelog);

	return (
		<Paper
			shadow="0"
			withBorder
			mb={12}
		>
			<Box p={'lg'}>
				<Title order={2}>Changelog</Title>
				<Text color={'dimmed'}>What we are working on</Text>
				<Box my={12}>
					<Accordion variant="separated">
						{changelog.map((c) => (
							<Accordion.Item
								key={c.id}
								value={c.id}
							>
								<Accordion.Control>
									{dayjs(c.date).format('MMM DD, YYYY')}
								</Accordion.Control>
								<Accordion.Panel>
									<TypographyStylesProvider>
										<div dangerouslySetInnerHTML={{ __html: c.content }} />
									</TypographyStylesProvider>
								</Accordion.Panel>
							</Accordion.Item>
						))}
					</Accordion>
				</Box>
			</Box>
		</Paper>
	);
}
