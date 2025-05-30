import { useEffect, useRef, useState } from "react";
import { useActiveAccount } from "thirdweb/react";
import { getUserProfile } from "../lib/contractInteraction";
import getImgURL from "../common/uploadToIPFS";
import { AtSign, Facebook, Github, Instagram, LinkIcon, Twitter, Youtube, Wallet } from "lucide-react";
import AnimationWrapper from "../common/page-animation";
import Loader from "../components/loader.component";
import toast, { Toaster } from "react-hot-toast";
import donation from "../imgs/donation.svg";
import { useAuth } from "../contexts/AuthContext";
import { useSendTransaction } from "thirdweb/react";
import { prepareContractCall } from "thirdweb";
import { UserProfileContract } from "../lib/contracts";

const EditProfile = () => {
    const account = useActiveAccount();
    const address = account?.address;
    const [loading, setLoading] = useState(true);
    const profileImgEle = useRef();
    const editProfileRef = useRef();
    const bioLimit = 150;
    const usernameLimit = 10;
    const [characterLeftBio, setCharacterLeftBio] = useState(bioLimit);
    const [characterLeftUsername, setCharacterLeftUsername] = useState(usernameLimit);
    const [updatedProfileImg, setUpdatedProfileImg] = useState(null);
    const { avatarUrl, setAvatarUrl } = useAuth();
    const [linkErrors, setLinkErrors] = useState({
        youtube: false,
        instagram: false,
        github: false,
        facebook: false,
        twitter: false,
        website: false
    });
    const [form, setForm] = useState({
        username: "",
        bio: "",
        avatarUri: "",
        tipWalletAddress: "",
        socialLinks: {
            youtube: "",
            instagram: "",
            github: "",
            facebook: "",
            twitter: "",
            website: ""
        },
    });

    const socialIcons = {
        youtube: <Youtube className="absolute top-2 left-2 text-xl hover:text-[#7d2929]" />,
        instagram: <Instagram className="absolute top-2 left-2 text-xl hover:text-[#83473d]" />,
        github: <Github className="absolute top-2 left-2 text-xl hover:text-[#292a77]" />,
        facebook: <Facebook className="absolute top-2 left-2 text-xl hover:text-[#4161b1]" />,
        twitter: <Twitter className="absolute top-2 left-2 text-xl hover:text-[#4c859a]" />,
        website: <LinkIcon className="absolute top-2 left-2 text-xl hover:text-gray-700" />
    };

    const { mutateAsync: sendTransaction } = useSendTransaction();

    const loadProfile = async () => {
        if (!address) return;
        setLoading(true);
        try {
            const userProfile = await getUserProfile(address);

            if (userProfile) {
                const socialLinksObj = userProfile.socialLinks?.length > 0 ?
                    convertToSocialLinksObject(userProfile.socialLinks) :
                    { youtube: "", instagram: "", github: "", facebook: "", twitter: "", website: "" };
                console.error("Social Links: ", socialLinksObj)
                setForm({
                    username: userProfile.username || "",
                    bio: userProfile.bio || "",
                    avatarUri: userProfile.avatarUri || "",
                    tipWalletAddress: userProfile.tipWalletAddress || address,
                    socialLinks: socialLinksObj,
                });
                
                // Validate existing social links
                Object.keys(socialLinksObj).forEach(platform => {
                    const value = socialLinksObj[platform];
                    if (value) {
                        validateSocialLink(platform, value);
                    }
                });
                
                setCharacterLeftBio(bioLimit - (userProfile.bio?.length || 0));
                setCharacterLeftUsername(usernameLimit - (userProfile.username?.length || 0));
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to load profile");
        }
        setLoading(false);
    };

    // Helper function to convert social links array to object
    const convertToSocialLinksObject = (linksArray) => {
        console.log("linksArray", linksArray);
        const socialLinksObj = { youtube: "", instagram: "", github: "", facebook: "", twitter: "", website: "" };

        linksArray.forEach(link => {
            // Simple logic to categorize links
            if (link.includes('youtube')) socialLinksObj.youtube = link;
            else if (link.includes('instagram')) socialLinksObj.instagram = link;
            else if (link.includes('github')) socialLinksObj.github = link;
            else if (link.includes('facebook')) socialLinksObj.facebook = link;
            else if (link.includes('twitter')) socialLinksObj.twitter = link;
            else if (link.includes('x.com')) socialLinksObj.twitter = link;
            else socialLinksObj.website = link;
        });

        return socialLinksObj;
    };

    // Helper function to convert social links object back to array
    const convertToSocialLinksArray = (linksObj) => {
        const linksArray = Object.values(linksObj).filter(link => link.trim() !== "");
        return linksArray;
    };

    useEffect(() => {
        loadProfile();
    }, [address]);

    const handleCharacterChange = (e) => {
        const textLength = e.target.value.length;
        setCharacterLeftBio(bioLimit - textLength);
        setForm(prev => ({ ...prev, bio: e.target.value }));
    };

    const handleUsernameChange = (e) => {
        const { name, value } = e.target;
        setCharacterLeftUsername(usernameLimit - value.length);
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleTipWalletChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));

        const isValid = /^0x[a-fA-F0-9]{40}$/g.test(value);
        if (e.target) {
            e.target.style.color = isValid ? "green" : (value ? "red" : "inherit");
        }
    };

    const validateSocialLink = (platform, value) => {
        // Skip validation if empty (optional fields)
        if (!value) {
            setLinkErrors(prev => ({ ...prev, [platform]: false }));
            return true;
        }
        
        // URL validation regex
        const isValid = /^https:\/\/[a-zA-Z0-9][\w-]*(\.[a-zA-Z]{2,})+([/\w-]*)*\/?$/i.test(value);
        setLinkErrors(prev => ({ ...prev, [platform]: !isValid }));
        return isValid;
    };

    const handleSocialLinkChange = (platform, value) => {
        setForm(prev => ({
            ...prev,
            socialLinks: {
                ...prev.socialLinks,
                [platform]: value
            }
        }));
        
        validateSocialLink(platform, value);
    };

    const handleImagePreview = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        profileImgEle.current.src = URL.createObjectURL(file);
        setUpdatedProfileImg(file);
    };

    const handleImageUpload = async (e) => {
        e.preventDefault();

        if (!updatedProfileImg) return;

        const loading = toast.loading("Uploading image...");
        e.target.setAttribute("disabled", true);

        try {
            const url = await getImgURL(updatedProfileImg);
            setForm(prev => ({ ...prev, avatarUri: url }));
            console.log("Image uploaded: ", url);
            setUpdatedProfileImg(null);
            toast.success("Image uploaded successfully");
        } catch (err) {
            console.error(err);
            toast.error("Image upload failed");
        } finally {
            toast.dismiss(loading);
            e.target.removeAttribute("disabled");
        }
    };

    const hasInvalidLinks = () => {
        return Object.entries(form.socialLinks).some(([platform, value]) => {
            return value.trim() !== "" && !validateSocialLink(platform, value);
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (form.username.length < 3) {
            return toast.error("Username should be at least 3 characters");
        } else if (form.bio.length > bioLimit) {
            return toast.error(`Bio should be within ${bioLimit} characters`);
        } else if (!/^0x[a-fA-F0-9]{40}$/g.test(form.tipWalletAddress)) {
            return toast.error("Invalid wallet address format. Please enter a valid Ethereum address.");
        } else if (hasInvalidLinks()) {
            return toast.error("Please fix the invalid social links before submitting");
        }

        const loading = toast.loading("Updating profile...");
        e.target.setAttribute("disabled", true);

        try {
            const tx = prepareContractCall({
                contract: UserProfileContract,
                method: "editProfile",
                params: [
                    form.username,
                    form.bio,
                    form.avatarUri,
                    form.tipWalletAddress,
                    convertToSocialLinksArray(form.socialLinks),
                ],
            });

            const receipt = await sendTransaction(tx);
            console.log("Profile updated:", receipt);
            toast.success("Profile updated successfully!");
        } catch (err) {
            console.error(err);
            toast.error("Profile update failed");
        } finally {
            toast.dismiss(loading);
            e.target.removeAttribute("disabled");
        }
    };

    if (!address) return <div className="text-center p-4">Please connect your wallet.</div>;
    if (loading) return <Loader />;

    return (
        <AnimationWrapper>
            <form className="w-full" ref={editProfileRef}>
                <Toaster />
                <h1 className="max-md:hidden text-xl font-medium">Edit Profile</h1>

                <div className="flex flex-col lg:flex-row items-start py-10 gap-8 lg:gap-10">
                    <div className="max-lg:center mb-5">
                        <label htmlFor="uploadImg" id="profileImgLable" className="relative block w-48 h-48 bg-grey rounded-full overflow-hidden">
                            <div className="w-full h-full absolute top-0 left-0 flex items-center justify-center opacity-0 text-white bg-black/50 hover:opacity-100 cursor-pointer">
                                Upload Image
                            </div>
                            <img
                                src={form.avatarUri || avatarUrl}
                                className="w-full h-full object-cover"
                                ref={profileImgEle}
                                alt="Profile"
                            />
                        </label>
                        <input
                            type="file"
                            id="uploadImg"
                            accept=".jpeg, .png, .jpg"
                            hidden
                            onChange={handleImagePreview}
                        />
                        {(updatedProfileImg) ? (
                        <button
                            className="btn-light mt-5 max-lg:center lg:w-full px-10"
                            onClick={handleImageUpload}
                            type="button"
                        >
                            Apply Image
                        </button>):(
                        <button
                            className="btn-light mt-5 max-lg:center lg:w-full px-10"
                            onClick={() => document.getElementById('uploadImg').click()}
                            type="button"
                        >
                            Upload
                        </button>)
                        }
                    </div>

                    <div className="w-full">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="relative">
                                <AtSign className="absolute top-2 left-2 text-gray-500" />
                                <input
                                    type="text"
                                    name="username"
                                    placeholder="Username"
                                    maxLength={10}
                                    value={form.username}
                                    onChange={handleUsernameChange}
                                    required
                                    className="w-full p-2 pl-10 border rounded input-box"
                                />
                                <p className="text-dark-grey mt-2 text-sm">
                                    Username will be visible to all users
                                </p>
                                <p className="absolute top-2 right-2 text-dark-grey text-right block">
                                    {characterLeftUsername} characters left
                                </p>
                            </div>
                            <div className="relative">
                                <Wallet className="absolute top-2 left-2 text-gray-500" />
                                <input
                                    type="text"
                                    value={address}
                                    readOnly
                                    placeholder="Wallet Address"
                                    className="w-full p-2 pl-10 border rounded input-box bg-gray-100"
                                />
                                <p className="text-dark-grey mt-2 text-sm">
                                    Your connected wallet address
                                </p>
                            </div>
                        </div>

                        <div className="relative mb-6">
                            <img src={donation} className="absolute top-2 left-2 text-gray-500 w-8 h-8" />
                            <input
                                type="text"
                                name="tipWalletAddress"
                                placeholder="Tip Wallet Address"
                                value={form.tipWalletAddress}
                                onChange={handleTipWalletChange}
                                required
                                className="w-full p-2 pl-10 border rounded input-box"
                            />
                            <p className="text-dark-grey mt-2 text-sm">
                                Address where you'll receive tips
                            </p>
                        </div>

                        <textarea
                            name="bio"
                            maxLength={bioLimit}
                            value={form.bio}
                            className="input-box h-64 lg:h-40 resize-none leading-7 mt-5 pl-5 w-full p-2 border rounded"
                            placeholder="Enter your bio here..."
                            onChange={handleCharacterChange}
                        />

                        <p className="relative bottom-10 right-2 text-dark-grey text-right mt-1">
                            {characterLeftBio} characters left
                        </p>

                        <p className="my-6 text-dark-grey">Add your social handles</p>
                        <div className="md:grid md:grid-cols-2 gap-x-6 gap-y-4">
                            {Object.keys(form.socialLinks).map((platform) => (
                                <div key={platform} className="relative mb-4 md:mb-0">
                                    {socialIcons[platform]}
                                    <input
                                        type="url"
                                        placeholder={`https://${platform}.com/...`}
                                        value={form.socialLinks[platform]}
                                        onChange={(e) => handleSocialLinkChange(platform, e.target.value)}
                                        className={`w-full p-2 pl-10 border rounded input-box ${
                                            linkErrors[platform] ? 'bg-red-100 border-red-300' : ''
                                        }`}
                                    />
                                    {linkErrors[platform] && (
                                        <p className="text-xs text-red-500 mt-1">
                                            Please enter a valid URL (https://example.com)
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>

                        <button
                            type="submit"
                            onClick={handleSubmit}
                            className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 mt-6 btn-dark w-auto px-10"
                        >
                            Update Profile
                        </button>
                    </div>
                </div>
            </form>
        </AnimationWrapper>
    );
};

export default EditProfile;