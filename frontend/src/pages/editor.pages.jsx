import { useContext, useEffect, useState, createContext } from "react";
import { useParams } from "react-router-dom";
import BlogEditor from "../components/blog-editor.component";
import PublishEditor from "../components/publish-form.component";
import Loader from "../components/loader.component";
import ConnectButtonAuth from "../components/web3Component/ConnectButtonAuth";
import { useAuth } from "../contexts/AuthContext";
import { getBlog } from "../lib/contractInteraction";
import axios from "axios";
import moment from "moment";

const blogStructure = {
  title: "",
  banner: "",
  content: [],
  tags: [],
  des: "",
  author: { personal_info: {} },
  draft: false,
};

export const EditoContext = createContext({});

const Editor = () => {
  let { blog_id } = useParams();
  const [blog, setBlog] = useState(blogStructure);
  const [editorState, setEditorState] = useState("editor");
  const [textEditor, setTextEditor] = useState({ isReady: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { isLoggedIn } = useAuth();

  useEffect(() => {
    if (!blog_id) {
      setLoading(false);
      return;
    }

    const fetchBlog = async () => {
      try {
        // Fetch the post object using your getBlog function
        const post = await getBlog(blog_id);
        if (!post) {
          setLoading(false);
          return;
        }

        // Retrieve the blog content from IPFS using axios
        const response = await axios.get(post.content);
        const ipfsContent = response.data;

        // Update the blog state with data from IPFS and the post object
        setBlog({
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
          activity: { total_parent_comments: 0 },
          tags: ipfsContent.tags,
        });

        setError(null);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching blog:", error);
        setError("Error fetching blog data");
        setLoading(false);
      }
    };

    fetchBlog();
  }, [blog_id]);

  return (
    <EditoContext.Provider
      value={{
        blog,
        setBlog,
        editorState,
        setEditorState,
        textEditor,
        setTextEditor,
      }}
    >
      {!isLoggedIn ? (
        <div className="flex flex-col justify-center items-center h-screen">
          <h2 className="text-3xl font-semibold">
            You are not logged in. Please connect your wallet
          </h2>
          <div className="h-5" />
          <ConnectButtonAuth />
        </div>
      ) : loading ? (
        <Loader />
      ) : error ? (
        <div className="text-red-500 text-center mt-10">{error}</div>
      ) : editorState === "editor" ? (
        <BlogEditor />
      ) : (
        <PublishEditor />
      )}
    </EditoContext.Provider>
  );
};

export default Editor;
