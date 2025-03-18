import { AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { PenLine } from "lucide-react";
import { useContext, useEffect, useRef } from "react";
import { UserContext } from "../App";
// import { removeFromSession } from "../common/session";

import { Logout, WalletInfo} from "./web3Component/logout";


const UserNavigationPanel = ({ setUserNavPanel }) => {
  // const {
  //   userAuth: { username },
  //   setUserAuth,
  // } = useContext(UserContext);
  
  const navRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setUserNavPanel(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setUserNavPanel]);

  // const signOutUser = () => {
  //   removeFromSession("user");
  //   setUserAuth({ access_token: null });
  // };

  const username = "user"     // for testing
  return (
    <AnimatePresence
      transition={{ duration: 0.2 }}
      className="absolute right-0 z-50"
    >
      <div ref={navRef} className="bg-white absolute right-0 top-full z-50 border border-grey w-60 duration-200 mt-2 shadow-lg">
        <Link to="/editor" className="flex gap-2 link md:hidden pl-8 py-4">
          <PenLine />
          <p>write...</p>
        </Link>
        <Link to={`/user/${username}`} className="link pl-8 py-4">
          profile
        </Link>
        <Link to={`/dashboard/blogs`} className="link pl-8 py-4">
          Dashboard
        </Link>
        <Link to={`/settings/edit-profile`} className="link pl-8 py-4">
          Settings
        </Link>
        <span className="absolute border-t border-grey w-[100%]"></span>
        {/* <button
          className="text-left p-4 hover:bg-grey w-full pl-8 py-4"
          onClick={signOutUser}
        >
          <h1 className="font-bold text-xl mg-1">Signout</h1>
          <p className="text-dark-grey">@{username}</p>
        </button> */}
        
        {/* Logout and Wallet info modal */}
        <Logout/>   
        <div className=" pl-6 pb-2">
        <WalletInfo />
        </div>
        
      </div>
    </AnimatePresence>
  );
};
export default UserNavigationPanel;