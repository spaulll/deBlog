import React, { useEffect, useState } from "react";
import Animationrapper from "../common/page-animation";
import InPageNavigation from "../components/inpage-navigation.component";
import toast from "react-hot-toast";
import axios from "axios";
import Loader from "../components/loader.component";
import BlogPostCard from "../components/blog-post.component"
const HomePage = () => {
  let [blogData, setBlogData] = useState(null);

  const fetchLatestBlogs = () => {
    axios
      .get(import.meta.env.VITE_SERVER_URL + "/latest-blogs")
      .then(({ data }) => {
        setBlogData(data.blogs);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    fetchLatestBlogs();
  }, []);
  return (
    <Animationrapper>
      <section className="h-hover flex justify-center gap-10">
        <div className=" w-full">
          <InPageNavigation
            routes={["home", "trending blogs"]}
            defaultHidden={["trending blogs"]}
          >
            <>
              {blogData == null ? (
                <Loader />
              ) : (
                blogData.map((blog, i) => {
                  return <Animationrapper transition={{duration: 1, delay: i*.1 }} key ={i}>
                    <BlogPostCard content={blog} author ={blog.author.personal_info}/>
                  </Animationrapper>;
                })
              )}
            </>
            <h1> Trending blog here</h1>
          </InPageNavigation>

          {/* latest comments */}
        </div>
        <div className="">{/* filters and treding blogs */}</div>
      </section>
    </Animationrapper>
  );
};

export default HomePage;
