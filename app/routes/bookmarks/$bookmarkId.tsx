import { Title, TypographyStylesProvider } from '@mantine/core';
import type { LoaderArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';
import { getBookmarkById } from '~/models/bookmarks.server';
import { requireUser } from '~/server/session.server';
import { getArticle } from '~/utils/parser.server';

export const loader = async ({ request, params }: LoaderArgs) => {
	await requireUser(request);
	const bookmarkId = params.bookmarkId;
	invariant(typeof bookmarkId === 'string', 'Bookmark Id must be provided');

	const bookmark = await getBookmarkById(bookmarkId);

	if (!bookmark) {
		return redirect('/bookmarks');
	}

	const article = await getArticle(bookmark.bookmarkUrl);
	// console.log('article', article);

	return json({
		bookmark,
		article,
	});
};

export default function Bookmark() {
	const { bookmark, article } = useLoaderData<typeof loader>();

	if (!article?.title) {
		return <Title order={2}>Unable to parse article</Title>;
	}

	return (
		<>
			<Title order={1}>{article.title}</Title>
			<TypographyStylesProvider>
				<div dangerouslySetInnerHTML={{ __html: article.content }} />
			</TypographyStylesProvider>
		</>
	);
}
