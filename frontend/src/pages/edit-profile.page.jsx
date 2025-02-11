import { useContext, useEffect, useRef, useState } from "react"
import {UserContext} from "../App"
import axios from "axios"
import { profileStructure } from "./profile.page"
import AnimationWrapper from "../common/page-animation"
import Loader from "../components/loader.component"
import toast, { Toaster } from "react-hot-toast"
import InputBox from "../components/input.component"
import { AtSign, Facebook, Github, Instagram, LinkIcon, Mail, Twitter, User, Youtube } from "lucide-react"
import getImgURL from "../common/aws"
import { storeInSession } from "../common/session"

const EditProfile = () => {
    let profileImgEle = useRef()
    let editProfileRef = useRef()
    const bioLimit = 150;
    const [characterLeft, setCharacterLeft] = useState(bioLimit)
    let {userAuth, userAuth: {access_token, username}, setUserAuth} = useContext(UserContext)
    const [profile, setProfile] = useState(profileStructure)
    const [loading, setLoading] = useState(true)
    const [updatedProfileImg, setUpdatedProfileImg] = useState(null);


    const socialIcons = {
        youtube: <Youtube className="absolute top-4 left-2 text-xl hover:text-[#7d2929]" />,
        instagram: <Instagram className="absolute top-4 left-2 text-xl hover:text-[#83473d]" />,
        github: <Github className="absolute top-4 left-2 text-xl hover:text-[#292a77]" />,
        facebook: <Facebook className="absolute top-4 left-2 text-xl hover:text-[#4161b1]" />,
        twitter: <Twitter className="absolute top-4 left-2 text-xl hover:text-[#4c859a]" />,
        website: <LinkIcon className="absolute top-4 left-2 text-xl hover:text-gray-700" />
    };
    
    let {
        personal_info: {
            fullname = "",
            email = "",
            username: profile_username = "",
            bio = "",
            profile_img = "",
        } = {},
        social_links = {},
        account_info: { total_posts = 0, total_reads = 0 } = {},
        joinedAt = "",
    } = profile;

    // Fixed handleCharacterChange
    const handleCharacterChange = (e) => {
        const textLength = e.target.value.length;
        setCharacterLeft(bioLimit - textLength)
    }

    // Fixed useEffect
    useEffect(() => {
        if(access_token){
            axios.post(import.meta.env.VITE_SERVER_URL + "/get-user-profile", {username})
            .then(({data: {user}}) => {
                setProfile(user)
                setCharacterLeft(bioLimit - (user.personal_info?.bio?.length || 0))
                setLoading(false)
            })
            .catch((err) => {
                console.error(err);
                alert("some error occurred")
                setLoading(false)
            })
        }
    }, [access_token])


    const handelImagePreview = (e) => {
        let img = e.target.files[0];
        profileImgEle.current.src = URL.createObjectURL(img);
        setUpdatedProfileImg(img);
    }
    
    const handleImageUpload = async (e) => {
        e.preventDefault();  // Fixed typo in preventDefault
        
        if(updatedProfileImg) {
            let loading = toast.loading("uploading...");
            e.target.setAttribute("disabled", true);
            
            try {
                let url = await getImgURL(updatedProfileImg);
                console.log(url);
                // You can now use this URL to update your profile or do whatever you need
                axios.post(import.meta.env.VITE_SERVER_URL + "/update-profile-img", {url},{
                    headers:{
                        'Authorization': `Bearer ${access_token}`
                    }
                })
                .then(({data}) =>{
                    let newUserAuth = {...userAuth, profile_img : data.profile_img}
                    storeInSession("user", JSON.stringify(newUserAuth));
                    setUserAuth(newUserAuth);
                    setUpdatedProfileImg(null)
                    toast.dismiss(loading)
                    e.target.removeAttribute("disabled");
                    toast.success("Image uploaded successfully");
                })
                .catch((err) =>{
                    toast.dismiss(loading)
                    e.target.removeAttribute("disabled");
                    toast.error("Image uploaded successfully");
                })
                
            } catch (error) {
                console.error("Upload failed:", error);
                toast.error(error.message || "Failed to upload image");
            } finally {
                toast.dismiss(loading);
                e.target.removeAttribute("disabled");
            }
        }
    }

    const handelSummit = (e) =>{
        e.preventDefault();

        let form = new FormData(editProfileRef.current);
        let formData = { };
        for(let [key, value] of form.entries()){
            formData[key] = value;
        }

        let { username, bio, youtube, gihub, twitter, website, instagram, email, facebook} = formData;
        console.log(youtube, username)
        if(username.length < 3){
            return toast.error(`username should be atleast of 3 letters`)
        }else if(bio.length >bioLimit){
            return toast.error(`Bio should be within ${bioLimit}`)
        }
        let loading = toast.loading("updating....")

        e.target.setAttribute("disabled", true)
        axios.post(import.meta.env.VITE_SERVER_URL + "/update-profile", {username, bio, social_links:{ youtube, facebook, gihub, instagram, twitter, website}},{
            headers:{
                'Authorization': `Bearer ${access_token}`
            }
        })

        .then(({data}) => {
            if(userAuth.username != data.username){
                let newUserAuth = {...userAuth, username: data.username};
                storeInSession("user", JSON.stringify(newUserAuth));
                setUserAuth(newUserAuth)
            }

            toast.dismiss(loading);
            e.target.removeAttribute("disabled");
            toast.success("profiled updated")
        })
        .catch((response) =>{
            toast.dismiss(loading)
            e.target.removeAttribute("disabled");
            toast.error(response.data.error);
        })



    }

    return(
        <AnimationWrapper>
            {
                loading ? <Loader/> : 
                <form className="w-full" ref={editProfileRef}>
                    <Toaster/>
                    <h1 className="max-md:hidden text-xl font-medium">Edit Profile</h1>

                    <div className="flex flex-col lg:flex-row items-start py-10 gap-8 lg:gap-10">
                        <div className="max-lg:center mb-5">
                            <label htmlFor="uploadImg" id="profileImgLable" className="relative block w-48 h-48 bg-grey rounded-full overflow-hidden">
                                <div className="w-full h-full absolute top-0 left-0 flex items-center justify-center opacity-0 text-white bg-black/50 hover:opacity-100 cursor-pointer">
                                    Upload Image
                                </div>
                                <img src={profile_img} className="w-full h-full object-cover" ref={profileImgEle} />
                            </label>
                            <input 
                                type="file" 
                                id="uploadImg" 
                                accept=".jpeg, .png, .jpg" 
                                hidden 
                                onChange={handelImagePreview}
                            />
                            <button className="btn-light mt-5 max-lg:center lg:w-full px-10" onClick={handleImageUpload}>
                                Upload
                            </button>
                        </div>

                        <div className="w-full">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <InputBox 
                                        name="fullname" 
                                        type="text" 
                                        value={fullname} 
                                        placeholder="Full Name" 
                                        icon={<User className="absolute top-4 left-2"/>}
                                        disable={true}
                                    />
                                </div>
                                <div>
                                    <InputBox 
                                        name="email" 
                                        type="email" 
                                        value={email} 
                                        placeholder="Email" 
                                        icon={<Mail className="absolute top-4 left-2"/>}
                                        disable={true}
                                    />
                                </div>
                            </div>

                            <InputBox 
                                type="text" 
                                placeholder="Username" 
                                defaultValue={profile_username} 
                                name="username" 
                                icon={<AtSign className="absolute top-4 left-2"/>}
                            />
                            <p className="text-dark-grey mt-2 text-sm">
                                Username will be visible to all users who visit your profile
                            </p>

                            <textarea 
                                name="bio"
                                maxLength={bioLimit}
                                defaultValue={bio}
                                className="input-box h-64 lg:h-40 resize-none leading-7 mt-5 pl-5"
                                placeholder="Bio"
                                onChange={handleCharacterChange}
                            />

                            <p className="text-dark-grey text-right mt-1">
                                {characterLeft} characters left
                            </p>

                            <p className="my-6 text-dark-grey">Add your social handels</p>
                            <div className="md:grid  md:grid-cols-2 gap-x-6">
                            {Object.keys(social_links).map((key, i) => (
                                        <InputBox
                                            key={i}
                                            name={key}
                                            type="text"
                                            defaultValue={social_links[key]}
                                            placeholder="https://"
                                            icon={socialIcons[key.toLowerCase()] || <LinkIcon className="absolute top-4 left-2" />}
                                        />
                            ))}
                            </div>

                            <button className="btn-dark w-auto px-10" type="submit" onClick={handelSummit}>Update</button>
                        </div>
                    </div>
                </form>
            }
        </AnimationWrapper>
    )
}

export default EditProfile