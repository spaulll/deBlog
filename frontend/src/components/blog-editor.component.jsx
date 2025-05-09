// blog editor
import { Link, useNavigate, useParams } from "react-router-dom";
import logo from "../imgs/logo.webp";
import AnimationWrapper from "../common/page-animation";
import defaultBanner from "../imgs/blog banner.png";
import getImgURL from "../common/uploadToIPFS";
import { useContext, useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { EditoContext } from "../pages/editor.pages";
import EditorJS from "@editorjs/editorjs";
import { tools } from "./tools.component";
import axios from "axios";
import Loader from "../components/loader.component";

const BlogEditor = () => {
  
  let{blog_id}=useParams()
  let {
    blog,
    setBlog,
    textEditor,
    setTextEditor,
    setEditorState,
  } = useContext(EditoContext);

  if (!blog) {
    return <Loader />;
  }
  
  const { title, banner, content, tags, des } = blog;
  // console.log("Blog at editor", blog);

  let navigate = useNavigate();
  //ossum part + portion
  useEffect(() => {
    if (!textEditor.isReady) {
      setTextEditor(
        new EditorJS({
          holder: 'textEditorForm',
          data: Array.isArray(content)?content[0]:content,
          tools: tools,
          placeholder: "Let's write an awesome story",
        })
      );
    }
  }, []);
  const handelBannerUpload = async (e) => {
    try {
      let loadingToast = toast.loading("Uploading..");
      // console.log(e);
      let img = e.target.files[0];
      // console.log(img);

      let dataIMG = await getImgURL(img);
      toast.dismiss(loadingToast);
      toast.success("Successfully Uploaded");
      setBlog({ ...blog, banner: dataIMG });
    } catch (err) {
      toast.dismiss(loadingToast);
      return toast.error(err);
    }

    // console.log(dataIMG, "\nreturned data......");
  };

  const handelTitleKeyDown = (e) => {
    if (e.keyCode == 13) {
      // console.log(e.keycode);
      e.preventDefault();
    }
  };

  const handelTitleChange = (e) => {
    // console.log(e)
    let input = e.target;
    input.style.height = "auto";
    input.style.height = input.scrollHeight + "px";
    setBlog({ ...blog, title: input.value });
  };

  const handelPublishEvent = () => {
    if (!banner.length) {
      return toast.error("Upload a blog banner to publish.😘");
    }
    if (!title.length) {
      return toast.error("Write a blog title to publish.😊");
    }
    if (textEditor.isReady) {
      textEditor
        .save()
        .then((data) => {
          if (data.blocks.length) {
            setBlog({ ...blog, content: data });
            setEditorState("publish");
          } else {
            return toast.error("Write a something.\n we like to know you😊");
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  const handelImageNullError = (e) => {
    let img = e.target;
    img.src = defaultBanner;
  };

  return (
    <>
      <nav className="navbar">
        <Link to="/" className="flex-none w-10 ">
          <img src={logo} />
        </Link>
        <p className="max-md:hidden text-black line-clamp-3 w-full">
          {title.length ? title : "New Blog"}
        </p>
        <div className="flex gap-2 ml-auto">
          <button className="btn-dark py-2" onClick={handelPublishEvent}>
            Publish
          </button>
        </div>
      </nav>
      <ToastContainer position="bottom-right" />
      <AnimationWrapper>
        <section>
          <div className="mx-auto max-w-[900px] w-full">
            <div className="relative aspect-video bg-white border-2 border-grey hover: opacity-80 ">
              <label htmlFor="uploadBanner">
                <img
                  src={banner}
                  className="z-20"
                  onError={handelImageNullError}
                />
                <input
                  id="uploadBanner"
                  type="file"
                  accept=".png, .jpg, .jpeg"
                  hidden
                  onChange={handelBannerUpload}
                />
              </label>
            </div>
            <textarea
              defaultValue={title}
              placeholder="Blog Title"
              className="text-4xl font-medium w-full h-20 outline-none resize-none my-10 leading-tight placeholder:opacity-40 text-center"
              onKeyDown={handelTitleKeyDown}
              onChange={handelTitleChange}
              name=""
              id=""
            ></textarea>

            <hr className="w-full opacity-10 my-5" />
            <div id="textEditorForm" className="font-gelasio"></div>
          </div>
        </section>
      </AnimationWrapper>
    </>
  );
};
export default BlogEditor;
