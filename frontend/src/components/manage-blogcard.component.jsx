import { Link } from "react-router-dom";
import { getDay } from "../common/date";

const BlogStats = ({ stats }) => {
  if (!stats || Object.keys(stats).length === 0) {
    return <div className="text-dark-grey">No stats available</div>;
  }
  
  return (
    <div className="flex gap-2 max-lg:mb-6 max-lg:pb-6 border-grey border-b">
      {Object.keys(stats).map((key, i) => {
        return !key.includes("parent") ? (
          <div
            className={
              "flex flex-col items-center w-full h-full justify-center p-4 px-6 " +
              (i !== 0 ? "border-grey border-1" : "")
            }
            key={i}
          >
            <h1 className="text-xl lg:text-2xl mb-2">
              {stats[key].toLocaleString()}
            </h1>
            <p className="max-lg:text-dark-grey capitalize">
              {key.split("_")[1]}
            </p>
          </div>
        ) : null;
      })}
    </div>
  );
};

export const ManagePublishBlogCard = ({ blog }) => {
  const { banner, blog_id, title, publishedAt, activity = {} } = blog;
  console.warn("ManagePublishBlogCard", blog);
  return (
    <div className="flex gap-10 border-b mb-6 max-md:px-4 border-grey items-center">
      {banner && (
        <img 
          src={banner} 
          alt={title}
          className="max-md:hidden lg:hidden xl:block w-28 h-28 flex-none bg-grey object-cover" 
        />
      )}
      
      <div className="flex flex-col justify-between py-2 w-full min-w-[300px]">
        <div>
          <Link 
            to={`/blog/${blog_id}`} 
            className="blog-title mb-4 hover:underline hover:text-black"
          >
            {title}
          </Link>
          <p className="line-clamp-1">
            Published on {getDay(publishedAt)}
          </p>
        </div>
        <div className="flex gap-6 mt-3">
          <Link to={`/editor/${blog_id}`} className="pr-4 py-2 underline">
            Edit
          </Link>
        </div>
      </div>
      
      <div className="max-lg:hidden">
        <BlogStats stats={activity} />
      </div>
    </div>
  );
};