import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { useParams, Link } from "react-router-dom";
import AnimationWrapper from "../common/page-animation";
import { Check, Copy, Loader } from "lucide-react";
import { UserContext } from "../App";
import AboutUser from "../components/about.component";
import { useScroll } from "framer-motion";
import { filterPaginationData } from "../common/filter-pagination-data";
import InPageNavigation from "../components/inpage-navigation.component";
import NoDataMessage from "../components/nodata.component";
import BlogPostCard from "../components/blog-post.component";
// import LoadMoreDataBtn from "../components/load-more.component";
import PageNotFound from "./404.page";
import { useAuth } from "../contexts/AuthContext";
import { Toaster } from "react-hot-toast";

export const profileStructure = {
  personal_info: {
    fullname: "",
    email: "",
    username: "",
    bio: "",
    profile_img: "",
    tip_address: "",
  },
  social_links: {
    youtube: "",
    instagram: "",
    facebook: "",
    twitter: "",
    github: "",
    website: "",
  },
  account_info: {
    total_posts: 0,
  },
  joinedAt: "",
};

const ProfilePage = () => {
  const { id: profileId } = useParams();
  const [profile, setProfile] = useState(profileStructure);
  const [loading, setLoading] = useState(true);
  const [blogs, setBlogs] = useState(null);
  const [profileLoaded, setProfileLoaded] = useState("");
  const [copied, setCopied] = useState(false);

  const {
    personal_info: {
      fullname,
      email,
      username: profile_username,
      bio,
      profile_img,
      tip_address,
    },
    social_links,
    account_info: { total_posts },
    joinedAt,
  } = profile;

  const { userName } = useAuth();
  const username = userName;

  const fetchUserProfile = () => {
    console.log("Fetching profile for:", profileId);
    axios
      .post(import.meta.env.VITE_SERVER_URL + "/get-user-profile", {
        username: profileId,
      })
      .then(({ data }) => {
        console.log("Profile API response:", data);
        if (data.user != null) {
          setProfile(data.user);
          console.log("Profile set:", data.user);
          getBlogs({ user_id: profileId });
        } else {
          console.warn("No user found.");
        }
        setProfileLoaded(profileId);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching profile:", err);
        setLoading(false);
      });
  };

  const getBlogs = (user_id) => {
    console.warn("Fetching blogs for user_id:", user_id.user_id);
    if (!user_id) {
      console.warn("user_id missing for blog fetch.");
      return;
    }

    axios
      .get(import.meta.env.VITE_SERVER_URL + "/api/search-blogs", {
        params: {
          username: user_id.user_id,
        },
      })
      .then(async ({ data }) => {
        console.log("Blogs API response:", data);
        console.log("JSON data:", JSON.stringify(data, null, 2));
        if (data.blogs) {
          console.log("Formatted blog data:", data.blogs);
          setBlogs(data.blogs);
          console.log("Blogs set:", data.blogs);
        }
      })
      .catch((err) => {
        console.error("Error fetching blogs:", err);
      });
  };

  useEffect(() => {
    console.log("useEffect triggered");
    console.log("profileId:", profileId);
    console.log("profileLoaded:", profileLoaded);
    console.log("blogs:", blogs);

    if (profileId !== profileLoaded) {
      console.log("Resetting state due to profileId change");
      resetStates();
      fetchUserProfile();
    }
  }, [profileId]);

  const resetStates = () => {
    console.log("Resetting profile and blogs state...");
    setProfile(profileStructure);
    setBlogs(null);
    setProfileLoaded("");
    setLoading(true);
  };

  const handelCopyAdderss = async () => {
    try {
      await navigator.clipboard.writeText(tip_address);
      setCopied(true);
      toast.success("Address copied to clipboard!");
    } catch (err) {
      toast.error("Address failed to copied!");
      console.error("Failed to copy!", err);
    }
  };

  return (
    <>
      <AnimationWrapper>
        {loading ? (
          <div className="flex justify-center items-center min-h-[300px]">
            <Loader className="animate-spin h-10 w-10 text-gray-500" />
          </div>
        ) : profile_username?.length ? (
          <section className="h-cover md:flex flex-row-reverse items-start gap-5 min-[1100px]:gap-12 ">
            <div className="flex flex-col max-md:items-center gap-5 min-w-[250px] md:w-[50%] md:pl-8 md-border-1 border-grey md:sticky md:top-[100px] md:py-10">
              <img
                src={profile_img}
                className="w-48 h-48 rounded-full md:w-32 md:h-32 bg-grey"
                alt="Profile"
              />
              <h1 className="text-2xl font-medium">@{profile_username}</h1>
              <p className="text-xl capitalize h-6">{fullname}</p>
              <div className="col-span-2 flex gap-4 items-center">
                <button className="pt-4" onClick={handelCopyAdderss}>
                  {/* {copied ? <Check size={"20px"} /> : <Copy size={"20px"} />} */}
                  <p className="text-sm text-gray-500">Tip:{tip_address}</p>
                </button>
              </div>
              <p>{total_posts.toLocaleString()} Blogs</p>
              <div className="flex gap-4 mt-2">
                {profileId === username ? (
                  <Link
                    to="/settings/edit-profile"
                    className="btn-light rounded-md"
                  >
                    Edit Profile
                  </Link>
                ) : null}
              </div>
              <AboutUser
                className="max-md:hidden"
                bio={bio}
                social_links={social_links}
                joinedAt={joinedAt}
              />
            </div>

            <div className="max-md:mt-12 w-full">
              <InPageNavigation
                routes={["blogs published", "about"]}
                defaultHidden={["about"]}
              >
                <>
                  {blogs == null ? (
                    <div className="flex justify-center py-10">
                      <Loader className="animate-spin h-8 w-8 text-gray-500" />
                    </div>
                  ) : !blogs.length ? (
                    <NoDataMessage message="No blog published by this user yet" />
                  ) : (
                    blogs.map((blog, i) => (
                      <AnimationWrapper
                        transition={{ duration: 1, delay: i * 0.1 }}
                        key={blog.blog_id}
                      >
                        <BlogPostCard
                          content={blog}
                          author={blog.author.personal_info}
                          activity={blog.activity}
                          publishedAt={blog.publishedAt}
                        />
                      </AnimationWrapper>
                    ))
                  )}

                  {/* <LoadMoreDataBtn state={blogs} fetchDataFun={getBlogs} /> */}
                </>
                <AboutUser
                  bio={bio}
                  social_links={social_links}
                  joinedAt={joinedAt}
                />
              </InPageNavigation>
            </div>
          </section>
        ) : (
          <PageNotFound />
        )}
      </AnimationWrapper>
      <ToastContainer position="bottom-right" />
    </>
  );
};

export default ProfilePage;
