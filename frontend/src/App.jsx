import { Routes, Route } from "react-router-dom";
import { createContext } from "react";
import Navbar from "./components/navbar.component";
import Editor from "./pages/editor.pages";
import HomePage from "./pages/home.page";
import SearchPage from "./pages/search.page";
import PageNotFound from "./pages/404.page";
import ProfilePage from "./pages/profile.page";
import BlogPage from "./pages/blog.page";
import SideNav from "./components/sidenavbar.component";
import EditProfile from "./pages/edit-profile.page";
import ManageBlogs from "./pages/manage-blogs.page";

export const UserContext = createContext({});

const App = () => {

  return (
    <Routes>
      <Route path="/editor" element={<Editor />} />
      <Route path="/editor/:blog_id" element={<Editor />} />

      <Route path="/" element={<Navbar />}>
        <Route index element={<HomePage />} />
        <Route path="dashboard" element={<SideNav />}>
          <Route path="blogs" element={<ManageBlogs />} />
        </Route>
        <Route path="settings" element={<SideNav />}>
          <Route path="edit-profile" element={<EditProfile />} />
        </Route>

        <Route path="search/:query" element={<SearchPage />} />
        <Route path="user/:id" element={<ProfilePage />} />
        <Route path="blog/:blog_id" element={<BlogPage />} />
        <Route path="*" element={<PageNotFound />} />
      </Route>
    </Routes>
  );
};

export default App;
