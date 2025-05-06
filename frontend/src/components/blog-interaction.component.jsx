import { useContext, useEffect, useState } from "react";
import { BlogContext } from "../pages/blog.page";
import { Heart, MessageSquare, TwitterIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import {
  likePost,
  isPostLikedByUser,
  getPostOwner,
} from "../lib/contractInteraction";
import { useActiveAccount } from "thirdweb/react";
import { LoadingOverlay } from "./register.modal-component";
import donation from "../imgs/donation.svg";
import ApproveTransactionModal from "./tipping.modal";
import axios from "axios";

const BlogInteraction = () => {
  const {
    blogData,
    setBlogData,
    isLikedByUser,
    setIsLikedByUser,
    authorTipAddress,
    setAuthorTipAddress,
    setCommentsWrapper,
  } = useContext(BlogContext);
  const [hadelLoading, setHandelLoading] = useState(false);
  const [hadelSupportLoading, setHandelSupportLoading] = useState(false);

  const account = useActiveAccount();
  const address = useActiveAccount()?.address;
  console.log("address at BlogInteraction", address);
  const [postOwner, setPostOwner] = useState(null);
  
  useEffect(() => {
    if (address && blogData) {
      checkIfUserLiked();
    }
    getPostOwner(blogData.blog_id).then(setPostOwner);
    console.log("BlogData at BlogInteraction", JSON.stringify(blogData));
  }, [address, blogData]);

  useEffect(() => {
    console.log("postOwner at BlogInteraction", postOwner);
    // If you need to set the authorTipAddress from postOwner, do it here
    if (postOwner && !authorTipAddress) {
      setAuthorTipAddress(postOwner);
    }
  }, [postOwner, authorTipAddress, setAuthorTipAddress]);

  const invalidateBlogCache = async () => {
      try {
        await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/invalidate-blog-cache`, 
          { operation: "invalidate" },
          {
            withCredentials: true,
            headers: {
              "Content-Type": "application/json", 
            },
          }
        );
        console.log("Blog cache invalidated successfully");
      } catch (error) {
        console.error("Failed to invalidate blog cache:", error);
      }
    };

  const checkIfUserLiked = async () => {
    try {
      if (!blogData || !blogData.blog_id) return;
      const liked = await isPostLikedByUser(blogData.blog_id, address);
      setIsLikedByUser(liked);
    } catch (error) {
      console.error("Error checking like status:", error);
    }
  };

  const handleLike = async () => {
    if (!address) {
      toast.error("Please connect your wallet to like the post.");
      return;
    }
    if (!blogData || !blogData.blog_id) {
      toast.error("Blog data is not available.");
      return;
    }
    if (isLikedByUser) {
      toast.error("You have already liked this post.");
      return;
    }
    try {
      setHandelLoading(true);
      const hash = await likePost(blogData.blog_id, account);
      if (!hash) {
        throw new Error("Failed to like the post.");
      }
      setIsLikedByUser(true);
      invalidateBlogCache();
      toast.success("Post liked successfully.");
      setHandelLoading(false);
      setBlogData((prev) => ({
        ...prev,
        likes: prev.likes + 1,
      }));
    } catch (error) {
      console.error("Error liking post:", error);
      toast.error("Failed to like the post.");
      setHandelLoading(false);
    }
  };

  const handelDonation = () => {
    if (!address) {
      toast.error("Please connect your wallet to tip the author.");
      return;
    }
    if (!blogData || !blogData.blog_id) {
      toast.error("Blog data is not available.");
      return;
    }
    if (!authorTipAddress) {
      toast.error("Author's wallet address is not available for tipping.");
      return;
    }
    
    // Open the support/tip modal
    setHandelSupportLoading(true);
    console.log("Opening tip modal with author address:", authorTipAddress);
  };

  return (
    <>
      <ToastContainer position="bottom-right" />
      <hr className="border-grey my-3" />
      <div className="flex gap-6 justify-between">
        <div className="flex gap-3 items-center">
          <button
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isLikedByUser ? "bg-red-200" : "bg-grey/80"
            }`}
            onClick={handleLike}
          >
            {isLikedByUser ? (
              <Heart color="#c01111" className="fill-[#c01111]" />
            ) : (
              <Heart />
            )}
          </button>
          <p className="text-dark-grey text-xl">{blogData?.likes || 0}</p>

          <button
            className="w-10 h-10 rounded-full flex items-center justify-center bg-grey/80"
            onClick={() => setCommentsWrapper((prev) => !prev)}
          >
            <MessageSquare />
          </button>

          <p className="text-dark-grey text-xl">
            {blogData?.commentCount || 0}
          </p>
          <button
            className="w-10 h-10 rounded-full flex items-center justify-center bg-grey/80"
            onClick={handelDonation}
          >
            <img src={donation} className="w-8" alt="Donation" />
          </button>
        </div>
        <div className="flex gap-6 items-center">
          {address === postOwner && (
            <Link
              to={`/editor/${blogData.blog_id}`}
              className="undeline hover:text-purple"
            >
              Edit
            </Link>
          )}
          <Link
            to={`https://twitter.com/intent/tweet?text=${
              blogData?.title || "Check this out!"
            }&url=${window.location.href}`}
            target="_blank"
          >
            <TwitterIcon className="hover:text-twitter" />
          </Link>
        </div>
      </div>
      <hr className="border-grey my-3" />
      
      {/* Render the modal only when hadelSupportLoading is true */}
      {hadelSupportLoading && (
        <ApproveTransactionModal 
          setHandelSupportLoading={setHandelSupportLoading} 
          authorTipAddress={authorTipAddress} 
        />
      )}
      
      {hadelLoading && (
        <LoadingOverlay
          isLoading={hadelLoading}
          text="Wait! liking the post..."
        />
      )}
    </>
  );
};

export default BlogInteraction;