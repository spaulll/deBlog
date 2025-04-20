import { gql, request } from 'graphql-request';

const query = gql`
  query GetPosts($username: String!) {
    postCreateds(
      orderBy: timestamp,
      orderDirection: desc,
      where: { username_contains_nocase: $username }
    ) {
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

const url = 'https://api.studio.thegraph.com/query/108354/deblog-v2/version/latest';
const headers = { Authorization: `Bearer ${process.env.GRAPH_API_KEY}` };

function truncateAddress(address) {
  if (address.length < 10) return address;
  return address.substring(0, 4) + "..." + address.substring(address.length - 4);
}

async function transformLatestBlogs(latestBlogs, postReacteds) {
  return await Promise.all(
    latestBlogs.map(async (post) => {
      let bannerUrl = "";

      try {
        const res = await fetch(post.ipfsUri);
        const json = await res.json();
        bannerUrl = json.banner || "";
      } catch (err) {
        console.error("Failed to fetch IPFS JSON for latest blog:", err);
      }

      // Match likes
      const matchedReaction = postReacteds.find(
        (reaction) => reaction.blogIdHash.toLowerCase() === post.blogIdHash.toLowerCase()
      );
      const totalLikes = matchedReaction ? parseInt(matchedReaction.likes) : 0;

      return {
        activity: {
          total_likes: totalLikes,
          total_comments: 0,
          total_reads: 0,
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
            profile_img: "https://api.dicebear.com/9.x/adventurer/svg?seed=sd",
          },
        },
        publishedAt: new Date(post.timestamp * 1000),
      };
    })
  );
}

const getBlogsOfAuthor = async (username) => {
  try {
    const variables = { username };
    const data = await request(url, query, variables, headers);
    console.log('GraphQL response:', data);
    const latestBlogs = await transformLatestBlogs(data.postCreateds, data.postReacteds);
    console.log('Formatted Blogs:', latestBlogs);
    return latestBlogs;
  } catch (error) {
    console.error('Error fetching latest blogs:', error);
    throw error;
  }
};

export { getBlogsOfAuthor };
