import axios from "axios";
import { Loader } from "lucide-react";
import { createContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AnimationWrapper from "../common/page-animation";
import { getBlog } from "../lib/contractInteraction";
import BlogInteraction from "../components/blog-interaction.component";
// import CommentsContainer from "../components/comments.component";
import BlogContent from "../components/blog-content.component";
import moment from "moment";

export const BlogContext = createContext({});

const BlogPage = () => {
  const { blog_id } = useParams();
  const [blogData, setBlogData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLikedByUser, setIsLikedByUser] = useState(false);
  // const [commentsWrapper, setCommentsWrapper] = useState(false);
  const [totalParentCommentsLoaded, setTotalParentCommentsLoaded] = useState(0);

  const fetchBlog = async () => {
    try {
      const post = await getBlog(blog_id);
      if (!post) {
        setLoading(false);
        return;
      }

      const response = await axios.get(post.content);
      const ipfsContent = response.data;

      setBlogData({
        title: ipfsContent.title,
        des: ipfsContent.des,
        banner: ipfsContent.banner,
        content: ipfsContent.content,
        publishedAt: moment.unix(post.timestamp).format("MM/DD/YYYY HH:mm:ss"),
        likes: post.likes,
        dislikes: post.dislikes,
        commentCount: post.commentCount,
        blog_id: blog_id,
        // Initialize default comments and activity objects
        comments: { results: [] },
        activity: { total_parent_comments: 0 }
      });

      setLoading(false);
    } catch (error) {
      console.error("Error fetching blog:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlog();
  }, [blog_id]);

  return (
    <AnimationWrapper>
      {loading ? (
        <Loader />
      ) : (
        <BlogContext.Provider
          value={{
            blogData,
            setBlogData,
            isLikedByUser,
            setIsLikedByUser,
            // setCommentsWrapper,
            // setTotalParentCommentsLoaded,
            // commentsWrapper,
            // totalParentCommentsLoaded,
          }}
        >
          <div className="max-w-[900px] center py-10 max-lg:px-[5vw]">
            <img src={blogData.banner} className="aspect-video" alt="Blog Banner" />
            <h2 className="text-center">{blogData.title}</h2>
            <p className="text-dark-grey opacity-75">{blogData.publishedAt}</p>
            <BlogInteraction />
            <div className="my-12 font-gelasio blog-page-content">
              {blogData.content.blocks.map((block, i) => (
                <div key={i} className="my-4 md:my-8">
                  <BlogContent block={block} />
                </div>
              ))}
            </div>
            <BlogInteraction />
            {/* <CommentsContainer /> */}
          </div>
        </BlogContext.Provider>
      )}
    </AnimationWrapper>
  );
};

export default BlogPage;
