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
    address: "0xf9Fe7c53059f789a6A89173ae34e0002ef3f4d53",
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
    address: "0x10833296b7A01a6DBE852119eA56B6fe6103D7be",
    // OPTIONAL: the contract's abi
    abi: blogAbi
});
export { UserProfileContract, BlogContract };