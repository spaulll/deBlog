import { useContext, useState } from "react";
import { getDay } from "../common/date";
import { UserContext } from "../App";
import { toast, Toaster } from "react-hot-toast";
import CommentField from "./comment-field.component";

const CommentCard = ({ index, leftVal, commentData }) => {
  const {
    comment,
    commented_by: {
      personal_info: { profile_img, fullname, username },
    },
    commentedAt,
    _id,
  } = commentData;

  const {
    userAuth: { access_token },
  } = useContext(UserContext);

  const [isReplying, setIsReplying] = useState(false);

  const handleReplyClick = () => {
    if (!access_token) {
      toast.error("Please login first to reply");
      return;
    }
    setIsReplying(prev => !prev);
  };

  return (
    <>
      <Toaster />
      <div className="w-full" style={{ paddingLeft: `${leftVal * 10}px` }}>
        <div className="my-5 p-6 rounded-md border border-grey">
          <div className="flex gap-3 items-center mb-8 pe-3 bg-purple/[10%] rounded-3xl p-2">
            <img src={profile_img} alt={username} className="w-12 h-12 rounded-full" />
            <p className="line-clamp-1">{fullname} @{username}</p>
            <p className="min-w-fit">{getDay(commentedAt)}</p>
          </div>

          <p className="font-gelasio text-xl ml-10">{comment}</p>
          
          <div className="flex gap-5 items-center mt-5">
            {commentData.isReplyLoaded && (
              <button className="btn-light">Hide replies</button>
            )}
            <button className="btn-light" onClick={handleReplyClick}>
              Reply
            </button>
          </div>

          {isReplying && (
            <div className="mt-8">
              <CommentField
                action="reply"
                index={index}
                replyingTo={_id}
                setReplying={setIsReplying}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CommentCard;