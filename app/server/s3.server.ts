import { S3Client } from '@aws-sdk/client-s3';
import invariant from 'tiny-invariant';

const { CLOUDFLARE_ACCOUNT_ID, ACCESS_KEY_ID, SECRET_ACCESS_KEY } = process.env;

invariant(CLOUDFLARE_ACCOUNT_ID, 'CLOUDFLARE_ACCOUNT_ID must be set');
invariant(ACCESS_KEY_ID, 'ACCESS_KEY_ID must be set');
invariant(SECRET_ACCESS_KEY, 'SECRET_ACCESS_KEY must be set');

export const client = new S3Client({
	endpoint: `https://${CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
	region: 'auto',
	credentials: {
		accessKeyId: ACCESS_KEY_ID ?? '',
		secretAccessKey: SECRET_ACCESS_KEY ?? '',
	},
});
