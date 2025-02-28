import { useContext, useEffect } from "react";
import { BlogContext } from "../pages/blog.page";
import { Heart, MessageSquare, TwitterIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { UserContext } from "../App";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";

const BlogInteraction = () => {
  let {
    blogData,
    blogData: {
      _id,
      title,
      blog_id,
      activity,
      activity: { total_likes, total_comments },
      author: {
        personal_info: { username: author_username },
      },
    },
    setBlogData,
    isLikedByUser,
    setIsLikedByUser,
    setCommentsWrapper,
  } = useContext(BlogContext);

  let {
    userAuth: { username, access_token },
  } = useContext(UserContext);

  useEffect(() => {
    if (access_token) {
      axios
        .post(
          import.meta.env.VITE_SERVER_URL + "/isliked-by-user",
          {
            _id,
          },
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          }
        )
        .then(({ data }) => {
          // Server returns {results: true/false}
          setIsLikedByUser(Boolean(data.results));
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, []);

  const handelLike = () => {
    if (access_token) {
      // Create temporary variables for optimistic update
      const newIsLiked = !isLikedByUser;
      const newTotalLikes = newIsLiked ? total_likes + 1 : total_likes - 1;

      // First update UI optimistically
      setIsLikedByUser(newIsLiked);
      setBlogData({
        ...blogData,
        activity: {
          ...activity,
          total_likes: newTotalLikes,
        },
      });

      // Then make the API call
      axios
        .post(
          import.meta.env.VITE_SERVER_URL + "/like-blog",
          {
            _id,
            isLikedByUser: !newIsLiked, // Send the previous state
          },
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          }
        )
        .then(({ data }) => {
          // Only needed if you want to verify the server state
          console.log(data);
        })
        .catch((err) => {
          // Revert changes if the API call fails
          setIsLikedByUser(!newIsLiked);
          setBlogData({
            ...blogData,
            activity: {
              ...activity,
              total_likes: total_likes,
            },
          });
          toast.error("Failed to update like status");
        });
    } else {
      toast.error("please do log in");
    }
  };

  return (
    <>
      <Toaster />
      <hr className="border-grey my-3" />
      <div className="flex gap-6 justify-between">
        <div className="flex gap-3 items-center">
          <button
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isLikedByUser ? "bg-[#efbebe]" : "bg-grey/80"
            }`}
            onClick={handelLike}
          >
            {isLikedByUser ? (
              <Heart color="#c01111" className="fill-[#c01111]" />
            ) : (
              <Heart />
            )}
          </button>
          <p className="text-dark-grey text-xl">{total_likes}</p>

          <button
            className="w-10 h-10 rounded-full flex items-center justify-center bg-grey/80"
            onClick={() => setCommentsWrapper(preVal => !preVal)}
          >
            <MessageSquare />
          </button>
          <p className="text-dark-grey text-xl">{total_comments}</p>
        </div>
        <div className="flex gap-6 items-center">
          {username === author_username && (
            <Link
              to={`/editor/${blog_id}`}
              className="undeline hover:text-purple"
            >
              Edit
            </Link>
          )}
          <Link
            to={`https://twitter.com/intend/tweet?${title}&url=${location.href}`}
          >
            <TwitterIcon className="hover:text-twitter" />
          </Link>
        </div>
      </div>
      <hr className="border-grey my-3" />
    </>
  );
};

export default BlogInteraction;
