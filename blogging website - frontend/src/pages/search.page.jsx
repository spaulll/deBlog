import { useParams } from "react-router-dom";
import InPageNavigation from "../components/inpage-navigation.component";
import { useEffect, useState } from "react";
import Loader from "../components/loader.component";
import Animationrapper from "../common/page-animation";
import BlogPostCard from "../components/blog-post.component";
import NoDataMessage from "../components/nodata.component";
import LoadMoreDataBtn from "../components/load-more.component";
import { filterPaginationData } from "../common/filter-pagination-data";
import axios from "axios";
import UserCard from "../components/usercard.component";

import { User } from "lucide-react";

const SearchPage = () => {
  let { query } = useParams();
  let [blogData, setBlogData] = useState(null);
  let [users, setUsers] = useState(null);
  const searchBlogs = ({ page = 1, create_new_arr = false }) => {
    axios
      .post(import.meta.env.VITE_SERVER_URL + "/search-blogs", {
        query,
        page,
      })
      .then(async ({ data }) => {
        let formatData = await filterPaginationData({
          state: blogData,
          data: data.blogs,
          page,
          countRoute: "/search-blogs-count",
          data_to_send: { query },
          create_new_arr,
        });
        setBlogData(formatData);
        // console.log(formatData)
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const fetchUsers = () => {
    axios
      .post(import.meta.env.VITE_SERVER_URL + "/search-users", {
        query,
      })
      .then(async ({ data: { users } }) => {
        setUsers(users);
        // console.log(formatData)
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    resetState();
    searchBlogs({ page: 1, create_new_arr: true });
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
              <Animationrapper
                key={i}
                transation={{ duration: 1, delay: i * 0.08 }}
              >
                <UserCard user={user} />
              </Animationrapper>
            );
          })
        ) : (
          <NoDataMessage message="no user found" />
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
            ) : !blogData.results.length ? (
              <NoDataMessage message="No blog published with this tag till now" />
            ) : (
              blogData.results.map((blog, i) => {
                return (
                  <Animationrapper
                    transition={{ duration: 1, delay: i * 0.1 }}
                    key={i}
                  >
                    <BlogPostCard
                      content={blog}
                      author={blog.author.personal_info}
                    />
                  </Animationrapper>
                );
              })
            )}
            <LoadMoreDataBtn state={blogData} fetchDataFun={searchBlogs} />
          </>
          <UserCardWrapper />
        </InPageNavigation>
      </div>
      <div className="min-w-[40%] lg:min-w-[350px] max-w-min border-1 border-grey pl-8 pt-3 max-md:hidden gap-1">
        <div className="flex">
        <User  className="m-1"/>
        <h1 className="font-medium text-xl mb-8">user related to search</h1>
        
        </div>
        <UserCardWrapper />
      </div>
    </section>
  );
};
export default SearchPage;
