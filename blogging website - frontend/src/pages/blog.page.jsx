import axios from "axios";
import { Loader } from "lucide-react";
import { createContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AnimationWrapper from "../common/page-animation";
import { getDay } from "../common/date";
import BlogInteraction from "../components/blog-interaction.component";
import BlogPostCard from "../components/blog-post.component";
import BlogContent from "../components/blog-content.component";

export const blogStructure = {
  title: "",
  des: "",
  content: [],
  banner: "",
  author: { personal_info: {} },
  publishedAt: "",
};

export const BlogContext = createContext({});

const BlogPage = () => {
  const { blog_id } = useParams();
  const [blogData, setBlogData] = useState(blogStructure);
  const [loading, setLoading] = useState(true);
  const [similarBlog, setSimilarBlog] = useState(null);
  const [isLikedByUser,setIsLikedByUser]= useState(false);

  let {
    title,
    content,
    banner,
    author: {
      personal_info: { fullname, username: author_username, profile_img },
    },
    publishedAt,
  } = blogData;

  const fetchBlog = () => {
    axios
      .post(import.meta.env.VITE_SERVER_URL + "/get-blog", {
        blog_id,
      })
      .then(({ data: { blog } }) => {
        setBlogData(blog);
        // Ensure tags exist before searching
        if (blog.tags && blog.tags.length > 0) {
          axios
            .post(import.meta.env.VITE_SERVER_URL + "/search-blogs", {
              tag: blog.tags[0],
              limit: 6,
              eliminate_blog: blog_id,
            })
            .then(({ data }) => {
              setSimilarBlog(data.blogs);
            })
            .catch((err) => {
              console.log(err);
            });
        }
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    resetState();
    fetchBlog();
  }, [blog_id]); // Add blog_id as dependency
const resetState=()=>{
  setBlogData(blogStructure)
  setSimilarBlog(null)
  setLoading(true)
}
  return (
    <AnimationWrapper>
      {loading ? (
        <Loader />
      ) : (
        <BlogContext.Provider value={{ blogData, setBlogData, isLikedByUser, setIsLikedByUser }}>
          <div className="max-w-[900px] center py-10 max-lg:px-[5vw]">
            <img src={banner} className="aspect-video" />
            <div className="mt-12">
              <h2 className="text-center">{title}</h2>
              <div className="flex max-sm:flex-col justify-between my-8">
                <div className="flex gap-5 items-center">
                  <img
                    src={profile_img}
                    alt=""
                    className="w-12 h-12 rounded-full"
                  />
                  <p className="capitalize">
                    {fullname}
                    <br />@
                    <Link to={`/user/${author_username}`} className="underline">
                      {author_username}
                    </Link>
                  </p>
                </div>
                <p className=" text-dark-grey opacity-75 max-sm:mt-6 max-sm:ml-12 max-sm:pl-5">
                  {getDay(publishedAt)}
                </p>
              </div>
            </div>
            <BlogInteraction />
            {/* blog content */}
            <div className="my-12 font-gelasio blog-page-content">
              {
                content[0].blocks.map((block,i)=>{
                  return <div key={i} className="my-4 md:my-8">
                    <BlogContent block={block}/>
                  </div>
                })
              }
            </div>
            <BlogInteraction />
            {similarBlog != null && similarBlog.length ? (
              <>
                <h1 className="text-2xl mt-14 mb-10 font-medium">
                  Similar Blogs
                </h1>
                <div className="flex flex-wrap gap-4">
                  {similarBlog.map((blog,i) => {
                    let {
                      author: { personal_info },
                    } = blog;
                    return (
                      <AnimationWrapper
                        key={i}
                        transition={{ duration: 1, delay: i * 0.08 }}
                      >
                        <BlogPostCard content={blog} author={personal_info} />
                      </AnimationWrapper>
                    );
                  })}
                </div>
              </>
            ) : (
              <p>No similar blogs found</p>
            )}
          </div>
        </BlogContext.Provider>
      )}
    </AnimationWrapper>
  );
};

export default BlogPage;
