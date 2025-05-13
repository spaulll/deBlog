import { getContract } from "thirdweb";
import { client } from "./client";
import userProfileAbi from "./abi/UserProfile.json";
import blogAbi from "./abi/Blog.json";
import tipAbi from "./abi/Tipping.json";
import addresses from "./abi/addresses.json"
import { chain } from "./chain";

const BlogContractAddress = addresses.Blog;
const UserProfileContractAddress = addresses.UserProfile;
const TippingContractAddress = addresses.Tipping;

// Contract object for UserProfile
const UserProfileContract = getContract({
    // the client you have created via `createThirdwebClient()`
    client,
    // the chain the contract is deployed on
    chain: chain,
    // the contract's address
    address: UserProfileContractAddress,
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
    address: BlogContractAddress,
    // OPTIONAL: the contract's abi
    abi: blogAbi
});

// Contract for tipping 
const TippingContract = getContract({
    // the client you have created via `createThirdwebClient()`
    client,
    // the chain the contract is deployed on
    chain: chain,
    // the contract's address
    address: TippingContractAddress,
    // OPTIONAL: the contract's abi
    abi: tipAbi
}) 
export { UserProfileContract, BlogContract, TippingContract };