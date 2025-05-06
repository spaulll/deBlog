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
    address: "0xbD37B8998B7aC367D087964eD15Ee74266D7E571",
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
    address: "0x4A005929B01c248ED43C7436214B45a1F8f04eb3",
    // OPTIONAL: the contract's abi
    abi: blogAbi
});
export { UserProfileContract, BlogContract };