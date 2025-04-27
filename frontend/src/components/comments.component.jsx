// comment.component.jsx
import { useContext } from "react";
import { BlogContext } from "../pages/blog.page";
import { X } from "lucide-react";
import CommentField from "./comment-field.component";
import axios from "axios";
import NoDataMessage from "./nodata.component";
import AnimationWrapper from "../common/page-animation";
import CommentCard from "./comment-card.component";
import { getCommentsFromContract } from "../lib/contractInteraction";

export const fetchComments = async ({ blog_id }) => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_SERVER_URL}/api/get-comments`,
      { params: { blog_id } }
    );
    // response.data.results is the array your backend returned
    console.log("comments response at comment.js:", response.data);
    return { results: response.data.results };
  } catch (error) {
    console.error("Error fetching comments:", error);
    return { results: [] };
  }
};

const CommentsContainer = () => {
  let {
    blogData,
    blogData: {
      blog_id,
      title,
      comments: { results: commentsArr },
      // activity: { total_parent_comments },
    },
    setBlogData,
    setCommentsWrapper,
    setTotalParentCommentsLoaded,
    commentsWrapper,
    totalParentCommentsLoaded,
  } = useContext(BlogContext);

  // const LoadMoreComment = async () => {
  //   let newCommentsArr = await fetchComments({
  //     blog_id: _id,
  //     setParentCommentCountFun: setTotalParentCommentsLoaded,
  //     comment_array: commentsArr,
  //   });
  //   setBlogData({ ...blogData, comments: newCommentsArr });
  // };

  return (
    <div
      className={
        "max-sm:w-full fixed " +
        (commentsWrapper
          ? " top-0 sm:right-0 "
          : " top-[100%] sm:right-[-100%] ") +
        " duration-700 max-sm:right-0 sm:top-0 w-[30%] min-w-[350px] h-full z-50 bg-white shadow-2xl p-8 px-16 overflow-y-auto overflow-x-hidden "
      }
    >
      <div className="relative">
        <h1 className=" text-xl font-medium">comments</h1>
        <p className="text-xl mt-2 w-[70%] text-dark-grey ">{title}</p>
        <button
          className=" absolute top-0 right-0 flex justify-center rounded-full bg-grey"
          onClick={() => setCommentsWrapper((preVal) => !preVal)}
        >
          <X />
        </button>
      </div>
      <hr className=" border-dark-grey my-6 w-[120%] -ml-10" />
      <CommentField action={"comment"} />
      {
        commentsArr && commentsArr.length ? (
          commentsArr.map((comment, i) => {
            return (
              <AnimationWrapper key={i}>
                <CommentCard
                  index={i}
                  lefVal={comment.childrenLevel * 4}
                  commentData={comment}
                />
              </AnimationWrapper>
            );
          })
        ) : (
          <NoDataMessage message="no comments" />
        )
      }
      {/* {total_parent_comments > totalParentCommentsLoaded ? (
        <button
          className="text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2"
          onClick={LoadMoreComment}
        >
          Load more
        </button>
      ) : (
        ""
      )} */}
    </div>
  );
};
export default CommentsContainer;
