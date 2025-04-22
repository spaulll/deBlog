import React, { Component, useContext, useEffect, useRef, useState } from "react";
import { Navigate, NavLink, Outlet } from "react-router-dom";
import { UserContext } from "../App";
import { Bell, Edit, FileText, Menu, RectangleEllipsis, User } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import ConnectButtonAuth from "./web3Component/ConnectButtonAuth";

const SideNav = () => {

  const { isLoggedIn } = useAuth();
  let page = location.pathname.split("/")[2];
  page = page.replace("-", ' ')
  let [pageState, setPageState] = useState(page);
  let [showSideNav, setShowSideNav] = useState(false)

  let activeTabLine = useRef()
  let sideBarIconTab = useRef()
  let pageStateTab = useRef()

  const changePageState = (e) => {

    let { offsetWidth, offsetLeft } = e.target;
    activeTabLine.current.style.width = offsetWidth + "px";
    activeTabLine.current.style.left = offsetLeft + "px";

    if (e.target == sideBarIconTab.current) {
      setShowSideNav(true)
    } else {
      setShowSideNav(false)
    }
  }

  useEffect(() => {
    setShowSideNav(false)
    // pageStateTab.current.click();
  }, [pageState])

  return isLoggedIn === false ? (
    <div className="flex flex-col justify-center items-center h-screen">
      <h2 className="text-3xl font-semibold">
        You are not logged in. Please connect your wallet
      </h2>
      <div className="h-5" />
      <ConnectButtonAuth />
    </div>
  ) : (
    <>
      <section className="relative flex gap-10 m-0 py-0 max-md:flex-col ">
        <div className="sticky top-[80px] z-30">
          <div className="md:hidden bg-white py-1 border-b border-grey flex flex-nowrap overflow-x-auto">
            <button ref={sideBarIconTab} className="p-5 capitalize" onClick={changePageState}>
              <Menu className="pointer-events-none" />
            </button>
            <button ref={pageStateTab} className="p-5 capitalize" onClick={changePageState}>{pageState}</button>

            <hr ref={activeTabLine} className="absolute bottom-0 duration-500 " />
          </div>

          <div className={"min-w-[200px] h-[clac(100vh-80px-60px)]  md:sticky top-24 overflow-y-auto p-6 md:pr-0  md:border-r absolute max-md:top-[64px] bg-white max-md:w-[calc[100% +80px]] max-md:px-16 max-md:ml-7 duration-500 " + (!showSideNav ? "max-md:opacity-0 max-md:pointer-events-none" : "opacity-100 pointer-events-auto")}>
            <h1 className="text-xl text-dark-grey">Dashboard</h1>
            <hr className="border-grey -ml-6 mb-8 mr-6" />
            <NavLink
              to="/dashboard/blogs"
              onClick={(e) => setPageState(e.target.innerText)}
              className="sidebar-link"
            >
              <FileText />
              blogs
            </NavLink>

            {/* <NavLink
              to="/dashboard/notifications"
              onClick={(e) => setPageState(e.target.innerText)}
              className="sidebar-link"
            >
              <Bell />
              {
                new_notification_available ?
                  <span className="bg-red w-3 h-3 rounded-full absolute z-10 left-10 top-[146px] md:right-0 md:top-0"></span>
                  :
                  ""
              }
              Notification
            </NavLink> */}

            <NavLink
              to="/editor"
              onClick={(e) => setPageState(e.target.innerText)}
              className="sidebar-link"
            >
              <Edit />
              Write
            </NavLink>

            <h1 className="text-xl text-dark-grey mt-20">Setting</h1>
            <hr className="border-grey -ml-6 mb-8 mr-6" />
            <NavLink
              to="/settings/edit-profile"
              onClick={(e) => setPageState(e.target.innerText)}
              className="sidebar-link"
            >
              <User />
              Edit Profile
            </NavLink>
            {/* <NavLink
              to="/settings/change-password"
              onClick={(e) => setPageState(e.target.innerText)}
              className="sidebar-link"
            >
              <RectangleEllipsis />
              change password
            </NavLink> */}
          </div>
        </div>

        <div className="max-md:-mt-8 mt-55 w-full">
          <Outlet />
        </div>
      </section>
    </>
  );
};
export default SideNav;
