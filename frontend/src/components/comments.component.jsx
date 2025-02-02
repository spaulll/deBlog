import { useContext } from "react";
import { BlogContext } from "../pages/blog.page";
import { X } from "lucide-react";
import CommentField from "./comment-field.component";
import axios from "axios";
import NoDataMessage from "./nodata.component";
import AnimationWrapper from "../common/page-animation";
import CommentCard from "./comment-card.component";

export const fetchComments = async ({
  skip = 0,
  blog_id,
  setParentCommentCountFun,
  comment_array = null,
}) => {
  let res;
  await axios
    .post(import.meta.env.VITE_SERVER_URL + "/get-blog-comment", {
      blog_id,
      skip,
    })
    .then(({ data }) => {
      data.map((comment) => {
        comment.childreanLevel = 0;
      });
      setParentCommentCountFun((preVal) => preVal + data.length);
      if (comment_array == null) {
        res = { results: data };
      } else {
        res = { results: [...comment_array, ...data] };
      }
    });
  return res;
};

const CommentsContainer = () => {
  let {
    blogData,
    blogData: {_id,
      title,
      comments: { results: commentsArr },
      activity: { total_parent_comments },
    },
    commentWrapper,
    setCommentWrapper,
    totalParentCommentsLoaded,
    setTotalParentCommentsLoaded,
    setBlogData,
  } = useContext(BlogContext);

  const LoadMoreComment = async () => {
    let newCommentsArr = await fetchComments({
      skip: totalParentCommentsLoaded,
      blog_id: _id,
      setParentCommentCountFun: setTotalParentCommentsLoaded,
      comment_array: commentsArr,
    });
    setBlogData({ ...blogData, comments: newCommentsArr });
  };

  return (
    <div
      className={
        "max-sm:w-full fixed " +
        (commentWrapper
          ? " top-0 sm:right-0 "
          : " top-[100%] sm:right-[-100%] ") +
        " duration-700 max-sm:right-0 sm:top-0 w-[50%] min-w-[350px] h-full z-50 bg-white shadow-2xl p-8 px-16 overflow-y-auto overflow-x-hidden "
      }
    >
      <div className="relative">
        <h1 className=" text-xl font-medium">comments</h1>
        <p className="text-xl mt-2 w-[70%] text-dark-grey ">{title}</p>
        <button
          className=" absolute top-0 right-0 flex justify-center rounded-full bg-grey"
          onClick={() => setCommentWrapper((preVal) => !preVal)}
        >
          <X />
        </button>
      </div>
      <hr className=" border-dark-grey my-6 w-[120%] -ml-10" />
      <CommentField action={"comment"} />
      {commentsArr && commentsArr.length ? (
        commentsArr.map((comment, i) => {
          return (
            <AnimationWrapper key={i}>
              <CommentCard
                index={i}
                lefVal={comment.childreanLevel}
                commentData={comment}
              />
            </AnimationWrapper>
          );
        })
      ) : (
        <NoDataMessage message="no comment" />
      )}
      {total_parent_comments > totalParentCommentsLoaded ? (
        <button
          className="text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2"
          onClick={LoadMoreComment}
        >
          Load more
        </button>
      ) : (
        ""
      )}
    </div>
  );
};
export default CommentsContainer;
