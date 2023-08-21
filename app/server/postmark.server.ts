const postmark = require('postmark');

const { POSTMARK_SERVER_TOKEN } = process.env;

export const postmarkClient = new postmark.ServerClient(
	POSTMARK_SERVER_TOKEN?.toString() ?? '',
);
