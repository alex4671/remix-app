import { PaddleSDK } from '@invertase/node-paddle-sdk';

const { PADDLE_VENDOR_ID, PADDLE_VENDOR_AUTH_CODE, PADDLE_PUBLIC_KEY } =
	process.env;

const paddle = new PaddleSDK(
	Number(PADDLE_VENDOR_ID),
	String(PADDLE_VENDOR_AUTH_CODE),
	PADDLE_PUBLIC_KEY?.replace(/\\n/g, '\n'),
	'https://sandbox-vendors.paddle.com/api/2.0',
);

export { paddle };
