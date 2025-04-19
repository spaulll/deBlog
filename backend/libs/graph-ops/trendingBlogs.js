import { gql, request } from 'graphql-request';

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
}
`;

// The URL for your subgraph endpoint.
const url = 'https://api.studio.thegraph.com/query/108354/deblog-v1/version/latest';
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
 * @param {Array} trendingBlogs - Array of posts from the GraphQL response.
 * @returns {Array} Transformed array of blog objects.
 */
function transformTrendingBlogs(trendingBlogs) {
  return trendingBlogs.map((post) => ({
    activity: {
      total_likes: 0,           // Default value (update if dynamic data is available)
      total_comments: 0,        // Default value (update if dynamic data is available)
      total_reads: 0,           // Default value (update if dynamic data is available)
      total_parent_comments: 0  // Default value (update if dynamic data is available)
    },
    blog_id: post.blogIdHash,
    title: post.title,
    banner: post.ipfsUri,       // Assuming ipfsUri acts as the banner image URL
    des: post.description,
    tags: post.tags,
    author: {
      personal_info: {
        fullname: truncateAddress(post.userAddress),
        username: post.username,
        profile_img: "https://api.dicebear.com/9.x/adventurer/svg?seed=sd" // Replace with actual image URL if available
      }
    },
    publishedAt: new Date(post.timestamp * 1000) // Convert Unix timestamp (in seconds) to a JavaScript Date object
  }));
}

/**
 * Asynchronously fetches the trending blogs from The Graph, transforms the data,
 * and returns it in the desired format.
 * @returns {Promise<Array>} A promise that resolves to an array of formatted blog objects.
 */
const getTrendingBlogs = async () => {
  try {
    const data = await request(url, query, {}, headers);
    const trendingBlogs = transformTrendingBlogs(data.postCreateds);
    console.log('Formatted Blogs:', trendingBlogs);
    return trendingBlogs;
  } catch (error) {
    console.error('Error fetching trending blogs:', error);
    throw error;
  }
};

export { getTrendingBlogs };
