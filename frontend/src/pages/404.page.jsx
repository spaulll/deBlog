import { Link } from "react-router-dom";
import PageNotFoundImage from "../imgs/404.png"

const PageNotFound = () => {
  return (
    <section className="h-cover relative p-10 flex flex-col items-center gap-20 text-center">
        <img src={PageNotFoundImage} className="select-none border-2 border-grey w-72 aspect-square" />
        <h1 className="text-4xl font-gelasio leading-3">Page not found</h1>
        <p className="">THe page you are loking for is not found. Go back to <Link to="/" className="text-[blue] underline">home Page</Link></p>

    </section>
  );
};
export default PageNotFound;