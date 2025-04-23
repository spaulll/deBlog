import { useContext, useState } from "react";
import { ToastContainer} from "react-toastify";
import { UserContext } from "../App";

const NotificatioCommentField = ({_id, blog_author, index= undefined, replyingTo= undefined, setReplying, notification_id, notificationData}) => {
    let [comment, setComment] = useState('');
    let { _id:user_id} = blog_author;
    let{userAuth: {access_token}} = useContext(UserContext);
    let {notifications, notifications:{results}, setNotifications}=notificationData;
    const handleComment = () =>{
        //backend connection
        console.log("reply")
    }
    
        return (
    <>
      <ToastContainer position="bottom-right" />
      <textarea
        value={comment}
        placeholder="leave a reply..."
        className="input-box pl-8 placeholder:text-dark-grey resize-none h-[150px] overflow-auto"
        onChange={(e) => setComment(e.target.value)}
        // disabled={isSubmitting}
      />
      <button
        className="mt-2 p-2 btn-dark "
        onClick={handleComment}
        // disabled={isSubmitting}
      >
        {/* {isSubmitting ? "Submitting..." : action} */}
        reply
      </button>
    </>
  );

}
export default NotificatioCommentField