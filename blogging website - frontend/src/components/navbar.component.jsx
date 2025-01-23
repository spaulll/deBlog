// Navbar.jsx
import { Link, Outlet, useNavigate } from "react-router-dom";
import logo from "../imgs/dblog.webp";
import { Search, PenLine, Bell } from "lucide-react";
import { useContext, useState } from "react";
import { UserContext } from "../App";
import UserNavigationPanel from "./user-navigation.component";

const Navbar = () => {
  const [searchboxvisibility, setSearchboxvisibility] = useState(false);
  const [userNavPanel, setUserNavPanel] = useState(false);
  let navigate = useNavigate();

  const handelSearch = (e) =>{
    let query = e.target.value;
    if(e.keyCode == 13 && query.length){
      navigate(`/search/${query}`);

    }
  }
  const handeluserNavPanel = () => {
    setUserNavPanel((currentvalue) => !currentvalue);
  };

  const {
    userAuth,
    userAuth: { access_token, profile_img },
  } = useContext(UserContext);

  return (
    <>
      <nav className="navbar">
        <Link to="/" className="flex-none w-11 md:w-16">
          <img src={logo} className="w-full rounded-2xl" alt="Logo" />
        </Link>
        <div
          className={
            "absolute bg-white w-full left-0 top-full mt-0.5 border-b border-grey py-4 px-[5vw] md:border-0 md:block md:relative md:inset-0 md:p-0 md:w-auto md:show flex items-center " +
            (searchboxvisibility ? "show" : "hide")
          }
        >
          <div className="relative flex items-center w-full">
            <input
              type="text"
              placeholder="Search"
              className="w-full md:w-auto bg-grey p-4 pl-6 pr-[12%] md:pr-6 rounded-full placeholder:text-dark-grey md:pl-12"
              onKeyDown={handelSearch}
            />
            <Search className="absolute right-[10%] md:pointer-events-none md:left-5 top-1/2 -translate-y-1/2 text-2xl text-dark-grey" />
          </div>
        </div>
        <div className="flex items-center gap-3 md:gap-6 ml-auto">
          <button
            className="md:hidden bg-grey w-12 h-12 rounded-full flex items-center justify-center"
            onClick={() => setSearchboxvisibility((currentvalue) => !currentvalue)}
          >
            <Search className="absolute text-xl" />
          </button>
          <Link to="/editor" className="hidden md:flex gap-2 link">
            <PenLine className="w-6" />
            <p>write...</p>
          </Link>
          {access_token ? (
            <>
              <Link to="/dashboard/notification">
                <button className="w-12 h-12 rounded-full bg-grey relative hover:bg-purple-100">
                  <Bell size="20px" className="text-2xl block mt-1 ml-3" />
                </button>
              </Link>

              <div className="relative">
                <button className="w-12 h-12 mt-1" onClick={handeluserNavPanel}>
                  <img
                    src={profile_img}
                    className="w-full h-full rounded-full object-cover"
                  />
                </button>
              </div>
              {userNavPanel ? <UserNavigationPanel setUserNavPanel={setUserNavPanel} /> : ""}
            </>
          ) : (
            <>
              <Link className="btn-dark py-2" to="/signin">
                Sign In
              </Link>
              <Link className="btn-light py-2 hidden md:block" to="/signup">
                Sign UP
              </Link>
            </>
          )}
        </div>
      </nav>
      <Outlet />
    </>
  );
};
export default Navbar;