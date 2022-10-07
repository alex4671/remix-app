import {S3Client} from "@aws-sdk/client-s3";

const {
  CLOUDFLARE_ACCOUNT_ID,
  ACCESS_KEY_ID,
  SECRET_ACCESS_KEY,
} = process.env;

// if (!(AWS_ENDPOINT && ACCESS_KEY_ID && SECRET_ACCESS_KEY)) {
//   throw new Error(`Storage is missing required configuration.`)
// }

export const client = new S3Client({
  endpoint: `https://${CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  region: "auto",
  credentials: {
    accessKeyId: ACCESS_KEY_ID ?? "",
    secretAccessKey: SECRET_ACCESS_KEY ?? "",
  },
})


