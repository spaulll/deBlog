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
    address: "0x85deafF45C0C7E45133A834a118BD45539c62e24",
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
    address: "0x97c32897eeCee1132346D31C4e0Be37860562D2C",
    // OPTIONAL: the contract's abi
    abi: blogAbi
});
export { UserProfileContract, BlogContract };