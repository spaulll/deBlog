import { gql, request } from 'graphql-request';
import dotenv from 'dotenv';
dotenv.config();

// Define the GraphQL query to fetch the posts.
const query = gql`
{
  postCreateds(orderBy: timestamp, orderDirection: desc) {
    userAddress
    username
    blogIdHash
    description
    ipfsUri
    tags
    timestamp
    title
  }
  postReacteds {
    blogIdHash
    postOwner
    likes
  }
}
`;

// The URL for your subgraph endpoint.
const url = process.env.BLOGS_SUBGRAPH_URL;
// Include the authorization header if needed.

const headers = { Authorization: `Bearer ${process.env.GRAPH_API_KEY}` };

/**
 * Utility function to truncate an Ethereum address to a format like 0x11...1189.
 * @param {string} address - The full Ethereum address.
 * @returns {string} The truncated address.
 */
function truncateAddress(address) {
  if (address.length < 10) return address;
  return address.substring(0, 4) + "..." + address.substring(address.length - 4);
}

/**
 * Transforms the raw GraphQL response into the desired blog object format.
 * @param {Array} latestBlogs - Array of posts from the GraphQL response.
 * @returns {Array} Transformed array of blog objects.
 */
async function transformLatestBlogs(latestBlogs, postReacteds) {
  const resolvedPosts = await Promise.all(
    latestBlogs.map(async (post) => {
      let bannerUrl = "";

      try {
        const res = await fetch(post.ipfsUri);
        const json = await res.json();
        bannerUrl = json.banner || "";
      } catch (err) {
        console.error("Failed to fetch IPFS JSON for latest blog:", err);
      }

      // Find the latest like count for this blog
      const matchedReaction = postReacteds.find(
        (reaction) => reaction.blogIdHash.toLowerCase() === post.blogIdHash.toLowerCase()
      );

      const totalLikes = matchedReaction ? parseInt(matchedReaction.likes) : 0;

      return {
        activity: {
          total_likes: totalLikes,
          total_comments: 0,
          // total_reads: 0,
          total_parent_comments: 0,
        },
        blog_id: post.blogIdHash,
        title: post.title,
        banner: bannerUrl,
        des: post.description,
        tags: post.tags,
        author: {
          personal_info: {
            fullname: truncateAddress(post.userAddress),
            username: post.username,
            profile_img: post.avatarUri || `https://api.dicebear.com/9.x/adventurer/svg?seed=${post.userAddress}`,
          },
        },
        publishedAt: new Date(post.timestamp * 1000),
      };
    })
  );

  return resolvedPosts;
}


/**
 * Asynchronously fetches the latest blogs from The Graph, transforms the data,
 * and returns it in the desired format.
 * @returns {Promise<Array>} A promise that resolves to an array of formatted blog objects.
 */
const getLatestBlogs = async () => {
  try {
    const data = await request(url, query, {}, headers);
    console.log('GraphQL response:', data);
    const latestBlogs = transformLatestBlogs(data.postCreateds, data.postReacteds);
    console.log('Formatted Blogs:', latestBlogs);
    return latestBlogs;
  } catch (error) {
    console.error('Error fetching latest blogs:', error);
    throw error;
  }
};

export { getLatestBlogs };
