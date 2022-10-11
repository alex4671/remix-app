import { PaddleSDK } from '@invertase/node-paddle-sdk';
import invariant from "tiny-invariant";

const {
  PADDLE_VENDOR_ID,
  PADDLE_VENDOR_AUTH_CODE,
  PADDLE_PUBLIC_KEY,
} = process.env;


invariant(PADDLE_VENDOR_ID, "PADDLE_VENDOR_ID must be set");
invariant(PADDLE_VENDOR_AUTH_CODE, "PADDLE_VENDOR_AUTH_CODE must be set");
invariant(PADDLE_PUBLIC_KEY, "PADDLE_PUBLIC_KEY must be set");

const paddle = new PaddleSDK(
  Number(PADDLE_VENDOR_ID),
  String(PADDLE_VENDOR_AUTH_CODE),
  PADDLE_PUBLIC_KEY?.replace(/\\n/g, '\n'),
  'https://sandbox-vendors.paddle.com/api/2.0',
);

export {paddle}
