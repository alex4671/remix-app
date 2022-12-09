import { Group } from '@mantine/core';
import { Readability } from '@mozilla/readability';
import type { LoaderArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Link as RemixLink, useFetcher, useLoaderData } from '@remix-run/react';
import { JSDOM } from 'jsdom';
import invariant from 'tiny-invariant';
import { PrimaryButton } from '~/components/Buttons/PrimaryButton';
import { getBookmarkById } from '~/models/bookmarks.server';
import { requireUser } from '~/server/session.server';

export const loader = async ({ request, params }: LoaderArgs) => {
	await requireUser(request);
	const bookmarkId = params.bookmarkId;
	invariant(typeof bookmarkId === 'string', 'Bookmark Id must be provided');

	const bookmark = await getBookmarkById(bookmarkId);

	if (!bookmark) {
		return redirect('/bookmarks');
	}

	const html = await (await fetch(bookmark.bookmarkUrl)).text();

	const doc = new JSDOM(html);
	// console.log('html', html);
	let reader = new Readability(doc.window.document);
	let article = reader.parse();

	console.log('article', article);

	return json({
		bookmark,
		article: article?.title ?? '',
	});
};

export default function Bookmark() {
	const { bookmark, article } = useLoaderData<typeof loader>();
	const fetcher = useFetcher();
	console.log('article', article);
	return (
		<>
			<Group
				position={'right'}
				my={24}
			>
				<PrimaryButton
					component={RemixLink}
					to={'/notes/new'}
				>
					New note
				</PrimaryButton>
			</Group>

			{bookmark.bookmarkUrl}
			{/*{article?.title}*/}
		</>
	);
}
