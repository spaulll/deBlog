import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createAuth } from "thirdweb/auth";
import { privateKeyToAccount } from "thirdweb/wallets";
import { thirdwebClient } from "./thirdwebClient.js";
import multer from "multer";
import { uploadToIPFS, getIPFSUrl } from "./ipfsOps.js";
import { keccak256 } from "thirdweb/utils"
import { nanoid } from "nanoid";
import { searchUserProfiles } from "./libs/graph-ops/userProfile.js";

// GraphQL imports
import { getLatestBlogs, invalidateBlogsCache, getCacheStats } from "./libs/graph-ops/latestBlogs.js";
import { getTrendingBlogs } from "./libs/graph-ops/trendingBlogs.js";
import { getBlogsOfAuthor } from "./libs/graph-ops/blogsByAuthor.js";
import { getBlogsByKeywords, clearSearchCache, getCacheStats as searchCacheStats } from "./libs/graph-ops/blogsByKeyword.js";
import { getUserProfile } from "./libs/contractInteraction.js";
import { getComments } from "./libs/graph-ops/comments.js";


const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) throw new Error("PRIVATE_KEY is not defined");

const domain = process.env.DOMAIN;
if (!domain) throw new Error("DOMAIN is not defined");

const thirdwebSecretKey = process.env.THIRDWEB_SECRET_KEY;
if (!thirdwebSecretKey) throw new Error("THIRDWEB_SECRET_KEY is not defined");

console.log("DOMAIN: ", domain);
const port = process.env.PORT || 3000;

const app = express();
const storage = multer.memoryStorage();
const upload = multer({ storage });

app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin: domain,
        credentials: true,
    })
);

const thirdwebAuth = createAuth({
    domain: domain,
    client: thirdwebClient,
    adminAccount: privateKeyToAccount({
        client: thirdwebClient,
        privateKey: privateKey,
    }),
});

app.get("/", (req, res) => {
    return res.send("Auth server is live");
});

app.get("/login", async (req, res) => {
    const address = req.query.address;
    const chainId = req.query.chainId;

    if (typeof address !== "string") {
        return res.status(400).send("Address is required");
    }

    return res.send(
        await thirdwebAuth.generatePayload({
            address,
            chainId: chainId ? parseInt(chainId) : undefined,
        })
    );
});

app.post("/login", async (req, res) => {
    const payload = req.body;

    const verifiedPayload = await thirdwebAuth.verifyPayload(payload);

    if (verifiedPayload.valid) {
        const jwt = await thirdwebAuth.generateJWT({
            payload: verifiedPayload.payload,
        });
        res.cookie("jwt", jwt);
        return res.status(200).send({ token: jwt });
    }

    res.status(400).send("Failed to login");
});

app.get("/isLoggedIn", async (req, res) => {
    const jwt = req.cookies?.jwt;

    if (!jwt) {
        return res.send(false);
    }

    console.log("Received JWT", jwt);
    const authResult = await thirdwebAuth.verifyJWT({ jwt });
    if (!authResult.valid) {
        return res.send(false);
    }
    console.log("Verified JWT", authResult);
    return res.send(true);
});

app.post("/logout", (req, res) => {
    res.clearCookie("jwt");
    return res.send(true);
});

app.post("/upload-img-return-URL", upload.single("image"), async (req, res) => {
    try {
        // Step 1: Authenticate the user
        const jwt = req.cookies?.jwt;
        if (!jwt) {
            console.log("No JWT found in cookies");
            return res.status(401).json({ success: 0, message: "Unauthorized" });
        }
        const authResult = await thirdwebAuth.verifyJWT({ jwt });
        if (!authResult.valid) {
            console.log("Invalid JWT");
            return res.status(401).json({ success: 0, message: "Unauthorized" });
        }

        // Step 2: Validate the image
        if (!req.file) {
            console.log("No file uploaded");
            return res.status(400).json({ success: 0, message: "No file uploaded." });
        }
        const { buffer, originalname, mimetype } = req.file;

        // Step 3: Upload the image to IPFS using thirdweb
        // const storage = new ThirdwebStorage({
        //     secretKey: thirdwebSecretKey,
        // });

        // Method 1: Direct upload using the buffer
        // const ipfsUri = await storage.upload(buffer, {
        //     name: originalname,
        //     type: mimetype
        // });

        const ipfsUri = await uploadToIPFS(buffer, {
            name: originalname,
            type: mimetype
        });

        // If Method 1 doesn't work, try Method 2
        // const blob = new Blob([buffer], { type: mimetype });
        // const file = new File([blob], originalname, { type: mimetype });
        // const ipfsUri = await storage.upload(file);

        console.log("IPFS URI:", ipfsUri);

        // Resolve the IPFS URI to a public gateway URL.
        // const imageUrl = storage.resolveScheme(ipfsUri);
        // console.log("Image URL:", imageUrl);

        const imageUrl = await getIPFSUrl(ipfsUri);
        console.log("Image URL:", imageUrl);

        return res.status(200).json({
            success: 1,
            message: "Image uploaded successfully.",
            file: { url: imageUrl },
        });
    } catch (err) {
        console.error("Error processing image upload:", err);
        return res.status(500).json({ success: 0, message: "Internal Server Error." });
    }
});


app.post("/create-blog", async (req, res) => {
    try {
        // Step 1: Authenticate the user
        const jwt = req.cookies?.jwt;
        if (!jwt) {
            console.log("No JWT found in cookies");
            return res.status(401).json({ success: 0, message: "Unauthorized" });
        }
        const authResult = await thirdwebAuth.verifyJWT({ jwt });
        if (!authResult.valid) {
            console.log("Invalid JWT");
            return res.status(401).json({ success: 0, message: "Unauthorized" });
        }

        // Step 2: Validate the request body
        if (!req.body) {
            console.log("No blog JSON found in request body");
            return res.status(400).json({ success: 0, message: "No file uploaded." });
        }
        const blogJSON = req.body;
        console.log("Blog JSON:", blogJSON);
        let { title, des, banner, tags, content, draft, id } = blogJSON

        if (!title.length) {
            return res
                .status(403)
                .json({ error: "You must provide a title to publish the blog" });
        }
        if (!draft) {
            if (!title.length) {
                return res
                    .status(403)
                    .json({ error: "You must provide a title to publish the blog" });
            }
            if (!des.length || des.length > 200) {
                return res
                    .status(403)
                    .json({ error: "You must provide a desciption under 200 character." });
            }
            if (!banner.length) {
                return res
                    .status(403)
                    .json({ error: "You must provide a banner to publish" });
            }
            if (!content.blocks?.length) {
                return res.status(403).json({ error: "There must be some blog content" });
            }
            if (!tags.length || tags.length > 16) {
                return res
                    .status(403)
                    .json({ error: "You must provide a tags under limit" });
            }

            blogJSON.tags = tags.map((tag) => tag.toLowerCase());
        }
        const blog_id =
            title
                .replace(/[^a-zA-Z0-9]/g, " ")
                .replace(/\s+/g, "-")
                .trim() + nanoid();

        console.log("Blog ID:", blog_id);
        const blogIdHash = keccak256(blog_id);
        console.log("Blog ID Hash:", blogIdHash);

        blogJSON.blog_id = blogIdHash;
        console.log("Id on server:", id);
        // console.log(blogJSON)
        // Step 3: If previously created blog, update it

        // Step 4: upload the blogJson to IPFS
        const ipfsUri = await uploadToIPFS(JSON.stringify(blogJSON));
        console.log("IPFS URI:", ipfsUri);

        const blogUrl = await getIPFSUrl(ipfsUri);
        console.log("Blog URL:", blogUrl);

        // Download the blogJson from IPFS using the IPFS URI
        // const data = await storage.downloadJSON(ipfsUri);
        // console.log("IPFS Data:", data);

        return res.status(200).json({
            success: 1,
            message: "Blog is ready to be published.",
            blogUrl,
            blogIdHash,
            blogJSON                
        });

    } catch (err) {
        console.error("Error while creating blog:", err);
        return res.status(500).json({ success: 0, message: "Internal Server Error." });
    }
})

app.post("/api/invalidate-blog-cache", async (req, res) => {
    const jwt = req.cookies?.jwt ||"eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiIweDcyNkRDYjcxZGM5Mjk4RDg3Nzk2MzA5Y2RCQWYzMjIwRWJDNjg0NzIiLCJzdWIiOiIweDlCMkI1YmEzREJCNjU2RTA0QTVGNDRBQTQwYUMzNDEyRDNGQzBBQzUiLCJhdWQiOiJodHRwOi8vbG9jYWxob3N0OjUxNzMiLCJleHAiOjE3NDYwNzYwNTEsIm5iZiI6MTc0NTk4OTA0NCwiaWF0IjoxNzQ1OTg5NjUxLCJqdGkiOiIweGI0OWFlOTI1ZjMwNTU4YTk1ZTNkZTU4OTZmN2YwMDE3ZTA3MGJiOTE2YThhYzFlNjg0OTYxMzZjZTMyYmU2NDgiLCJjdHgiOnt9fQ.MHg0ZDdiNDM5MjlmNTg5ZDc1MDhlZmJjMDJhN2ZkZDgyZmVjMWVmZTBhZTVmMzlhNTBmNzM1YjQ3NTAxNjZhMmQ3NGRlMzdjMWFjMjRhMjliNDY4NTk1ZmU2NzJlNWNlYmVmYmIyNTc1YThkMzRjMWE1N2E0Yjk1MTFkMDJiZTVmOTFj" ;
    if (!jwt) {
        console.log("No JWT found in cookies");
        return res.status(401).json({ success: 0, message: "Unauthorized" });
    }
    const authResult = await thirdwebAuth.verifyJWT({ jwt });   
    if (!authResult.valid) {
        console.log("Invalid JWT");
        return res.status(401).json({ success: 0, message: "Unauthorized" });
    }

    const operation = req.body.operation;
    console.log("Operation:", operation);

    // Actually call the invalidation function
    const invalidationResult = invalidateBlogsCache();
    const searchInvalidationResult = clearSearchCache();
    console.log("Cache invalidation result:", invalidationResult, searchInvalidationResult);

    // Get cache stats after invalidation
    const cacheStats = getCacheStats();
    const searchCacheStat = searchCacheStats();
    return res.status(200).json({
        success: 1,
        message: "Cache invalidated successfully. Next fetch will use fresh data including IPFS content.",
        invalidationResult,
        cacheStats,
        searchCacheStat,
    });
});

app.get("/latest-blogs", async (req, res) => {
    try {
        // Pass the forceRefresh query parameter to getLatestBlogs
        const forceRefresh = req.query.forceRefresh;
        console.log("Force refresh:", forceRefresh);
        
        // Get cache stats before fetching to see if force refresh is pending
        const cacheStatsBefore = getCacheStats();
        console.log("Cache stats before fetch:", {
            forceRefreshPending: cacheStatsBefore.forceRefreshPending,
            totalKeys: cacheStatsBefore.keys.length
        });
        
        // Set timeout longer than the function's internal timeout to ensure we get a response
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Blog fetching timed out after 15s')), 15000)
        );
        
        // Race between fetch and timeout
        const blogs = await Promise.race([
            getLatestBlogs(forceRefresh),
            timeoutPromise
        ]);
        
        if (!blogs || !Array.isArray(blogs)) {
            return res.status(500).json({ 
                success: 0, 
                message: "Failed to fetch blogs or invalid data format" 
            });
        }
        
        // Log how many blogs have banners for debugging
        const blogsWithBanners = blogs.filter(blog => blog.banner && blog.banner !== "").length;
        console.log(`Retrieved ${blogs.length} blogs, ${blogsWithBanners} with banners`);
        
        return res.status(200).json({
            success: 1,
            message: "Latest blogs fetched successfully.",
            blogs,
            count: blogs.length,
            withBanners: blogsWithBanners
        });
    } catch (error) {
        console.error("Error fetching latest blogs:", error);
        
        // Try to get cached data as fallback
        try {
            const cacheStats = getCacheStats();
            const cachedBlogs = cache.get(BLOGS_CACHE_KEY);
            
            if (cachedBlogs && Array.isArray(cachedBlogs) && cachedBlogs.length > 0) {
                console.log("Returning cached blogs as fallback after error");
                const blogsWithBanners = cachedBlogs.filter(blog => blog.banner && blog.banner !== "").length;
                
                return res.status(200).json({
                    success: 1,
                    message: "Fetched blogs from cache (error with fresh data).",
                    blogs: cachedBlogs,
                    count: cachedBlogs.length,
                    withBanners: blogsWithBanners,
                    fromCache: true
                });
            }
        } catch (cacheError) {
            console.error("Error accessing cache:", cacheError);
        }
        
        return res.status(500).json({ 
            success: 0, 
            message: "Internal Server Error while fetching blogs: " + error.message 
        });
    }
});

app.get("/trending-blogs", async (req, res) => {
    const blogs = await getTrendingBlogs();
    console.log("trending Blogs:", blogs);
    if (!blogs) {
        return res.status(500).json({ success: 0, message: "Internal Server Error." });
    }
    console.log("Trending blogs:", blogs);
    return res.status(200).json({
        success: 1,
        message: "Trending blogs fetched successfully.",
        blogs
    });
});

app.get("/api/search-blogs", async (req, res) => {
    const query = req.query;
    let username = query.username || null;
    let address = query.address || null;
    let keyword = query.keyword || null;

    const rawQuery = query.q || query.query || query.keyword;

    // Check if rawQuery is provided and no other query parameters are set
    if (rawQuery && !req.query.username && !req.query.address) {
        if (rawQuery.length === 10) {
            username = rawQuery;
            keyword = rawQuery;
            console.log("1st condition matched:", username, keyword);
        } else if (rawQuery.length === 42 && rawQuery.startsWith("0x")) {
            address = rawQuery;
            console.log("2nd condition matched:", address);
        } else {
            keyword = rawQuery;
            console.log("3rd condition matched:", keyword);
        }
    }

    // search by username or address
    if (username || address) {
        const blogs = await getBlogsOfAuthor(username, address);
        if (!blogs) {
            return res.status(500).json({ success: 0, message: "Internal Server Error." });
        }
        console.log("Blogs of author:", blogs);
        return res.status(200).json({
            success: 1,
            message: "Blogs of author fetched successfully.",
            blogs
        });
    }
    // search by keyword
    else if (keyword) {
        const blogs = await getBlogsByKeywords(keyword.toLowerCase());
        if (!blogs) {
            return res.status(500).json({ success: 0, message: "Internal Server Error." });
        }
        console.log("Blogs by keyword:", blogs);
        return res.status(200).json({
            success: 1,
            message: "Blogs by keyword fetched successfully.",
            blogs
        });
    }

    // No valid search criteria provided
    return res.status(400).json({ success: 0, message: "Invalid search parameters." });
});

app.post("/get-user-profile", async (req, res) => {
    // const jwt = req.body?.jwt
    // console.log("Received JWT", jwt);
    // if (!jwt) {
    //     console.log("No JWT found in cookies");
    //     return res.status(401).json({ success: 0, message: "Unauthorized" });
    // }
    // const authResult = await thirdwebAuth.verifyJWT({ jwt });
    // if (!authResult.valid) {
    //     console.log("Invalid JWT");
    //     return res.status(401).json({ success: 0, message: "Unauthorized" });
    // }
    const username = req.body.username;
    // const address =  authResult.parsedJWT["sub"];
    // console.log("User address:", address);
    const user = await getUserProfile(null, username);
    console.log("User data:", user);
    return res.status(200).json({
        success: 1,
        message: "User profile fetched successfully.",
        user
    });
});

app.get("/api/search-users", async (req, res) => {
    const query = req.query.q || req.query.query || req.query.keyword;
    console.log("Search query:", query);
    if (!query) {
        return res.status(400).json({ success: 0, message: "Query is required" });
    }
    if (query.length === 42 && query.startsWith("0x")) {
        const data = await searchUserProfiles({ address: query });
        if (!data) {
            return res.status(500).json({ success: 0, message: "Internal Server Error." });
        }
        console.log("User:", data);
        return res.status(200).json({
            success: 1,
            message: "User fetched successfully.",
            results: data
        });
    } else {
        const data = await searchUserProfiles({ username: query });
        if (!data) {
            return res.status(500).json({ success: 0, message: "Internal Server Error." });
        }
        console.log("Users:", data);
        return res.status(200).json({
            success: 1,
            message: "Users fetched successfully.",
            results: data
        });
    }
});
app.get("/api/get-comments", async (req, res) => {
    const blogId = req.query.blog_id;
    console.log("at get comment Blog ID:", blogId);
    if (!blogId) {
        return res.status(400).json({ success: 0, message: "Blog ID is required" });
    }
    const comments = await getComments(blogId);
    if (!comments) {
        return res.status(500).json({ success: 0, message: "Internal Server Error." });
    }
    console.log("Comments:", comments);
    return res.status(200).json({
        success: 1,
        message: "Comments fetched successfully.",
        results: comments
    });
});

app.listen(port, () => {
    console.log(`⚡ Auth server listening on port ${port}....`);
});