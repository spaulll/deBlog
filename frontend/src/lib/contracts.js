import { getContract } from "thirdweb";
// import { baseSepolia } from "thirdweb/chains";
import { client } from "./client";
import userProfileAbi from "./abi/UserProfileAbi.json";
import blogAbi from "./abi/BlogAbi.json";
import tipAbi from "./abi/TipAbi.json";
import { chain } from "./chain";

// Contract object for UserProfile
const UserProfileContract = getContract({
    // the client you have created via `createThirdwebClient()`
    client,
    // the chain the contract is deployed on
    chain: chain,
    // the contract's address
    address: "0xbD37B8998B7aC367D087964eD15Ee74266D7E571",
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
    address: "0x4A005929B01c248ED43C7436214B45a1F8f04eb3",
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
    address: "0xF1BDC5ede89DF2a6c28dA1f930F3DBA02BA06975",
    // OPTIONAL: the contract's abi
    abi: tipAbi
}) 
export { UserProfileContract, BlogContract, TippingContract };