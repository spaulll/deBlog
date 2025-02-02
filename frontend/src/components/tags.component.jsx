import { X } from "lucide-react";
import { useContext } from "react";
import { EditoContext } from "../pages/editor.pages";

const Tag = ({ tag }) => {
  let {
    blog,
    blog: { tags },
    setBlog,
  } = useContext(EditoContext);


  const handelTagDelete = () => {
    tags = tags.filter((t) => t != tag);
    setBlog({ ...blog, tags });
  };


  const addEditable = (e) => {
    e.target.setAttribute("contentEditable", true);
    e.target.focus();
  };

  const handelTagEdit = (e) => {
    if (e.keyCode == 13 || e.keyCode == 188) {
      e.preventDefault();
      let currentTag = e.target.innerText;
      tags[tagIndex] = currentTag;
      setBlog({ ...blog, tags });
      e.target.setAttribute("contentEditable", false);
      
    }
  };

  return (
    <>
      <div className=" relative p-2 mt-2  mr-2 px-5 bg-white rounded-full inline-block hover:bg-opacity-50 pr-10">
        <p
          className="outline-none"
          onKeyDown={handelTagEdit}
          onClick={addEditable}
          onBlur={(e) => e.target.setAttribute("contentEditable", false)}
        >
          {tag}
        </p>
        <button
          className="mt-[2px] rounded-full absolute right-3 top-1/2 -translate-y-1/2"
          onClick={handelTagDelete}
        >
          <X className="text-sm pointer-events-none" />
        </button>
      </div>
    </>
  );
};
export default Tag;
