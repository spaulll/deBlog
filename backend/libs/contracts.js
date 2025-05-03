//contracts.js

import { getContract } from "thirdweb";
import { monadTestnet } from "thirdweb/chains";
import { thirdwebClient } from "../thirdwebClient.js";
import { readFileSync } from 'fs';

// import userProfileAbi from "./abi/UserProfileAbi.json" assert { type: "json" };
// import blogAbi from "./abi/BlogAbi.json" assert { type: "json" };

const userProfileAbi = JSON.parse(
    readFileSync(new URL('./abi/UserProfileAbi.json', import.meta.url))
  );
const blogAbi = JSON.parse(
    readFileSync(new URL('./abi/BlogAbi.json', import.meta.url))
  );

// console.log("client", thirdwebClient.clientId);

const client = thirdwebClient
// Contract object for UserProfile
const UserProfileContract = getContract({
    // the thirdwebClient you have created via `createThirdwebthirdwebClient()`
    client,
    // the chain the contract is deployed on
    chain: monadTestnet,
    // the contract's address
    address: "0xBbdc6C8B1A24B61aEdd77650ae01dcE9722B56B5",
    // OPTIONAL: the contract's abi
    abi: userProfileAbi
});

// Contract object for Blog
const BlogContract = getContract({
    // the thirdwebClient you have created via `createThirdwebthirdwebClient()`
    client,
    // the chain the contract is deployed on
    chain: monadTestnet,
    // the contract's address
    address: "0xac60A3b6ed1d0716D24b7B2826272390DC2e0D37",
    // OPTIONAL: the contract's abi
    abi: blogAbi
});
export { UserProfileContract, BlogContract };