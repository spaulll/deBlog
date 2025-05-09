import axios from "axios";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { useParams, Link } from "react-router-dom";
import AnimationWrapper from "../common/page-animation";
import { Check, Copy, Loader, MessageSquare, Calendar, Youtube, Instagram, Github, Facebook, Twitter, Wallet, LinkIcon, BadgeDollarSign } from "lucide-react";
import InPageNavigation from "../components/inpage-navigation.component";
import NoDataMessage from "../components/nodata.component";
import BlogPostCard from "../components/blog-post.component";
import PageNotFound from "./404.page";
import { useAuth } from "../contexts/AuthContext";
import { getUserProfile } from "../lib/contractInteraction";

export const profileStructure = {
  personal_info: {
    user_address: "",
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

const socialIcons = {
  youtube: <Youtube size={20} className="hover:text-[#7d2929] transition-colors" />,
  instagram: <Instagram size={20} className="hover:text-[#83473d] transition-colors" />,
  github: <Github size={20} className="hover:text-[#292a77] transition-colors" />,
  facebook: <Facebook size={20} className="hover:text-[#4161b1] transition-colors" />,
  twitter: <Twitter size={20} className="hover:text-[#4c859a] transition-colors" />,
  website: <LinkIcon size={20} className="hover:text-[#2a6e4d] transition-colors" />
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
      user_address,
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

  const fetchUserProfile = async () => {
    console.log("Fetching profile for:", profileId);
    try {
      const userProfile = await getUserProfile(null, profileId);
      console.warn("Profile: ", userProfile);
      if (userProfile) {
        setProfile({
          personal_info: {
            user_address: userProfile.userAddress,
            username: userProfile.username,
            bio: userProfile.bio,
            profile_img: userProfile.avatarUri,
            tip_address: userProfile.tipWalletAddress,
          },
          social_links: {
            youtube: userProfile.socialLinks[0],
            instagram: userProfile.socialLinks[1],
            github: userProfile.socialLinks[2],
            facebook: userProfile.socialLinks[3],
            twitter: userProfile.socialLinks[4],
            website: userProfile.socialLinks[5],
          },
          account_info: {
            total_posts: userProfile.postCount,
          },
          joinedAt: userProfile.memberSince,
        });
        setProfileLoaded(profileId);
        setLoading(false);
        getBlogs(userProfile.userAddress);
      } else {
        console.warn("No user profile found");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setLoading(false);
    }
  };

  const getBlogs = (address) => {
    console.warn("Fetching blogs for user:", address);
    if (!address) {
      console.warn("Address missing for blog fetch.");
      return;
    }

    axios
      .get(import.meta.env.VITE_SERVER_URL + "/api/search-blogs", {
        params: {
          address: address,
        },
      })
      .then(async ({ data }) => {
        console.log("Blogs API response:", data);
        if (data.blogs) {
          setBlogs(data.blogs);
        } else {
          setBlogs([]);
        }
      })
      .catch((err) => {
        console.error("Error fetching blogs:", err);
        setBlogs([]);
      });
  };

  useEffect(() => {
    if (profileId !== profileLoaded) {
      resetStates();
      fetchUserProfile();
    }
  }, [profileId]);

  const resetStates = () => {
    setProfile(profileStructure);
    setBlogs(null);
    setProfileLoaded("");
    setLoading(true);
  };

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(tip_address);
      setCopied(true);
      toast.success("Address copied to clipboard!");

      setTimeout(() => {
        setCopied(false);
      }, 3000);
    } catch (err) {
      toast.error("Address failed to copy!");
      console.error("Failed to copy!", err);
    }
  };

  if (loading) {
    return (
      <AnimationWrapper>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <Loader className="animate-spin h-12 w-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-500">Loading profile...</p>
          </div>
        </div>
      </AnimationWrapper>
    );
  }

  if (!profile_username?.length) {
    return <PageNotFound />;
  }

  const formatDate = (unixTimestamp) => {
    if (!unixTimestamp) return "Unknown date";
    try {
      const date = new Date(unixTimestamp * 1000); // Convert seconds to ms
      const day = String(date.getDate()).padStart(2, '0');
      const month = date.toLocaleString('en-US', { month: 'short' });
      const year = String(date.getFullYear()).slice(-2); // Get last 2 digits
      return `${day} ${month}, ${year}`;
    } catch (error) {
      return "Invalid date";
    }
  };
  

  // Filter out social links that don't have values
  const activeSocialLinks = Object.entries(social_links || {}).filter(([_, value]) => value);

  return (
    <AnimationWrapper>
      <section className="h-cover md:flex flex-row-reverse items-start gap-5 min-[1100px]:gap-12">
        {/* Profile Sidebar */}
        <div className="flex flex-col max-md:items-center gap-5 min-w-[250px] md:w-[35%] md:pl-8 md:border-l border-gray-100 md:sticky md:top-[100px] md:py-10">
          {/* Profile Image */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full opacity-70 group-hover:opacity-90 transition-opacity duration-300"></div>
            <img
              src={profile_img || `https://api.dicebear.com/9.x/adventurer/svg?seed=${user_address.toLowerCase()}`}
              className="w-48 h-48 rounded-full md:w-32 md:h-32 bg-gray-100 relative z-10 object-cover border-4 border-white shadow-lg"
              alt={`${profile_username}'s profile`}
            />
          </div>

          {/* Profile Info */}
          <div className="text-center md:text-left space-y-4 w-full">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">@{profile_username}</h1>
              {bio ? (
                <p className="text-gray-600 text-sm mt-2">{bio}</p>
              ) : (
                <p className="text-gray-600 text-sm mt-2">No bio</p>
              )}
            </div>

            {/* User Address */}
            {user_address && (
              <div className="ml-1 flex items-center justify-center md:justify-start text-gray-600 gap-2 bg-gray-50 px-2 rounded-md">
                <Wallet size={16} />
                <p className="text-sm">{user_address}</p>
              </div>
            )}

            {/* Tip Address */}
            {tip_address && (
              <div
                className="flex items-center justify-between bg-gray-50 rounded-lg px-3 text-sm cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={handleCopyAddress}
              >
                <div className="flex items-center gap-2">
                  <BadgeDollarSign size={16} className="text-gray-500" />
                  <span className="text-gray-600 text-sm">
                    {tip_address.substring(0, 6)}...{tip_address.substring(tip_address.length - 4)}
                  </span>
                </div>
                {copied ? (
                  <Check size={16} className="text-green-500" />
                ) : (
                  <Copy size={16} className="text-gray-400" />
                )}
              </div>
            )}

            {/* Stats */}
            <div className="flex flex-col gap-2 bg-gray-50 px-3 rounded-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600">
                  <MessageSquare size={16} />
                  <p className="text-sm">Total Posts</p>
                </div>
                <p className="text-sm font-medium">{total_posts.toLocaleString()}</p>
              </div>

              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar size={16} />
                  <p className="text-sm">Joined deBlog on</p>
                </div>
                <p className="text-sm font-medium">{formatDate(joinedAt)}</p>
              </div>
            </div>

            {/* Social Links */}
            {activeSocialLinks.length > 0 && (
              <div className="flex gap-4 justify-center md:justify-start flex-wrap px-2">
                {activeSocialLinks.map(([platform, link]) => (
                  link && socialIcons[platform] && (
                    <a
                      href={link}
                      key={platform}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors"
                      title={platform}
                    >
                      {socialIcons[platform]}
                    </a>
                  )
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-2 w-full">
            {profileId === username && (
              <Link
                to="/settings/edit-profile"
                className="btn-light rounded-md w-full text-center py-2 flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <span>Edit Profile</span>
              </Link>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="max-md:mt-12 w-full md:w-[65%]">
          <InPageNavigation
            routes={["blogs published"]}
          >
            <>
              {blogs === null ? (
                <div className="flex justify-center py-10">
                  <Loader className="animate-spin h-8 w-8 text-gray-500" />
                </div>
              ) : !blogs.length ? (
                <NoDataMessage message="No blog published by this user yet" />
              ) : (
                <div className="space-y-6">
                  {blogs.map((blog, i) => (
                    <AnimationWrapper
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                      key={blog.blog_id}
                    >
                      <BlogPostCard
                        content={blog}
                        author={blog.author.personal_info}
                        activity={blog.activity}
                        publishedAt={blog.publishedAt}
                      />
                    </AnimationWrapper>
                  ))}
                </div>
              )}
            </>
          </InPageNavigation>
        </div>
      </section>
      <ToastContainer position="bottom-right" />
    </AnimationWrapper>
  );
};

export default ProfilePage;