import { useContext, useEffect, useState } from "react";
// import { UserContext } from "../App";
import { Navigate, useParams } from "react-router-dom";
import BlogEditor from "../components/blog-editor.component";
import PublishEditor from "../components/publish-form.component";
import { createContext } from "react";
import Loader from "../components/loader.component";
import axios from "axios";
import ConnectButtonAuth from "../components/web3Component/ConnectButtonAuth";
import { useAuth } from "../contexts/AuthContext";

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

  const { isLoggedIn } = useAuth();

  useEffect(() => {
    if (!blog_id) {
      return (setLoading(false))
    }
    axios.post(import.meta.env.VITE_SERVER_URL + "/get-blog", {
      blog_id, draft: true, mode: 'edit'
    })
      .then((response) => {
        // Access response.data.blog instead of destructuring directly
        setBlog(response.data.blog);
        console.log(response.data.blog);
        setLoading(false);
      })
      .catch((err) => {
        setBlog(null);
        setLoading(false);
      });
  }, [])
  // let {
  //   userAuth: { access_token },
  // } = useContext(UserContext);

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
      { isLoggedIn === false ? (
        <div className="flex flex-col justify-center items-center h-screen">
          <h2 className="text-3xl font-semibold">You are not logged in. Please connect your wallet</h2>
          <div className="h-5" />
          <ConnectButtonAuth />
        </div>
        
      ) : loading ? <Loader /> :
        editorState == "editor" ? (
          <BlogEditor />
        ) : (
          <PublishEditor />
        )}
    </EditoContext.Provider>
  );
};
export default Editor;
