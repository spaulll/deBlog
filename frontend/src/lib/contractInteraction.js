import { readContract, prepareContractCall, sendTransaction, waitForReceipt } from "thirdweb";
import { contract } from "./contract";

// userProfile returs the below:
// 0: tuple(address,string,string,string,uint256,address): user 0x726DCb71dc9298D87796309cdBAf3220EbC68472,lobstr,hello world,https://avatar.iran.liara.run/public,0,0x726DCb71dc9298D87796309cdBAf3220EbC68472

const getUserProfile = async (address) => {
    address = "0x726DCb71dc9298D87796309cdBAf3220EbC68472";
    try {
        const userProfile = await readContract({
            contract,
            method: "getUserProfile",
            params: [address],
        });
        return userProfile;
    } catch (error) {
        console.error(error);
        return null;
    }
};

const getAvatar = async (address) => {
    console.log("getAvatar() called:", address);
    address = "0x726DCb71dc9298D87796309cdBAf3220EbC68472";
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


export { getUserProfile , getAvatar };