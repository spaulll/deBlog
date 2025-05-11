import axios from "axios";
import { useEffect, useState } from "react";
import { Search } from 'lucide-react';
import InPageNavigation from "../components/inpage-navigation.component";
import Loader from "../components/loader.component";
import NoDataMessage from "../components/nodata.component";
import AnimationWrapper from "../common/page-animation";
import { ManagePublishBlogCard } from "../components/manage-blogcard.component";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ManageBlogs = () => {
    const { isLoggedIn, userAddress, userName } = useAuth();
    const [blogs, setBlogs] = useState(null);
    const [searchInput, setSearchInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    let [searchParams] = useSearchParams();
    let activeTab = searchParams.get("tab");

    const getBlogs = async (searchQuery = null) => {
        setIsLoading(true);

        try {
            const response = await axios.get(
                `${import.meta.env.VITE_SERVER_URL}/api/search-blogs`,
                {
                    params: {
                        keyword: searchQuery || userAddress,
                    },
                }
            );

            console.log("API response type:", typeof response.data);
            console.log("API response:", response.data);

            // Extract blogs array from the response object
            let blogsData = [];

            if (Array.isArray(response.data)) {
                blogsData = response.data;
            } else if (response.data && response.data.blogs && Array.isArray(response.data.blogs)) {
                blogsData = response.data.blogs;
            } else if (response.data && response.data.results && Array.isArray(response.data.results)) {
                blogsData = response.data.results;
            }

            console.log("Processed blogs data:", blogsData);
            setBlogs(blogsData);

        } catch (err) {
            console.error("Failed to fetch blogs:", err);
            setBlogs([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (e) => {
        if (e.keyCode === 13 && searchInput.trim().length) {
            getBlogs(searchInput);
        }
    };

    const handleChange = (e) => {
        const value = e.target.value;
        setSearchInput(value);

        // If search field is cleared, reset to the user's blogs
        if (!value.trim().length) {
            getBlogs();
        }
    };

    // Initial data fetch when component mounts
    useEffect(() => {
        if (isLoggedIn) {
            getBlogs();
        }
    }, [isLoggedIn, userAddress]);

    return (
        <>
            <h1 className="max-md:hidden text-4xl pt-5 text-dark-grey tracking-tight leading-tight">
                Welcome @{userName}
            </h1>

            <div className="relative max-md:mt-5 md:mt-8 mb-10">
                <input
                    type="search"
                    className="w-full bg-grey p-4 pl-12 pr-6 rounded-full placeholder:text-dark-grey"
                    placeholder="Search blogs"
                    value={searchInput}
                    onChange={handleChange}
                    onKeyDown={handleSearch}
                />
                <Search className="absolute right-[10%] md:pointer-events-none md:left-5 top-1/2 -translate-y-1/2 text-xl text-dark-grey" />
            </div>

            <InPageNavigation
                routes={["Published Blogs"]}
                defaultActiveIndex={activeTab !== 'draft' ? 0 : 1}
            >
                {/* Published blogs */}
                {isLoading ? (
                    <Loader />
                ) : !blogs ? (
                    <Loader />
                ) : blogs.length === 0 ? (
                    <NoDataMessage message="No published blogs available" />
                ) : (
                    <>
                        {blogs.map((blog, i) => (
                            <AnimationWrapper key={blog.blog_id || i} transition={{ delay: i * 0.04 }}>
                                <ManagePublishBlogCard
                                    blog={{ ...blog, index: i, setStateFunc: setBlogs }}
                                />
                            </AnimationWrapper>
                        ))}
                    </>
                )}

                {/* Drafts tab */}
                {activeTab === 'draft' && (
                    <NoDataMessage message="No draft blogs available" />
                )}
            </InPageNavigation>
        </>
    );
};

export default ManageBlogs;