import { Link, Outlet, useNavigate } from "react-router-dom";
import logo from "../imgs/logo.webp";
import { Search, PenLine, Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { UserContext } from "../App";
import UserNavigationPanel from "./user-navigation.component";
// import axios from "axios";
import ConnectButtonAuth from "./web3Component/ConnectButtonAuth";
import {
  getAvatar,
  isRegisteredUser,
  registerUser,
  getUserProfile,
} from "../lib/contractInteraction";
import { useActiveAccount } from "thirdweb/react";
import { useAuth } from "../contexts/AuthContext";
import { use } from "react";
import { toast, Toaster } from "react-hot-toast";
import { ErrorModal, LoadingOverlay, SuccessModal } from "./register.modal-component";

const Navbar = () => {
  const [searchboxvisibility, setSearchboxvisibility] = useState(false);
  const [userNavPanel, setUserNavPanel] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const[isErrorModelopen, setIsErrorModelopen] = useState(false)
  let navigate = useNavigate();

  const [isAvatarLoading, setIsAvatarLoading] = useState(true);
  const [localAvatar, setLocalAvatar] = useState(null); // NEW: Local state to track UI updates

  const { isLoggedIn, avatarUrl, setAvatarUrl, userAddress, setUserAddress, userName, setUserName } = useAuth();
  const address = useActiveAccount()?.address ?? "";
  const account = useActiveAccount();
  // for debugging
  console.log("isLoggedIn:", isLoggedIn);
  // console.log("Wallet address:", address);

  const handelSearch = (e) => {
    let query = e.target.value;
    if (e.keyCode == 13 && query.length) {
      navigate(`/search/${query}`);
    }
  };
  const handeluserNavPanel = () => {
    setUserNavPanel((currentvalue) => !currentvalue);
  };

  const fetchAvatarUrl = async (address) => {
    console.log("Fetching avatar for address:", address);
    try {
      const avatarUrl = await getAvatar(address);
      console.log("Fetched Avatar URL:", avatarUrl);
      return avatarUrl;
    } catch (error) {
      console.error("Error fetching avatar:", error);
      return null;
    }
  };
  const hadleRegister = async () => {
    try {
      toast.error("You are not Registered");
      let loadingToast = toast.loading("Registering user ...");
      const result = await registerUser(account);
      setUserName(result.username)
      setIsLoading(false)
      // toast.dismiss(loadingToast);
      if (result) {
        toast.dismiss(loadingToast);
        toast("Successfully registered", { icon: "👌" });
        setIsModalOpen(true)
        console.log("Hash:", result.transactionHash);
        // console.log("isRegistered:", isRegistered);
      }
    } catch (error) {
      console.log("Some error occurred.", error);
      toast.dismiss(loadingToast);
      toast.error("Failed to register!");
      setIsLoading(false)
      setIsErrorModelopen(true)
    }
  };
  useEffect(() => {
    if (isLoggedIn && address) {
      setUserAddress(address); // Update global state

      setIsAvatarLoading(true);
      console.log("Fetching avatar for:", address);

      fetchAvatarUrl(address).then((avatarUrl) => {
        const finalAvatarUrl =
          avatarUrl ||
          "https://api.dicebear.com/9.x/adventurer/svg?seed=default";

        setAvatarUrl(finalAvatarUrl); // Update global state
        setLocalAvatar(finalAvatarUrl); // Update local state

        console.log("Final Avatar URL:", finalAvatarUrl);
        setIsAvatarLoading(false);
      });

      isRegisteredUser(address).then((isRegistered) => {
        getUserProfile(address).then((data) => {
          setUserName(data.username);
        })
        let loadingToast = toast.loading("loading profile...");
        console.log("isRegistered:", isRegistered);
        setIsLoading(true)
        if (!isRegistered) {
          toast.dismiss(loadingToast);
          hadleRegister();
        } else if (isRegistered) {
          toast.dismiss(loadingToast);
          toast("Welcome Back to deBlog!", { icon: "😀" });
          setIsLoading(false)
        }
      });
    }
  }, [isLoggedIn, address]); // Added `address` as a dependency

  useEffect(() => {
    console.log("Updated userAddress:", userAddress);
    console.log("Updated userName:", userName);
  }, [userAddress, userName]);

  console.log("isAvatarLoading state:", isAvatarLoading);
  console.log("Avatar URL before rendering:", localAvatar); // Updated to use local state

  return (
    <>
      <Toaster />
      <nav className="navbar z-50">
        <Link to="/" className="flex-none w-11 md:w-16">
          <img src={logo} className="w-full rounded-2xl" alt="Logo" />
        </Link>

        {/* {
          new_notification_available 
        } */}

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
            onClick={() =>
              setSearchboxvisibility((currentvalue) => !currentvalue)
            }
          >
            <Search className="absolute text-xl" />
          </button>

          {isLoggedIn ? (
            <>
              <Link to="/editor" className="hidden md:flex gap-2 link">
                <PenLine className="w-6" />
                <p>write...</p>
              </Link>

              {/*  */}
              {/* Will be added later */}
              {/*  */}
              {/* <Link to="/dashboard/notifications">
                <button className="w-12 h-12 rounded-full bg-grey relative hover:bg-purple-100">
                  <Bell size="20px" className="text-2xl block mt-1 ml-3" />{
                    new_notification_available ?
                      <span className="bg-red w-3 h-3 rounded-full absolute z-10 right-1 top-0 "></span>
                      :
                      ""
                  }
                </button>
              </Link> */}

              <div className="relative">
                <button
                  className="w-12 h-12 mt-1"
                  onClick={() => setUserNavPanel((prev) => !prev)}
                >
                  {isAvatarLoading || !localAvatar ? (
                    <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-500 rounded-full animate-spin"></div> // Show loading
                  ) : (
                    <img
                      src={localAvatar}
                      className="w-full h-full rounded-full object-cover"
                      alt="User Avatar"
                      onError={(e) =>
                        (e.target.src =
                          "https://api.dicebear.com/9.x/adventurer/svg?seed=default")
                      }
                    />
                  )}
                </button>
              </div>
              {userNavPanel ? (
                <UserNavigationPanel setUserNavPanel={setUserNavPanel} />
              ) : (
                ""
              )}
            </>
          ) : (
            <ConnectButtonAuth />
          )}
        </div>
      </nav>
      <Outlet />
      {
        isLoading? <LoadingOverlay isLoading={isLoading} text="Registering..." /> : ""
      }
      {
        isModalOpen? <SuccessModal  onClose={()=> setIsModalOpen(false)} /> :""
      }
      {
        isErrorModelopen? <ErrorModal onClose={()=> setIsErrorModelopen(false)}/> : ""
      }

    </>
  );
};
export default Navbar;
