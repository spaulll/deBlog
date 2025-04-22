import axios from "axios";
import { Loader } from "lucide-react";
import { createContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AnimationWrapper from "../common/page-animation";
import { getBlog, getUserProfile, getPostOwner } from "../lib/contractInteraction";
import BlogInteraction from "../components/blog-interaction.component";
// import CommentsContainer from "../components/comments.component";
import BlogContent from "../components/blog-content.component";
import moment from "moment";

export const BlogContext = createContext({});

const authorIndoStructure = {
  author_address: "",
  author_username: "",
  author_profile_img: "",
  author_tipping_address: "",
};

const BlogPage = () => {
  const { blog_id } = useParams();
  const [blogData, setBlogData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLikedByUser, setIsLikedByUser] = useState(false);
  const [authorInfo, setAuthorInfo] = useState(authorIndoStructure)
  // const [commentsWrapper, setCommentsWrapper] = useState(false);
  const [totalParentCommentsLoaded, setTotalParentCommentsLoaded] = useState(0);
  const [authorTipAddress, setAuthorTipAddress] = useState("");
  let { author_address, author_username, author_profile_img, author_tipping_address } = authorInfo;

  const fetchAuthorInfo = async () => {
    try {
      const author = await getUserProfile(await getPostOwner(blog_id));
      if (!author) {
        setLoading(false);
        return;
      }
      const { userAddress, username, avatarUri } = author;
      setAuthorInfo({
        author_address: userAddress,
        author_username: username,
        author_profile_img: avatarUri,
      });
    } catch (error) {
      console.error("Error fetching author info:", error);
    }
  };
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
        publishedAt: moment.unix(post.timestamp).format("MMM DD, YYYY | hh:mm A"),
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
    fetchAuthorInfo();
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
            authorTipAddress,
            setAuthorTipAddress,
            // setCommentsWrapper,
            // setTotalParentCommentsLoaded,
            // commentsWrapper,
            // totalParentCommentsLoaded,
          }}
        >
          <div className="max-w-[900px] center py-10 max-lg:px-[5vw]">
            <img src={blogData.banner} className="aspect-video" alt="Blog Banner" />
            <div className="mt-12">
              <h1 className="text-center text-4xl font-semibold text-gray-700">{blogData.title}</h1>
              <div className="flex max-sm:flex-col justify-between my-8">
                <div className="flex gap-5 items-center">
                  <img
                    src={author_profile_img}
                    alt=""
                    className="w-12 h-12 rounded-full"
                  />
                  <p className="capitalize">
                    {author_address.slice(0, 5) +
                      "..." +
                      author_address.slice(author_address.length - 4, author_address.length)}
                    <br />@
                    <Link to={`/user/${author_username}`} className="underline">
                      {author_username}
                    </Link>
                  </p>
                </div>
                <p className="text-dark-grey opacity-75 max-sm:mt-6 max-sm:ml-12 max-sm:pl-5">
                  {blogData.publishedAt}
                </p>
              </div>
            </div>
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
}
export default BlogPage;
