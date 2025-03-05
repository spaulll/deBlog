import { createThirdwebClient } from "thirdweb";
import dotenv from "dotenv";

// initialize dotenv
dotenv.config();

// check if THIRDWEB_CLIENT_ID is defined
const clientId = process.env.THIRDWEB_CLIENT_ID;
if (clientId === undefined) {
    throw new Error("THIRDWEB_CLIENT_ID is not defined");
}

export const client = createThirdwebClient({ clientId });
