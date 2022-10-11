import invariant from "tiny-invariant";

var postmark = require("postmark");

const {POSTMARK_SERVER_TOKEN} = process.env;

invariant(POSTMARK_SERVER_TOKEN, "POSTMARK_SERVER_TOKEN must be set")

export const postmarkClient = new postmark.ServerClient(POSTMARK_SERVER_TOKEN?.toString() ?? "");
