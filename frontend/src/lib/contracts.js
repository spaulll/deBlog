import { getContract } from "thirdweb";
import { baseSepolia } from "thirdweb/chains";
import { client } from "./client";
import userProfileAbi from "./abi/UserProfileAbi.json";
import blogAbi from "./abi/BlogAbi.json";

// Contract object for UserProfile
const UserProfileContract = getContract({
    // the client you have created via `createThirdwebClient()`
    client,
    // the chain the contract is deployed on
    chain: baseSepolia,
    // the contract's address
    address: "0x73A612D2E2fA8017582Fd89F56B27A4C9c953E02",
    // OPTIONAL: the contract's abi
    abi: userProfileAbi
});

// Contract object for Blog
const BlogContract = getContract({
    // the client you have created via `createThirdwebClient()`
    client,
    // the chain the contract is deployed on
    chain: baseSepolia,
    // the contract's address
    address: "0xc9335459eAe01612A32BC4e13F2727e85c4E4Ffc",
    // OPTIONAL: the contract's abi
    abi: blogAbi
});
export { UserProfileContract, BlogContract };