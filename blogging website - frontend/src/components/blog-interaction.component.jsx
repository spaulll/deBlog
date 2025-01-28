import { useContext } from "react";
import { BlogContext } from "../pages/blog.page";
import { Heart, MessageSquare, TwitterIcon } from "lucide-react";
import { Link } from "react-router-dom";
import {UserContext} from "../App"
const BlogInteraction = () => {
  let {
    blogData: {
      title,
      blog_id,
      activity,
      activity: { total_likes, total_comments },
      author: {
        personal_info: { username: author_username },
      },
    },
    setBlogData,
  } = useContext(BlogContext);
  let{userAuth:{username}} = useContext(UserContext);
  return (
    <>
      <hr className="border-grey my-3" />
      <div className="flex gap-6 justify-between">
        <div className="flex gap-3 items-center">
          <button className="w-10 h-10 rounded-full flex items-center justify-center bg-grey/80 ">
            <Heart />
          </button>
          <p className="text-dark-grey text-xl">{total_likes}</p>

          <button className="w-10 h-10 rounded-full flex items-center justify-center bg-grey/80 ">
            <MessageSquare />
          </button>
          <p className="text-dark-grey text-xl">{total_comments}</p>
        </div>
        <div className=" flex gap-6 items-center">
          {
            username == author_username?
            <Link to={`/editor/${blog_id}`} className="undeline hover:text-purple">Edit</Link>:""
          }

          <Link to={`https://twitter.com/intend/tweet?${title}&url=${location.herf}`}><TwitterIcon className="hover:text-twitter _blank"/></Link>
        </div>
      </div>
      <hr className="border-grey my-3" />
    </>
  );
};
export default BlogInteraction;
