import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Animationrapper from "../common/page-animation";
import { Loader } from "lucide-react";
import { UserContext } from "../App";
import AboutUser from "../components/about.component";
import { useScroll } from "framer-motion";
import { filterPaginationData } from "../common/filter-pagination-data";
import InPageNavigation from "../components/inpage-navigation.component";
import NoDataMessage from "../components/nodata.component";
import BlogPostCard from "../components/blog-post.component";
import LoadMoreDataBtn from "../components/load-more.component";
import PageNotFound from "./404.page";

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
  let [blogs, setBlogs] = useState(null);
  let [profileLoaded, setProfileLoaded] = useState("");
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
        // console.log(data.user);
        if(data.user != null){
            setProfile(data.user);

        }
        setProfileLoaded(profileId);
        getBlogs({ user_id: data.user._id });
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };


  const getBlogs = ({ page = 1, user_id }) => {
    user_id = user_id == undefined ? blogs.user_id : user_id;
    axios
      .post(import.meta.env.VITE_SERVER_URL + "/search-blogs", {
        author: user_id,
        page,
      })
      .then(async ({ data }) => {
        let formatedData = await filterPaginationData({
          state: blogs,
          data: data.blogs,
          page,
          countRoute: "/search-blogs-count",
          data_to_send: { author: user_id },
        }).catch((err) => {
          console.error("Error fetching blogs:", err);
        });

        formatedData.user_id = user_id;
        console.log(formatedData);
        setBlogs(formatedData);
      });
  };


  useEffect(() => {
    if (profileId != profileLoaded) {
      setBlogs(null);
    }
    if (blogs == null) {
      resetStates();
      fetchUserProfile();
    }
  }, [profileId, blogs]);

  const resetStates = () => {
    setProfile(profileStructure);
    fetchUserProfile();
    setProfileLoaded("");
  };
  return (
    <Animationrapper>
      {loading ? (
        <Loader />
      ) : (
        // Add your profile page rendering logic here
        profile_username.length?
        <section className="h-cover md:flex flex-row-reverse items-start gap-5 min-[1100px]:gap-12 ">
          <div className="flex flex-col max-md:items-center gap-5 min-w-[250px] md:w-[50%] md:pl-8 md-border-1 border-grey md:sticky md:top-[100px] md:py-10">
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
            <AboutUser
              className=" max-md:hidden "
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
                  <Loader />
                ) : !blogs.results.length ? (
                  <NoDataMessage message="No blog published with this tag till now" />
                ) : (
                  blogs.results.map((blog, i) => {
                    return (
                      <Animationrapper
                        transition={{ duration: 1, delay: i * 0.1 }}
                        key={i}
                      >
                        <BlogPostCard
                          content={blog}
                          author={blog.author.personal_info}
                        />
                      </Animationrapper>
                    );
                  })
                )}
                <LoadMoreDataBtn state={blogs} fetchDataFun={getBlogs} />
              </>
              <AboutUser
                bio={bio}
                social_links={social_links}
                joinedAt={joinedAt}
              />
            </InPageNavigation>
          </div>
        </section>
        :
        <PageNotFound/>
      )}
    </Animationrapper>
  );
};

export default ProfilePage;
