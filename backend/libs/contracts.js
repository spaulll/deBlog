//contracts.js

import { getContract } from "thirdweb";
import { baseSepolia } from "thirdweb/chains";
import { thirdwebClient } from "../thirdwebClient.js";
import userProfileAbi from "./abi/UserProfileAbi.json" assert { type: "json" };
import blogAbi from "./abi/BlogAbi.json" assert { type: "json" };

// console.log("client", thirdwebClient.clientId);

const client = thirdwebClient
// Contract object for UserProfile
const UserProfileContract = getContract({
    // the thirdwebClient you have created via `createThirdwebthirdwebClient()`
    client,
    // the chain the contract is deployed on
    chain: baseSepolia,
    // the contract's address
    address: "0xcEb9883D9A20AC93243b2c51468e88A45D6D8E31",
    // OPTIONAL: the contract's abi
    abi: userProfileAbi
});

// Contract object for Blog
const BlogContract = getContract({
    // the thirdwebClient you have created via `createThirdwebthirdwebClient()`
    client,
    // the chain the contract is deployed on
    chain: baseSepolia,
    // the contract's address
    address: "0x3e6316a0342128FA011356B77A5EC2D4f03Ca2eF",
    // OPTIONAL: the contract's abi
    abi: blogAbi
});
export { UserProfileContract, BlogContract };