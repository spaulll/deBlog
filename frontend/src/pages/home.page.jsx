import React, { useEffect, useState } from "react";
import AnimationWrapper from "../common/page-animation";
import InPageNavigation from "../components/inpage-navigation.component";
import axios from "axios";
import Loader from "../components/loader.component";
import BlogPostCard from "../components/blog-post.component";
import MinimalBlogPost from "../components/nobanner-blog-post.component";
import { activeTabRef } from "../components/inpage-navigation.component";
import NoDataMessage from "../components/nodata.component";
import interestIcon from "../imgs/interest.svg";

const HomePage = () => {
  let [blogData, setBlogData] = useState(null);
  let [trendingBlogs, setTrendingBlogs] = useState(null);
  let [pageState, setPageState] = useState("home");
  const [categories, setCategories] = useState([]);

  const fetchLatestBlogs = () => {

    axios
      .get(import.meta.env.VITE_SERVER_URL + "/latest-blogs")
      .then(({ data }) => {
        console.log(data.blogs);
        setBlogData({ results: data.blogs });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const fetchTrendingBlogs = () => {
    console.log("Calling fetchTrendingBlogs");
    axios
      .get(import.meta.env.VITE_SERVER_URL + "/trending-blogs")
      .then(({ data }) => {
        setTrendingBlogs(data.blogs);
      })
      .catch((err) => {
        console.error("Error in fetchTrendingBlogs:", err);
      });
  };

  const fetchBlogsByCategory = () => {
    axios
      .get(import.meta.env.VITE_SERVER_URL + "/api/search-blogs", {
        params: {
          query: pageState,
        },
      })
      .then(async ({ data }) => {
        console.log(data.blogs);
        setBlogData({ results: data.blogs });
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const loadBlogBycategory = (e) => {
    let categoryValue = e.target.innerText.toLowerCase();
    setBlogData(null);
    if (pageState == categoryValue) {
      setPageState("home");
      return;
    }
    setPageState(categoryValue);
  };

  useEffect(() => {
    if (pageState === "home" && trendingBlogs) {
      const uniqueTags = [...new Set(trendingBlogs.flatMap(blog => blog.tags))];

      // Shuffle the tags
      const shuffledTags = uniqueTags.sort(() => 0.5 - Math.random());

      // Select first 8–10 tags (or fewer if not enough)
      const selectedTags = shuffledTags.slice(0, 10);

      setCategories(selectedTags);
    }
  }, [pageState, trendingBlogs]);


  useEffect(() => {
    activeTabRef.current.click();
    if (pageState == "home") {
      fetchLatestBlogs();
    } else {
      fetchBlogsByCategory();
    }
    if (!trendingBlogs) {
      fetchTrendingBlogs();
    }
  }, [pageState]);

  return (
    <AnimationWrapper>
      <section className="h-hover flex justify-center gap-10">
        <div className=" w-full">
          <InPageNavigation
            routes={[pageState, "trending blogs"]}
            defaultHidden={["trending blogs"]}
          >
            <>
              {blogData == null ? (
                <Loader />
              ) : !blogData.results.length ? (
                <NoDataMessage message="No blog published with this tag till now" />
              ) : (
                blogData.results.map((blog, i) => {
                  return (
                    <AnimationWrapper
                      transition={{ duration: 1, delay: i * 0.1 }}
                      key={i}
                    >
                      <BlogPostCard
                        content={blog}
                        author={blog.author.personal_info}
                      />
                    </AnimationWrapper>
                  );
                })
              )}
              {/* <LoadMoreDataBtn state={blogData} fetchDataFun = {(pageState == "home"? fetchLatestBlogs: fetchBlogsByCategory)}/> */}
            </>
            {trendingBlogs == null ? (
              <Loader />
            ) : !trendingBlogs.length ? (
              <NoDataMessage message="No trending blog" />
            ) : (
              trendingBlogs.map((trendingBlog, i) => {
                return (
                  <AnimationWrapper
                    transition={{ duration: 1, delay: i * 0.1 }}
                    key={i}
                  >
                    <MinimalBlogPost blog={trendingBlog} index={i} />
                  </AnimationWrapper>
                );
              })
            )}
          </InPageNavigation>

          {/* latest comments */}
        </div>
        <div className="min-w-[40%] lg:min-w-[400px] mx-w-min border-1 border-grey pl-8 pt-3 max-md:hidden">
          {/* filters and treding blogs */}

          <div className="flex flex-col gap-10">
            <div className="h">
              {/* <div className="flex justify-between items-center mb-4"> */}
                <h1 className="font-medium text-xl mb-8 flex gap-1">
                  Interesting Topics 
                  <img src={interestIcon} alt="Interest Icon" className="w-6 h-6 mt-[-2px]" />
                </h1>
              {/* </div> */}
              <div className="flex gap-3 flex-wrap ">
                {categories.map((category, i) => {
                  return (
                    <button
                      onClick={loadBlogBycategory}
                      className={
                        "tag " +
                        (pageState == category ? " bg-black text-white " : " ")
                      }
                      key={i}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>
              <h1 className="font-medium text-xl mt-8 mb-8 flex gap-1">
                trending
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#6b6666"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-trending-up"
                >
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                  <polyline points="16 7 22 7 22 13" />
                </svg>
              </h1>
              {trendingBlogs == null ? (
                <Loader />
              ) : !trendingBlogs.length ? (
                <NoDataMessage message="No trending blog" />
              ) : (
                trendingBlogs.map((trendingBlog, i) => {
                  return (
                    <AnimationWrapper
                      transition={{ duration: 1, delay: i * 0.1 }}
                      key={i}
                    >
                      <MinimalBlogPost blog={trendingBlog} index={i} />
                    </AnimationWrapper>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </section>
    </AnimationWrapper>
  );
};

export default HomePage;