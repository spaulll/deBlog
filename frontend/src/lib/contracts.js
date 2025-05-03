import { getContract } from "thirdweb";
// import { baseSepolia } from "thirdweb/chains";
import { client } from "./client";
import userProfileAbi from "./abi/UserProfileAbi.json";
import blogAbi from "./abi/BlogAbi.json";
import { chain } from "./chain";

// Contract object for UserProfile
const UserProfileContract = getContract({
    // the client you have created via `createThirdwebClient()`
    client,
    // the chain the contract is deployed on
    chain: chain,
    // the contract's address
    address: "0xBbdc6C8B1A24B61aEdd77650ae01dcE9722B56B5",
    // OPTIONAL: the contract's abi
    abi: userProfileAbi
});

// Contract object for Blog
const BlogContract = getContract({
    // the client you have created via `createThirdwebClient()`
    client,
    // the chain the contract is deployed on
    chain: chain,
    // the contract's address
    address: "0xac60A3b6ed1d0716D24b7B2826272390DC2e0D37",
    // OPTIONAL: the contract's abi
    abi: blogAbi
});
export { UserProfileContract, BlogContract };