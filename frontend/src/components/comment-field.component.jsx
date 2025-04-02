// CommentField.jsx
import { useContext, useState } from "react";
import { UserContext } from "../App";
import { Toaster, toast } from "react-hot-toast";
import { BlogContext } from "../pages/blog.page";
import axios from "axios";

const CommentField = ({ action, index = undefined, replyingTo, setReplying = undefined }) => {
  const {
    blogData,
    blogData: {
      _id,
      author: { _id: blog_author },
      comments,
      comments: { results: commentsArr },
      activity,
      activity: { total_comments, total_parent_comments },
    },
    setBlogData,
    setTotalParentCommentsLoaded,
  } = useContext(BlogContext);
  let {
    userAuth: { access_token, username, profile_img, fullname },
  } = useContext(UserContext);

  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleComment = async () => {
    if (!access_token) {
      toast.error("Please login to comment");
      return;
    }

    if (!comment.length) {
      toast.error("Please write a comment before submitting");
      return;
    }

    setIsSubmitting(true);
    await axios
      .post(
        `${import.meta.env.VITE_SERVER_URL}/add-comment`,
        {
          _id,
          blog_author,
          comment: comment
          // comment: comment.trim(),
          // replying_to: replyingTo,
        },
        {
          headers: {
            'Authorization': `Bearer ${access_token}`,
          },
        }
      )
      .then(({data}) => {
        setComment("");
        data.commented_by = {
          personal_info: { username, profile_img, fullname },
        };
        let newCommentArr;
        data.childrenLevel = 0;
        newCommentArr = [data, ...commentsArr];
        // if(replyingTo){
        //   commentsArr[index].children.push(data._id)
        //   data.childrenLevel = commentsArr[index].childrenLevel + 1;
        //   data.parentIndex = index;

        //   commentsArr[index].isReplyLoaded = true;

        //   commentsArr.splice(index + 1, 0, data);
        //   newCommentArr = commentsArr;

        // }else{

          
        // data.childrenLevel = 0;
        // newCommentArr = [data, ...commentsArr];
        // }
        // let parentCommentIncrementVal = replyingTo? 0 : 1;
        let parentCommentIncrementVal = 1;
        setBlogData({
          ...blogData,
          comments: { ...comments, results: newCommentArr },
          activity: {
            ...activity,
            total_comments: total_comments + 1,
            total_parent_comments:
              total_parent_comments + parentCommentIncrementVal,
          },
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
        className={`mt-2 p-2 btn-dark ${
          isSubmitting ? "opacity-50 cursor-not-allowed" : ""
        }`}
        onClick={handleComment}
      >
        {isSubmitting ? "Submitting..." : action}
      </button>
    </>
  );
};

export default CommentField;