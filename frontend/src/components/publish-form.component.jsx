import AnimationWrapper from "../common/page-animation";
import { ToastContainer, toast } from "react-toastify";
import { X } from "lucide-react";
import { useContext, useEffect, useState, useRef } from "react";
import { EditoContext } from "../pages/editor.pages";
import Tag from "./tags.component";
import axios from "axios";
import { UserContext } from "../App";
import { useNavigate, useParams } from "react-router-dom";
import { useUploadBlog, useEditBlog } from "../lib/contractInteraction";
import { use } from "react";
// import { }

const PublishEditor = () => {
  const [isEdited, setIsEdited] = useState(false);
  const uploadBlog = useUploadBlog();
  const editBlog = useEditBlog();
  let { blog_id } = useParams()
  const prev_Blog_id = useRef(""); 
  let characterLimit = 200;
  const tagLimit = 16;
  let {
    blog,
    blog: { title, banner, tags, des, content, draft },
    setEditorState,
    setBlog,
  } = useContext(EditoContext);

  // let {
  //   userAuth: { access_token },
  // } = useContext(UserContext);
  let navigate = useNavigate();

  useEffect(() => {
    if (blog_id) {
      setIsEdited(true);
      prev_Blog_id.current = blog_id;
    }
  }, [blog_id]);
  console.log("isEdited", isEdited);
  console.log("prev_Blog_id", prev_Blog_id.current);
  const handelCloseEvent = () => {
    setEditorState("editor");
  };

  const handeltheBlogTitleChange = (e) => {
    let input = e.target;
    setBlog({ ...blog, title: input.value });
  };

  const handelonChangeDescription = (e) => {
    let input = e.target;
    setBlog({ ...blog, des: input.value });
  };
  const handelTitleKeyDown = (e) => {
    if (e.keyCode == 13) {
      // console.log(e.keycode);
      e.preventDefault();
    }
  };

  const handelKeyDown = (e) => {
    if (e.keyCode == 13 || e.keyCode == 188) {
      e.preventDefault();
      let tagValue = e.target.value;
      if (tags.length < tagLimit) {
        if (!tags.includes(tagValue) && tagValue.length) {
          setBlog({ ...blog, tags: [...tags, tagValue] });
        }
      } else {
        toast.error(`You can add max ${tagLimit} `);
      }
      e.target.value = "";
    }
  };
  const publishBlog = (e) => {
    if (e.target.className.includes("disable")) {
      return;
    }
    if (!title.length) {
      return toast.error("write blog title before publishing.");
    }
    if (!des.length || des.length > characterLimit) {
      return toast.error(
        `Write a description within ${characterLimit} before publish.`
      );
    }
    if (!tags.length || tags.length > tagLimit) {
      return toast.error(`Add tags within ${tagLimit} before publish.`);
    }
    let loadingToast = toast.loading("publishing.....");
    e.target.classList.add("disable");
    let blogObj = {
      title,
      des,
      banner,
      content,
      tags,
      draft: false
    };
    console.log(blogObj)
    let blogJson = JSON.stringify(blogObj);
    console.log("Blog JSON", blogJson);
    axios
      .post(import.meta.env.VITE_SERVER_URL + "/create-blog", { ...blogObj, id: blog_id }, {
        withCredentials: true,
        headers: {
          contentType: "application/json",
        },
      })
      .then(({ data }) => {
        e.target.classList.remove("disable");
        // toast.dismiss(loadingToast);
        // toast.success("done");

        const { blogUrl, blogIdHash, blogJSON } = data;
        const tags = blogJSON.tags;
        console.log("Id and URL: ", blogIdHash, blogUrl);
        if (blogIdHash && blogUrl) {
          if (isEdited) {
            toast.dismiss(loadingToast);
            loadingToast = toast.loading("Updating the blog...");          
            editBlog(blogUrl, tags, prev_Blog_id.current).then(() => {
              toast.dismiss(loadingToast);
              toast.success("Blog updated successfully.");
              navigate(`/blog/${prev_Blog_id.current}`);
            }).catch((err) => {
              toast.dismiss(loadingToast);
              toast.error(err);
            });
          } else {
            toast.dismiss(loadingToast);
            loadingToast = toast.loading("Publishing the blog...");
            uploadBlog(blogUrl, tags, blogIdHash, title, des).then(() => {
              toast.dismiss(loadingToast);
              toast.success("Blog published successfully.");
              navigate(`/blog/${blogIdHash}`);
            }).catch((err) => {
              toast.dismiss(loadingToast);
              toast.error(err);
            });
          }
        } else {
          toast.dismiss(loadingToast);
          toast.error("Missing blog data");
        }
      })
      .catch(({ response }) => {
        e.target.classList.remove("disable");
        toast.dismiss(loadingToast);
        return toast.error(response.data.error);
      });
  };
  return (
    <>
      <AnimationWrapper>
      <ToastContainer position="bottom-right" />
        <section className="w-screen min-h-screen grid items-center lg:grid-cols-2 py-16 lg:gap-4">
          <button
            className=" w-12 h-12 absolute right-[5vw] z-10 top-[5%] lg:top-[10%]"
            onClick={handelCloseEvent}
          >
            <X className="" />
          </button>
          <div className="max-w-[500px] center ">
            <p className=" text-dark-grey mb-1">Preview</p>
            <div className="w-full aspect-video rounded-lg overflow-hidden bg-grey mt-4">
              <img src={banner} />
            </div>
            <h1 className=" text-4xl font-medium mt-2 leading-tight line-clamp-2">
              {title}
            </h1>
            <p className="font-gelasio line-clamp-2 text-xl leading-7  mt-4">
              {des}
            </p>
          </div>

          <div className="border-grey lg:border-1 lg: pl-8 ">
            <p className="text-dark-grey mb-2 mt-9 "> Blog title</p>
            <input
              type="text"
              placeholder="Blog title"
              defaultValue={title}
              className="input-box pl-4 "
              onChange={handeltheBlogTitleChange}
            />
            {/* // Short description about */}
            <p className="text-dark-grey mb-2 mt-9 ">Short description about</p>
            <textarea
              className="h-40 resize-none leading-none input-box pl-4"
              maxLength={characterLimit}
              defaultValue={des}
              onChange={handelonChangeDescription}
              onKeyDown={handelTitleKeyDown}
            ></textarea>
            <p className=" mt-1 text-dark-grey text-sm text-right">
              {characterLimit - (des?.length || 0)}/{characterLimit}
            </p>

            <p className="text-dark-grey mb-2 mt-9 ">
              Topics- (Helps other to find your blog)
            </p>

            <div className="relative input-box pl-2 py-2 pb-4">
              <input
                type="text"
                placeholder="Topics"
                className=" sticky input-box bg-white top-0 left-0 pl-4 mb-3 focus:bg-white placeholder:text-dark-grey"
                onKeyDown={handelKeyDown}
              />
              {tags.map((tag, i) => {
                return <Tag tag={tag} tagIndex={i} key={i} />;
              })}
              <p className="mt-1 mb-4 text-dark-grey text-right ">
                {tagLimit - tags.length}
              </p>
            </div>
            <button className="btn-dark px-8 py-2 mt-4" onClick={publishBlog}>
              Publish
            </button>
          </div>
        </section>
      </AnimationWrapper>
    </>
  );
};
export default PublishEditor;
