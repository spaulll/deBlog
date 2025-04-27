// blog.page.jsx
import axios from "axios";
import { Loader } from "lucide-react";
import { createContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AnimationWrapper from "../common/page-animation";
import { getBlog, getUserProfile, getPostOwner } from "../lib/contractInteraction";
import BlogInteraction from "../components/blog-interaction.component";
import BlogPostCard from "../components/blog-post.component";
import BlogContent from "../components/blog-content.component";
import CommentsContainer, { fetchComments } from "../components/comments.component";
import moment from "moment";

export const blogStructure = {
  title: "",
  des: "",
  content: [],
  banner: "",
  publishedAt: "",
  likes: 0,
  dislikes: 0,
  commentCount: 0,
  blog_id: "",
  comments: { results: [] },
  author: {
    author_address: "",
    author_username: "",
    author_profile_img: "",
    author_tipping_address: "",
  },
};

export const BlogContext = createContext({});

const BlogPage = () => {
  const { blog_id } = useParams();
  const [blogData, setBlogData] = useState(blogStructure);
  const [loading, setLoading] = useState(true);
  const [similarBlog, setSimilarBlog] = useState(null);
  const [isLikedByUser, setIsLikedByUser] = useState(false);
  const [commentsWrapper, setCommentsWrapper] = useState(false);
  const [totalParentCommentsLoaded, setTotalParentCommentsLoaded] = useState(0);
  const [authorTipAddress, setAuthorTipAddress] = useState("");

  let {
    title,
    content,
    banner,
    publishedAt,
    author: {
      author_address,
      author_username,
      author_profile_img,
    },
  } = blogData;

  const fetchAuthorInfo = async (ownerAddress) => {
    try {
      const author = await getUserProfile(ownerAddress);
      
      if (!author) {
        console.warn("⚠️ No author data returned from getUserProfile");
        return null;
      }
      
      const { userAddress, username, avatarUri, tipWalletAddress } = author;
      
      return {
        author_address: userAddress,
        author_username: username,
        author_profile_img: avatarUri,
        author_tipping_address: tipWalletAddress,
      };
    } catch (error) {
      console.error("❌ Error in fetchAuthorInfo:", error);
      return null;
    }
  };

  const fetchBlog = async () => {
    
    try {
      // Get post owner from blockchain
      const ownerAddress = await getPostOwner(blog_id);
      
      if (!ownerAddress) {
        setLoading(false);
        return;
      }
      
      // Get author info from blockchain
      const authorInfo = await fetchAuthorInfo(ownerAddress);
      
      if (!authorInfo) {
        setLoading(false);
        return;
      }
      
      // Get blog data from blockchain
      const post = await getBlog(blog_id);
      
      if (!post) {
        setLoading(false);
        return;
      }

      // Fetch content from IPFS
      try {
        const response = await axios.get(post.content);
        const ipfsContent = response.data;
        
        if (!ipfsContent) {
          setLoading(false);
          return;
        }

        // Prepare blog data
        const blog = {
          title: ipfsContent.title,
          des: ipfsContent.des,
          banner: ipfsContent.banner,
          content: ipfsContent.content,
          publishedAt: moment.unix(post.timestamp).format("MMM DD, YYYY | hh:mm A"),
          likes: post.likes,
          dislikes: post.dislikes,
          commentCount: post.commentCount,
          blog_id: blog_id,
          author: authorInfo,
        };

        // Fetch comments
        try {
          blog.comments = await fetchComments({
            blog_id: blog_id, 
          });
        } catch (commentsError) {
          blog.comments = { results: [] };
        }

        // Set author tip address
        setAuthorTipAddress(authorInfo.author_tipping_address);
        
        // Update blog data state
        setBlogData(blog);

        // Fetch similar blogs if tags exist
        if (ipfsContent.tags && ipfsContent.tags.length > 0) {
          try {
            const { data } = await axios.post(import.meta.env.VITE_SERVER_URL + "/search-blogs", {
              tag: ipfsContent.tags[0],
              limit: 6,
              eliminate_blog: blog_id,
            });
            setSimilarBlog(data.blogs);
          } catch (err) {
            console.warn("Error fetching similar blogs:", err);
          }
        } else {
          console.log("ℹNo tags available to fetch similar blogs");
        }

        setLoading(false);
      } catch (ipfsError) {
        setLoading(false);
      }
    } catch (error) {
      console.error("Error in fetchBlog:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    resetState();
    fetchBlog();
  }, [blog_id]);

  const resetState = () => {
    setBlogData(blogStructure);
    setSimilarBlog(null);
    setLoading(true);
    setIsLikedByUser(false);
    setCommentsWrapper(false);
    setTotalParentCommentsLoaded(0);
    setAuthorTipAddress("");
  };

  
  return (
    <AnimationWrapper>
      {loading ? (
        <div className="flex justify-center items-center h-screen">
          <Loader size={48} className="animate-spin" />
        </div>
      ) : (
        <BlogContext.Provider
          value={{
            blogData,
            setBlogData,
            isLikedByUser,
            setIsLikedByUser,
            authorTipAddress,
            setAuthorTipAddress,
            setCommentsWrapper,
            setTotalParentCommentsLoaded,
            commentsWrapper,
            totalParentCommentsLoaded,
          }}
        >
          <CommentsContainer />
          <div className="max-w-[900px] center py-10 max-lg:px-[5vw]">
            {banner ? (
              <img src={banner} className="aspect-video w-full object-cover" alt="Blog Banner" />
            ) : (
              <div className="aspect-video w-full bg-gray-200 flex items-center justify-center">
                <p>Banner not available</p>
              </div>
            )}
            <div className="mt-12">
              <h1 className="text-center text-4xl font-semibold text-gray-700">{title || "Untitled Blog"}</h1>
              <div className="flex max-sm:flex-col justify-between my-8">
                <div className="flex gap-5 items-center">
                  {author_profile_img ? (
                    <img
                      src={author_profile_img}
                      alt=""
                      className="w-12 h-12 rounded-full"
                    />
                  ) : (
                    <img
                      src={`https://api.dicebear.com/9.x/adventurer/svg?seed=${author_address}`}
                      alt=""
                      className="w-12 h-12 rounded-full"
                    />
                  )}
                  <p className="capitalize">
                    {author_address ? (author_address.slice(0, 5) +
                      "..." +
                      author_address.slice(author_address.length - 4, author_address.length)) : "Unknown"}
                    <br />@
                    <Link to={`/user/${author_username}`} className="underline">
                      {author_username || "anonymous"}
                    </Link>
                  </p>
                </div>
                <p className="text-dark-grey opacity-75 max-sm:mt-6 max-sm:ml-12 max-sm:pl-5">
                  {publishedAt || "Publication date unknown"}
                </p>
              </div>
            </div>
            <BlogInteraction />
            {/* blog content */}
            <div className="my-12 font-gelasio blog-page-content">
              {content && content.blocks ? (
                content.blocks.map((block, i) => (
                  <div key={i} className="my-4 md:my-8">
                    <BlogContent block={block} />
                  </div>
                ))
              ) : (
                <p>No content available for this blog</p>
              )}
            </div>
            <BlogInteraction />
            
            {similarBlog && similarBlog.length ? (
              <>
                <h1 className="text-2xl mt-14 mb-10 font-medium">
                  Similar Blogs
                </h1>
                <div className="flex flex-wrap gap-4">
                  {similarBlog.map((blog, i) => {
                    let author = blog.author || {};
                    return (
                      <AnimationWrapper
                        key={i}
                        transition={{ duration: 1, delay: i * 0.08 }}
                      >
                        <BlogPostCard content={blog} author={author} />
                      </AnimationWrapper>
                    );
                  })}
                </div>
              </>
            ) : null}
          </div>
        </BlogContext.Provider>
      )}
    </AnimationWrapper>
  );
};

export default BlogPage;