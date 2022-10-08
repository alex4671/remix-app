import {DeleteObjectCommand, ListObjectsV2Command, PutObjectCommand} from "@aws-sdk/client-s3";
import {client} from "~/server/s3.server";
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";


const {
  BUCKET_NAME,
  CLOUDFLARE_PUBLIC_FILE_URL,
} = process.env;

// if (!BUCKET_NAME && !CLOUDFLARE_PUBLIC_FILE_URL) {
//   throw new Error(`Storage is missing required configuration.`)
// }


export  const  generateSignedUrl = async (contentType: string, key: string) => {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
    ACL: "public-read",
  });

  return await getSignedUrl(client, command, {
    expiresIn: 3600,
  })
}


export async function deleteFileFromS3(key: string) {
  if (!key) {
    return;
  }

  const params = {
    Bucket: BUCKET_NAME,
    Key: key
  };

  try {
    const data = await client.send(new DeleteObjectCommand(params));
    console.log("Success. Object deleted.", data);
    return data; // For unit tests.
  } catch (err) {
    console.log("Error", err);
  }
}

export async function listS3Files() {
  const data = await client.send(new ListObjectsV2Command({Bucket: BUCKET_NAME}));

  return data?.Contents?.map(item => `${CLOUDFLARE_PUBLIC_FILE_URL}/${item.Key}`)
}
