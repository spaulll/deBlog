import { useContext, useState } from "react";
import { UserContext } from "../App";
import { Toaster, toast } from "react-hot-toast";
import { BlogContext } from "../pages/blog.page";
import axios from "axios";
const CommentField = ({ action }) => {
  let {blogData,
    blogData: {
      _id,
      author: { _id: blog_author }, comments,comments:{results:commentArr},activity, activity:{total_comments, total_parent_comments}},setBlogData, setTotalParentCommentsLoaded
  } = useContext(BlogContext);
  let {
    userAuth: { access_token, username, profile_img,fullname },
  } = useContext(UserContext);
  const [comment, setComment] = useState("");
  const handelComment = () => {
    if (access_token) {
      if (!comment.length) {
        return toast.error("Make some comment on then you can submmit");
      } else {
        axios.post(
          import.meta.env.VITE_SERVER_URL + "/add-comment",
          {
            _id, // You might want to use blog_id instead of _id depending on your API
            blog_author,
            comment,
          },
          {
            headers: {
              'Authorization': `Bearer ${access_token}`,
            },
          }
        )
        .then(({data})=>{
            setComment("");
            data.commented_by = {personal_info:{username,profile_img,fullname}}
            let newCommentArr;
            data.childreanLevel =0;
            newCommentArr =[data, ...commentArr]
            let parentCommentIncrementVal =1;
            setBlogData({...blogData, comments:{ ...comments,results: newCommentArr}, activity:{...activity, total_comments: total_comments+1, total_parent_comments: total_parent_comments + parentCommentIncrementVal }})

            setTotalParentCommentsLoaded(preVal => !preVal + parentCommentIncrementVal)
        })
        .catch((err)=>{
            console.log(err)
        })
      }
    } else {
      return toast.error("please!! Log in");
    }
  };

  return (
    <>
      <Toaster />
      <textarea
        value={comment}
        placeholder="what do you think"
        className="input-box pl-8 placeholder:text-dark-grey resize-none h-[150px] overflow-auto"
        onChange={(e) => setComment(e.target.value)}
      ></textarea>
      <button className="mt-2 p-2 btn-dark" onClick={handelComment}>
        {action}
      </button>
    </>
  );
};

export default CommentField;
