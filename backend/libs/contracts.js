//contracts.js

import { getContract } from "thirdweb";
import { baseSepolia } from "thirdweb/chains";
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
    chain: baseSepolia,
    // the contract's address
    address: "0xf9Fe7c53059f789a6A89173ae34e0002ef3f4d53",
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
    address: "0x10833296b7A01a6DBE852119eA56B6fe6103D7be",
    // OPTIONAL: the contract's abi
    abi: blogAbi
});
export { UserProfileContract, BlogContract };