import { getContract } from "thirdweb";
import { baseSepolia } from "thirdweb/chains";
import { client } from "./client";

// get a contract
const contract = getContract({
    // the client you have created via `createThirdwebClient()`
    client,
    // the chain the contract is deployed on
    chain: baseSepolia,
    // the contract's address
    address: "",
    // OPTIONAL: the contract's abi (if not provided, it will be fetched from the blockchain if verified contract)
    abi: [  ]
});

export { contract };