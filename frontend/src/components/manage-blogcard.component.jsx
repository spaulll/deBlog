import { Link } from "react-router-dom";
import { getDay } from "../common/date";
import { useContext, useState } from "react";
import { UserContext } from "../App";
import axios from "axios";

const BlogStats = ({ stats }) => {
  return (
    <div className="flex gap-2 max-lg:mb-6 max-lg:pb-6 border-grey border-b ">
      {
        Object.keys(stats).map((key, i) => {
          return !key.includes("parent") ? 
            <div className={" flex flex-col items-center w-full h-full justify-center p-4 px-6 " + (i!= 0 ? "border-grey border-1" : "" )} key={i}>
              <h1 className="text-xl lg:text-2xl mb-2">{stats[key].toLocaleString()}</h1>
              <p className="max-lg:text-dark-grey capitalize">{key.split("_")[1]}</p>
            </div>
          : ""
        })
      }
    </div>
  );
}

export const ManagePublishBlogCard = ({ blog }) => {
  let { banner, blog_id, title, publishedAt, activity, index } = blog;
  let [showstat, setShowstat] = useState(false);
  let {userAuth:{access_token}} = useContext(UserContext)

  
  return (
    <>
      <div className="flex gap-10 border-b mb-6 max-md:px-4 border-grey items-center">
        <img src={banner} className="max-md:hidden lg:hidden xl:block w-28 h-28 flex-none bg-grey object-cover" />
        <div className="flex flex-col justify-between py-2 w-full min-w-[300px]">
          <div>
                <Link to={`/blog/${blog_id}`} className="blog-title mb-4 hover:underline hover:text-black">{title}</Link>
                <p className="line-clamp-1">published on {getDay(publishedAt)}</p>
          </div>
          <div className="flex gap-6 mt-3">
                <Link to={`/editor/${blog_id}`} className="pr-4 py-2 underline">Edit</Link>
                <button className="pr-4 py-2 underline" onClick={() => setShowstat(prevVal => !prevVal)}>Stats</button>
                <button className="pr-4 py-2 underline text-twitter" 
                  onClick={(e) => deleteBlog( blog, access_token, e.target)}>
                  Delete
                </button>
          </div>
        </div>
        <div className="max-lg:hidden">
          <BlogStats stats={activity} />
        </div>
      </div>
      {
        showstat ?
        <div className="lg:hidden">
          <BlogStats stats={activity} />
        </div> : ""
      }
    </>
  );
}

export const ManageDraftBlogPost = ({ blog }) => {
    let { title, des, blog_id, index, setStateFunc } = blog;
    let { userAuth: { access_token } } = useContext(UserContext)
    index++
    
    return(
        <div className="flex gap-5 lg:gap-10 pb-6 border-b mb-6 border-grey">
            <h1 className="blog-index text-center pl-4 md:pl-6 flex-none ">{index < 10 ? "0" + index : index}</h1>
            <div>
                <h1 className="blog-title mb-3 ">{title}</h1>
                <p className="flex gap-6 mt-3">{des?.length ? des : ""}</p>
                <div className="flex gap-6 mt-3">
                    <Link to={`/editor/${blog_id}`} className="pr-4 py-2 underline">Edit</Link>
                    <button className="pr-4 py-2 underline text-twitter" 
                      onClick={(e) => deleteBlog( blog, access_token, e.target)}>
                      Delete
                    </button>
                </div>
            </div>
        </div>
    )
}

const deleteBlog = (blog, access_token, target) => {
  let { index, blog_id, setStateFunc } = blog;
  
  // Use consistent naming
  if (!setStateFunc) {
      console.error("setStateFunc is not defined");
      return;
  }
  
  target.setAttribute("disabled", true);
  axios.post(import.meta.env.VITE_SERVER_URL + "/delete-blog", { blog_id }, {
    headers: {
      'Authorization': `Bearer ${access_token}`
    }
  })
  .then(({ data }) => {
    target.removeAttribute("disabled");
    setStateFunc(prevVal => {
      if (!prevVal) return null;
      
      let { deletedDocCount , totalDocs, results } = prevVal;
      
      // Remove the deleted blog
      results.splice(index, 1);
      
      // Better pagination handling
      if (results.length === 0 && totalDocs - 1 > 0) {
        return null;
        // Instead of returning null, trigger a refetch with proper page calculation
        // This will force a refetch of the correct page in useEffect
        // return { 
        //   ...prevVal, 
        //   results: [], 
        //   totalDocs: totalDocs - 1, 
        //   deletedDocCount: deletedDocCount + 1 
        // };
      }
      console.log({ 
        ...prevVal, 
        totalDocs: totalDocs - 1, 
        deletedDocCount: deletedDocCount + 1 
      })
      
      return { 
        ...prevVal, 
        totalDocs: totalDocs - 1, 
        deletedDocCount: deletedDocCount + 1 
      };
    });
  })
  .catch(err => {
    console.log(err);
    target.removeAttribute("disabled");
  });
}