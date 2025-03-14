import { readContract, prepareContractCall, sendTransaction, waitForReceipt, sendAndConfirmTransaction } from "thirdweb";
import { UserProfileContract, BlogContract } from "./contracts";
import { useActiveAccount } from "thirdweb/react";
import getRandomUsername from "./randomUsernames";

// userProfile returs the below:
// 0: tuple(address,string,string,string,uint256,address): user 0x726DCb71dc9298D87796309cdBAf3220EbC68472,lobstr,hello world,https://avatar.iran.liara.run/public,0,0x726DCb71dc9298D87796309cdBAf3220EbC68472

const getUserProfile = async (address) => {
    console.log("getUserProfile() called:", address);
    // address = "0x726DCb71dc9298D87796309cdBAf3220EbC68472";
    try {
        const userProfile = await readContract({
            contract: UserProfileContract,
            method: "getUserProfile",
            params: [address],
        });
        console.table(userProfile);
        return userProfile;
    } catch (error) {
        console.error(error);
        return null;
    }
};

const getAvatar = async (address) => {
    console.log("getAvatar() called:", address);
    // address = "0x726DCb71dc9298D87796309cdBAf3220EbC68472";
    try {
        const userProfile = await getUserProfile(address);
        const avatarUrl = userProfile.avatarUrl;
        // const avatarUrl = "https://api.dicebear.com/9.x/adventurer/svg?seed=random";
        return avatarUrl;
    } catch (error) {
        console.error(error);
        return "https://api.dicebear.com/9.x/adventurer/svg?seed=error";
    }
};

const isRegisteredUser = async (address) => {
    console.log("isRegistered() called:", address);
    // address = "0x726DCb71dc9298D87796309cdBAf3220EbC68472";
    try {
        const isRegistered = await readContract({
            contract: UserProfileContract,
            method: "isRegistered",
            params: [address],
        });
        console.error("isRegistered:", isRegistered);
        return isRegistered;
    } catch (error) {
        console.error(error);
        return false;
    }
};

// Uncomment this if you want to use metamask wallet to upload blog without sponsoring gas

// const useUploadBlog = () => {
//     const { account, signAndSendTransaction } = useAccount();
  
//     const uploadBlog = async (ipfsUri) => {
//       console.log("uploadBlog() called:", ipfsUri);
//       if (!account) throw new Error("No connected account");
  
//       try {
//         const transaction = prepareContractCall({
//           contract,
//           method: "createPost",
//           params: [ipfsUri],
//         });
//         const transactionHash = await signAndSendTransaction(transaction);
//         return transactionHash;
//       } catch (error) {
//         console.error(error);
//         return null;
//       }
//     };
  
//     return uploadBlog;
//   };

// Comment this if you want to use thirdweb smartwallet to upload blog gaslessly
const useUploadBlog = () => {
    const account = useActiveAccount();
    const uploadBlog = async (ipfsUri) => {
        console.log("uploadBlog() called:", ipfsUri);
        if (!account) throw new Error("No connected account");
    
        try {
          const transaction = prepareContractCall({
            contract: BlogContract,
            method: "createPost",
            params: [ipfsUri],
          });

          const receipt = await sendAndConfirmTransaction({
            transaction,
            account
          });
          console.log("Receipt:",receipt);
          return receipt.transactionHash;
        } catch (error) {
          console.error(error);
          return null;
        }
    }
    return uploadBlog;
}

const registerUser = async (account) => {
    console.log("registerUser() called:");
    // address = "0x726DCb71dc9298D87796309cdBAf3220EbC68472";
    
    const username = getRandomUsername();
    // const account = useActiveAccount();
    try {
        const transaction = prepareContractCall({
            contract: UserProfileContract,
            method: "createUser",
            params: [ username, "", "" ],
        });
        const receipt = await sendAndConfirmTransaction({ transaction, account });
        console.log("Receipt:",receipt);
        return receipt.transactionHash;
    } catch (error) {
        console.error(error);
        return null;
    }
};

export { getUserProfile , getAvatar, isRegisteredUser, useUploadBlog, registerUser };