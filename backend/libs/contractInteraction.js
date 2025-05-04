// contractInteraction.js
import { readContract } from "thirdweb";
import { UserProfileContract } from "./contracts.js";

const formatUserProfile = (userProfile) => {
  return {
    personal_info: {
      user_address: userProfile.userAddress,
      username: userProfile.username,
      bio: userProfile.bio,
      profile_img: userProfile.avatarUri || `https://api.dicebear.com/9.x/adventurer/svg?seed=${userProfile.userAddress.toLowerCase()}`,
      tip_address: userProfile.tipWalletAddress
    },
    social_links: {
      youtube: userProfile.youtube,
      instagram: userProfile.instagram,
      facebook: userProfile.facebook,
      twitter: userProfile.twitter,
      github: userProfile.github,
      website: userProfile.website,
    },
    account_info: {
      total_posts: userProfile.postCount || 0,
    },
    "joinedAt": new Date(userProfile.memberSince * 1000),
  }
}

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
        
        return formatUserProfile(userProfile);
    } catch (error) {
        console.error(error);
        return null;
    }
};


export { getUserProfile };