// comment-field.component.jsx
import { useContext, useState } from "react";
import { UserContext } from "../App";
import { Toaster, toast } from "react-hot-toast";
import { BlogContext } from "../pages/blog.page";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { addCommentToContract } from "../lib/contractInteraction";
import { useActiveAccount } from "thirdweb/react";

const CommentField = ({ action, index = undefined, replyingTo, setReplying = undefined }) => {
  const {
    blogData,
    blogData: {
      blog_id,
      author: { author_address },
      comments,
      comments: { results: commentsArr },
      commentCount
    },
    setBlogData,
    setTotalParentCommentsLoaded,
  } = useContext(BlogContext);
  // let {
  //   userAuth: { access_token, username, profile_img, fullname },
  // } = useContext(UserContext);

  const { userName: username, isLoggedIn, avatarUrl: profile_img, userAddress } = useAuth();

  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const account = useActiveAccount();
  const address = account?.address || userAddress;
  console.warn("address at comment-field", address)

  const handleComment = async () => {
    if (!isLoggedIn) {
      toast.error("Please login to comment");
      return;
    }

    if (!comment.length) {
      toast.error("Please write a comment before submitting");
      return;
    }

    setIsSubmitting(true);
    await addCommentToContract(     // returns the transaction hash, comment contains the actual comment
      blog_id,
      comment,
      account
    )
      .then(() => {
        console.log("Comment response at comment-field", comment);
        setComment("");
        let newComment = {
          blog_id: blog_id,
          comment: comment,
          commentedAt: new Date().toISOString(),
          commented_by: {
            personal_info: {
              username,
              profile_img,
              commenter_address: address,
            },
          },
        };
        
        let newCommentArr;
        newCommentArr = [newComment, ...commentsArr];

        let parentCommentIncrementVal = 1;
        setBlogData({
          ...blogData,
          comments: { ...comments, results: newCommentArr },
          commentCount: commentCount + 1,
        });

        setTotalParentCommentsLoaded(
          (preVal) => preVal + parentCommentIncrementVal
        );
        setIsSubmitting(false)
      })
      .catch((err) => {
        console.log(err);
        setIsSubmitting(false)
      });
  };

  return (
    <>
      <Toaster />
      <textarea
        value={comment}
        placeholder="What do you think?"
        className="input-box pl-8 placeholder:text-dark-grey resize-none h-[150px] overflow-auto"
        onChange={(e) => setComment(e.target.value)}
      />
      <button
        className={`mt-2 p-2 btn-dark ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""
          }`}
        onClick={handleComment}
      >
        {isSubmitting ? "Submitting..." : action}
      </button>
    </>
  );
};

export default CommentField;