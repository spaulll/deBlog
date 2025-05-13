//contracts.js

import { getContract } from "thirdweb";
import { monadTestnet } from "thirdweb/chains";
import { thirdwebClient } from "../thirdwebClient.js";
import { readFileSync } from 'fs';

const chain = monadTestnet;

const userProfileAbi = JSON.parse(readFileSync(new URL('./abi/UserProfile.json', import.meta.url)));
const blogAbi = JSON.parse(readFileSync(new URL('./abi/Blog.json', import.meta.url)));
const addresses = JSON.parse(readFileSync(new URL('./abi/addresses.json', import.meta.url)))

const client = thirdwebClient
// Contract object for UserProfile
const UserProfileContract = getContract({
    // the thirdwebClient you have created via `createThirdwebthirdwebClient()`
    client,
    // the chain the contract is deployed on
    chain: chain,
    // the contract's address
    address: addresses.UserProfile,
    // OPTIONAL: the contract's abi
    abi: userProfileAbi
});

// Contract object for Blog
const BlogContract = getContract({
    // the thirdwebClient you have created via `createThirdwebthirdwebClient()`
    client,
    // the chain the contract is deployed on
    chain: chain,
    // the contract's address
    address: addresses.Blog,
    // OPTIONAL: the contract's abi
    abi: blogAbi
});
export { UserProfileContract, BlogContract };