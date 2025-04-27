// comment-card.component.jsx
import { useContext, useState } from "react";
import { Toaster } from "react-hot-toast";
import CommentField from "./comment-field.component";
import moment from "moment";
import { Link } from "react-router-dom";

const CommentCard = ({ index, leftVal, commentData }) => {
  // Extract data from the commentData structure
  const comment = commentData?.comment || "";
  const commentedBy = commentData?.commented_by || {};
  const personalInfo = commentedBy?.personal_info || {};
  
  const profile_img = personalInfo?.profile_img || "";
  const username = personalInfo?.username || "";
  const commenter_address = personalInfo?.commenter_address || "";
  
  const commentedAt = commentData?.commentedAt || "";
  const blog_id = commentData?.blog_id || "";

  console.log("commentData at comment card", commentData);

  const [isReplying, setIsReplying] = useState(false);

  // Format the date manually since it's not a Unix timestamp
  const formatDate = (dateString) => {
    if (!dateString) return "";
    dateString = moment.unix(dateString).format("MMM DD, h:mA")
    return dateString;
  };

  return (
    <>
      <Toaster />
      <div className="w-full" style={{ paddingLeft: `${leftVal * 10}px` }}>
        <div className="my-5 p-6 rounded-md border border-grey">
          <Link to={`/user/${username}`}>
            <div className="flex gap-3 items-center mb-8 pe-3 bg-purple/[10%] rounded-3xl p-2">
              {profile_img ? (
                <img src={profile_img} alt={username} className="w-6 h-6 rounded-full" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gray-300"></div> // Placeholder for missing image
              )}
              <p className="line-clamp-1">
                @{username || "Unknown"}
              </p>
              <p className="min-w-fit">{formatDate(commentedAt)}</p>
            </div>
          </Link>
          <p className="font-gelasio text-xl ml-10">
            {comment.split('\n').map((line, i) => (
              <span key={i}>
                {line}
                <br />
              </span>
            ))}
          </p>
          {/*this is the reply and hide reply button and reply card part thats why it is commented */}
          {/* <div className="flex gap-5 items-center mt-5">
            {commentData.isReplyLoaded && (
              <button className="btn-light">Hide replies</button>
            )}
            <button className="btn-light" onClick={handleReplyClick}>
              Reply
            </button>
          </div> */}

          {/* {isReplying && (
            <div className="mt-8">
              <CommentField
                action="reply"
                index={index}
                replyingTo={_id}
                setReplying={setIsReplying}
              />
            </div>
          )} */}
        </div>
      </div>
    </>
  );
};

export default CommentCard;