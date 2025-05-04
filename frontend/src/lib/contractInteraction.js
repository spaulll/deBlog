import { readContract, prepareContractCall, sendTransaction, waitForReceipt, sendAndConfirmTransaction } from "thirdweb";
import { UserProfileContract, BlogContract } from "./contracts";
import { useActiveAccount } from "thirdweb/react";
import getRandomUsername from "./randomUsernames";

// userProfile returs the below:
// 0: tuple(address,string,string,string,uint256,address): user 0x726DCb71dc9298D87796309cdBAf3220EbC68472,lobstr,hello world,https://avatar.iran.liara.run/public,0,0x726DCb71dc9298D87796309cdBAf3220EbC68472

const getUserProfile = async (address, username = null) => {
    console.log("getUserProfile() called:", address, username);
    // address = "0x726DCb71dc9298D87796309cdBAf3220EbC68472";
    try {
        if (username) {
            address = await readContract({
                contract: UserProfileContract,
                method: "usernameToAddress",
                params: [username],
            });
            console.log("Username: ", username, "=> Address: ", address);
        }
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

const editProfile = async (username, bio, avatarUrl, tipWalletAddress) => {
    console.log("editProfile() called:", username, bio, avatarUrl, tipWalletAddress);
    // address = "0x726DCb71dc9298D87796309cdBAf3220EbC68472";
    try {
        const tx = prepareContractCall({
            contract: UserProfileContract,
            method: "editProfile",
            args: [username, bio, avatarUrl, tipWalletAddress],
        });
        const receipt = await sendAndConfirmTransaction(tx);
        return receipt;
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
        const avatarUrl = userProfile.avatarUri;
        return avatarUrl;
    } catch (error) {
        console.error(error);
        return `https://api.dicebear.com/9.x/adventurer/svg?seed=${address.toLowerCase()}`; 
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
        console.log("isRegistered:", isRegistered);
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
    const uploadBlog = async (ipfsUri, tags, blogIdHash, title, des) => {
        console.log("uploadBlog() called:", ipfsUri);
        if (!account) throw new Error("No connected account");
    
        try {
          const transaction = prepareContractCall({
            contract: BlogContract,
            method: "createPost",
            params: [ipfsUri, tags, blogIdHash, title, des],
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

const useEditBlog = () => {
    const account = useActiveAccount();
    const editBlog = async (ipfsUri, tags,blogIdHash) => {
        console.log("editBlog() called:", ipfsUri);
        if (!account) throw new Error("No connected account");
        const owner = await getPostOwner(blogIdHash);
        console.log("Owner:",owner);
        console.log("Account:",account);
        try {
          const transaction = prepareContractCall({
            contract: BlogContract,
            method: "editPost",
            params: [blogIdHash, ipfsUri],
          });

          const receipt = await sendAndConfirmTransaction({
            transaction,
            account
          });
          console.log("Receipt:",receipt);
          return receipt.transactionHash;
        } catch (error) {
          console.error(error);
          return error;
        }
    }
    return editBlog;
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
            params: [ username, "", "", [] ],
        });
        const receipt = await sendAndConfirmTransaction({ transaction, account });
        console.log("Receipt:",receipt);
        return {
            transactionHash: receipt.transactionHash,
            username
        };
    } catch (error) {
        console.error(error);
        return null;
    }
};

const getBlog = async (blogIdHash) => {
    if (!blogIdHash) throw new Error("Something went wrong");
    try {
        const blog = await readContract({
            contract: BlogContract,
            method: "getPost",
            params: [blogIdHash],
        });
        return blog;
    } catch (error) {
        console.error(error);
        return null;
    }
}

// const getBlogsByOwner = async (address) => {
//     if (!address) throw new Error("Something went wrong");
//     try {
//         const blogs = await readContract({
//             contract: BlogContract,
//             method: "getPostsByOwner",
//             params: [address],
//         });
//         return blogs;
//     } catch (error) {
//         console.error(error);
//         return null;
//     }
// }

const likePost = async (blogIdHash, account) => {
    if (!account) throw new Error("No connected account");
    if (!blogIdHash) throw new Error("Something went wrong");
    try {
        const transaction = prepareContractCall({
            contract: BlogContract,
            method: "toggleLikeDislike",
            params: [blogIdHash, true],
        });
        const receipt = await sendAndConfirmTransaction({ transaction, account });
        return receipt.transactionHash;
    } catch (error) {
        console.error(error);
        return null;
    }
}

const isPostLikedByUser = async (blogIdHash, address) => {
    try {
        if (!blogIdHash || !address) throw new Error("Invalid parameters");

        // Fetch blogId using blogIdHash
        const blogId = await readContract({
            contract: BlogContract,
            method: "postIdsByBlogIdHash",
            params: [blogIdHash],
        });
        console.error("blogId:", blogId);

        // Fetch post owner using blogIdHash
        const postOwner = await readContract({
            contract: BlogContract,
            method: "postOwner",
            params: [blogIdHash],
        });

        if (!postOwner) throw new Error("Failed to fetch post owner");

        // Fetch hasLiked status using address, postOwner, and blogId
        const hasLiked = await readContract({
            contract: BlogContract,
            method: "hasLiked",
            params: [address, postOwner, blogId],
        });

        return hasLiked;
    } catch (error) {
        console.error("Error in isPostLikedByUser:", error.message);
        return false; // Return false in case of an error
    }
};

const getCommentsFromContract = async (blogIdHash) => {
    if (!blogIdHash) throw new Error("Something went wrong");
    try {
        const comments = await readContract({
            contract: BlogContract,
            method: "getComments",
            params: [blogIdHash],
        });
        return comments;
    } catch (error) {
        console.error(error);
        return null;
    }
}

const getPostOwner = async (blogIdHash) => {
    if (!blogIdHash) throw new Error("Something went wrong");
    try {
        const postOwner = await readContract({
            contract: BlogContract,
            method: "postOwner",
            params: [blogIdHash],
        });
        return postOwner;
    } catch (error) {
        console.error(error);
        return null;
    }
}

const addCommentToContract = async (blogIdHash, comment, account) => {
    if (!blogIdHash) throw new Error("Something went wrong");
    try {
        const transaction = prepareContractCall({
            contract: BlogContract,
            method: "addComment",
            params: [blogIdHash, comment],
        });
        const receipt = await sendAndConfirmTransaction({ transaction, account });
        return receipt.transactionHash;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export { getUserProfile, editProfile, getAvatar, isRegisteredUser, useUploadBlog, useEditBlog, registerUser, getBlog, likePost, isPostLikedByUser, getCommentsFromContract, getPostOwner, addCommentToContract };