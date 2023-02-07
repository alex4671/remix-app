import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';

export const getArticle = async (url: string) => {
	const html = await (await fetch(url)).text();

	const doc = new JSDOM(html);
	// console.log('html', html);
	let reader = new Readability(doc.window.document);
	return reader.parse();
};

export const isValidHttpUrl = (string: string) => {
	let url;
	try {
		url = new URL(string);
	} catch (_) {
		return false;
	}
	return url.protocol === 'http:' || url.protocol === 'https:';
};
