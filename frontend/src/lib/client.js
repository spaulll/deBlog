import { createThirdwebClient } from "thirdweb";

// check if THIRDWEB_CLIENT_ID is defined
const clientId = import.meta.env.VITE_THIRDWEB_CLIENT_ID;
if (clientId === undefined) {
    throw new Error("THIRDWEB_CLIENT_ID is not defined");
}

export const client = createThirdwebClient({ clientId });
