import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Animationrapper from "../common/page-animation";
import { Loader } from "lucide-react";
import { UserContext } from "../App";
import AboutUser from "../components/about.component";
import { useScroll } from "framer-motion";

export const profileStructure = {
  personal_info: {
    fullname: "", // Default empty string for full name
    email: "", // Default empty string for email
    username: "", // Default empty string for username
    bio: "", // Default empty string for bio
    profile_img: "", // Default empty string for profile image URL
  },
  social_links: {
    youtube: "", // Default empty string for YouTube link
    instagram: "", // Default empty string for Instagram link
    facebook: "", // Default empty string for Facebook link
    twitter: "", // Default empty string for Twitter link
    github: "", // Default empty string for GitHub link
    website: "", // Default empty string for personal website link
  },
  account_info: {
    total_posts: 0, // Default 0 for total posts
    total_reads: 0, // Default 0 for total reads
  },
  joinedAt: "", // Changed default to an empty string for consistency
};

const ProfilePage = () => {
  let { id: profileId } = useParams();
  let [profile, setProfile] = useState(profileStructure);
  let [loading, setLoading] = useState(true);
  let [blogs, setBlogs] = useState(null)
  let {
    personal_info: {
      fullname,
      email,
      username: profile_username,
      bio,
      profile_img,
    },
    social_links,
    account_info: { total_posts, total_reads },
    joinedAt,
  } = profile;
  let {
    userAuth: { username },
  } = useContext(UserContext);
  const fetchUserProfile = () => {
    axios
      .post(import.meta.env.VITE_SERVER_URL + "/get-user-profile", {
        username: profileId,
      })
      .then(({ data }) => {
        console.log(data.user);
        setProfile(data.user);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    reseStates()
    fetchUserProfile();
  }, [profileId]);

  
const reseStates = ()=>{
    setProfile(profileStructure)
    fetchUserProfile()
}
  return (
    <Animationrapper>
      {loading ? (
        <Loader />
      ) : (
        // Add your profile page rendering logic here
        <section className="h-cover md:flex flex-row-reverse items-start gap-5 min-[1100px]:gap-12 ">
          <div className="flex flex-col max-md:items-center gap-5 min-w-[250px] ">
            <img
              src={profile_img}
              className="w-48 h-48 rounded-full md:w-32 md:h-32 bg-grey "
            />
            <h1 className="text-2xl font-medium ">@{profile_username}</h1>
            <p className=" text-xl capitalize h-6 ">{fullname}</p>
            <p className="">
              {total_posts.toLocaleString()} Blogs:{" "}
              {total_reads.toLocaleString()}
            </p>
            <div className="flex gap-4 mt-2 ">
              {profileId == username ? (
                <Link
                  to="/settings/edit-profile"
                  className="btn-light rounded-md "
                >
                  Edit Profile
                </Link>
              ) : (
                " "
              )}
            </div>
            <AboutUser className=" max-md:hidden " bio={bio} social_links={social_links} joinedAt={joinedAt}/>

          </div>
        </section>
      )}
    </Animationrapper>
  );
};

export default ProfilePage;
