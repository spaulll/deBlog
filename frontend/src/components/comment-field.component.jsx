// CommentField.jsx
import { useContext, useState } from "react";
import { UserContext } from "../App";
import { Toaster, toast } from "react-hot-toast";
import { BlogContext } from "../pages/blog.page";
import axios from "axios";

const CommentField = ({ action, index, replyingTo, setReplying }) => {
  const {
    blogData,
    blogData: {
      _id,
      author: { _id: blog_author },
      comments,
      comments: { results: commentArr },
      activity,
      activity: { total_comments, total_parent_comments },
    },
    setBlogData,
    setTotalParentCommentsLoaded,
  } = useContext(BlogContext);
  let {
    userAuth: { access_token, username, profile_img,fullname },
  } = useContext(UserContext);

  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleComment = async () => {
    if (!access_token) {
      toast.error("Please login to comment");
      return;
    }

    if (!comment.trim()) {
      toast.error("Please write a comment before submitting");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/add-comment`,
        {
          _id,
          blog_author,
          comment: comment.trim(),
          replying_to: replyingTo,
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      const { comment: commentText, commentedAt, _id: commentId, children } = response.data;
      
      if (!commentId) {
        throw new Error('Invalid response from server');
      }

      // Prepare the new comment matching the server response structure
      const newComment = {
        _id: commentId,
        comment: commentText,
        commentedAt,
        blog_id: _id,
        children: children || [],
        commented_by: {
          personal_info: { username, profile_img, fullname },
          _id: userAuth._id // Add user ID from auth context
        },
        isReplyLoaded: false,
      };

      let newCommentArr;
      if (replyingTo) {
        // Handle reply
        if (!commentArr[index]) {
          console.error('Parent comment not found');
          return;
        }

        commentArr[index].children = commentArr[index].children || [];
        commentArr[index].children.push(commentId);
        newComment.childrenLevel = commentArr[index].childrenLevel + 1;
        newComment.parent = replyingTo;

        // Insert reply after the parent comment
        newCommentArr = [...commentArr];
        newCommentArr.splice(index + 1, 0, newComment);
        
        setReplying(false);
      } else {
        // Handle new parent comment
        newComment.childrenLevel = 0;
        newCommentArr = [newComment, ...(commentArr || [])];
      }

      const parentCommentIncrementVal = replyingTo ? 0 : 1;

      // Update blog data atomically
      setBlogData(prevBlogData => ({
        ...prevBlogData,
        comments: {
          ...prevBlogData.comments,
          results: newCommentArr,
        },
        activity: {
          ...prevBlogData.activity,
          total_comments: prevBlogData.activity.total_comments + 1,
          total_parent_comments: prevBlogData.activity.total_parent_comments + parentCommentIncrementVal,
        },
      }));

      setTotalParentCommentsLoaded(prev => prev + parentCommentIncrementVal);
      setComment("");
      toast.success(replyingTo ? "Reply added successfully" : "Comment added successfully");

    } catch (error) {
      console.error("Error details:", error);
      toast.error(error.response?.data?.error || "Failed to add comment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Toaster />
      <textarea
        value={comment}
        placeholder="What do you think?"
        className="input-box pl-8 placeholder:text-dark-grey resize-none h-[150px] overflow-auto"
        onChange={(e) => setComment(e.target.value)}
        disabled={isSubmitting}
      />
      <button 
        className={`mt-2 p-2 btn-dark ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`} 
        onClick={handleComment}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Submitting...' : action}
      </button>
    </>
  );
};

export default CommentField;