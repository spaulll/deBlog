import { useParams } from "react-router-dom";
import InPageNavigation from "../components/inpage-navigation.component";
import { useEffect, useState } from "react";
import Loader from "../components/loader.component";
import AnimationWrapper from "../common/page-animation";
import BlogPostCard from "../components/blog-post.component";
import NoDataMessage from "../components/nodata.component";
import axios from "axios";
import UserCard from "../components/usercard.component";

import { User } from "lucide-react";

const SearchPage = () => {
  let { query } = useParams();
  let [blogData, setBlogData] = useState(null);
  let [users, setUsers] = useState(null);
  const searchBlogs = () => {
    axios
      .get(import.meta.env.VITE_SERVER_URL + "/api/search-blogs", {
        params: {
          query,
        },
      })
      .then(async ({ data }) => {
        console.log(data.blogs);
        setBlogData(data.blogs);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const fetchUsers = () => {
    axios
      .get(import.meta.env.VITE_SERVER_URL + "/api/search-users", {
        params: {
          query,
        },
      })
      .then(({ data }) => {
        setUsers(data.results);
        console.log(data.results);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    resetState();
    searchBlogs();
    fetchUsers();
  }, [query]);
  const resetState = () => {
    setBlogData(null);
    setUsers(null);
  };
  const UserCardWrapper = () => {
    return (
      <>
        {users == null ? (
          <Loader />
        ) : users.length ? (
          users.map((user, i) => {
            return (
              <AnimationWrapper
                key={i}
                transation={{ duration: 1, delay: i * 0.08 }}
              >
                <UserCard user={user} />
              </AnimationWrapper>
            );
          })
        ) : (
          <NoDataMessage message="No user found" />
        )}
      </>
    );
  };
  return (
    <section className="h-cover flex justify-center gap-10">
      <div className="w-full">
        <InPageNavigation
          routes={[`search result from "${query}`, "Account Matched"]}
          defaultHidden={["Account Matched"]}
        >
          <>
            {blogData == null ? (
              <Loader />
            ) : !blogData.length ? (
              <NoDataMessage message="No blog published with this tag till now" />
            ) : (
              blogData.map((blog, i) => {
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
            {/* <LoadMoreDataBtn state={blogData} fetchDataFun={searchBlogs} /> */}
          </>
          <UserCardWrapper />
        </InPageNavigation>
      </div>
      <div className="min-w-[40%] lg:min-w-[350px] max-w-min border-1 border-grey pl-8 pt-3 max-md:hidden gap-1">
        <div className="flex items-center gap-2 mb-8">
          <User className="m-1" />
          <h1 className="font-medium text-xl">Profiles related to search query</h1>
        </div>
        <UserCardWrapper />
      </div>
    </section>
  );
};
export default SearchPage;
