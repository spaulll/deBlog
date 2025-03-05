import { createThirdwebClient } from "thirdweb";
import dotenv from 'dotenv';

dotenv.config();

const secretKey = process.env.THIRDWEB_SECRET_KEY;
if (secretKey === undefined) {
  throw new Error("THIRDWEB_SECRET_KEY is not defined");
}
export const thirdwebClient = createThirdwebClient({ secretKey });