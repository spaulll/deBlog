import { gql, request } from 'graphql-request';
import dotenv from 'dotenv';
dotenv.config();

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

const url = process.env.BLOGS_SUBGRAPH_URL;
const headers = { Authorization: `Bearer ${process.env.GRAPH_API_KEY}` };

function transformTrendingBlogs(trendingBlogs, postReacteds) {
  const blogs = trendingBlogs.map((post) => {
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
      banner: post.ipfsUri,
      des: post.description,
      tags: post.tags,
      author: {
        personal_info: {
          user_address: post.userAddress,
          username: post.username,
          profile_img: post.avatarUri || `https://api.dicebear.com/9.x/adventurer/svg?seed=${post.userAddress.toLowerCase()}`,
        },
      },
      publishedAt: new Date(post.timestamp * 1000),
    };
  });

  // Sort by total_likes in descending order
  return blogs.sort((a, b) => b.activity.total_likes - a.activity.total_likes);
}

const getTrendingBlogs = async () => {
  try {
    const data = await request(url, query, {}, headers);
    const trendingBlogs = transformTrendingBlogs(data.postCreateds, data.postReacteds);
    console.log('Formatted Blogs:', trendingBlogs);
    return trendingBlogs;
  } catch (error) {
    console.error('Error fetching trending blogs:', error);
    throw error;
  }
};

export { getTrendingBlogs };
