import { gql, request } from 'graphql-request';

const url = 'https://api.studio.thegraph.com/query/108354/deblog-v2/version/latest';
const headers = { Authorization: `Bearer ${process.env.GRAPH_API_KEY}` };

function truncateAddress(address) {
  if (address.length < 10) return address;
  return address.substring(0, 4) + "..." + address.substring(address.length - 4);
}

const queries = {
  title: gql`
    query SearchTitle($keyword: String!) {
      postCreateds(
        orderBy: timestamp,
        orderDirection: desc,
        where: { title_contains_nocase: $keyword }
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
    }
  `,
  description: gql`
    query SearchDescription($keyword: String!) {
      postCreateds(
        orderBy: timestamp,
        orderDirection: desc,
        where: { description_contains_nocase: $keyword }
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
    }
  `,
  tags: gql`
    query SearchTags($keywordArray: [String!]) {
      postCreateds(
        orderBy: timestamp,
        orderDirection: desc,
        where: { tags_contains_nocase: $keywordArray }
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
    }
  `,
};

const getPostReacteds = gql`
  {
    postReacteds {
      blogIdHash
      postOwner
      likes
    }
  }
`;

async function transformSearchResults(posts, postReacteds) {
  return await Promise.all(
    posts.map(async (post) => {
      let bannerUrl = "";

      try {
        const res = await fetch(post.ipfsUri);
        const json = await res.json();
        bannerUrl = json.banner || "";
      } catch (err) {
        console.error("Failed to fetch IPFS JSON for blog:", err);
      }

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
            profile_img: "https://api.dicebear.com/9.x/adventurer/svg?seed=sd",
          },
        },
        publishedAt: new Date(post.timestamp * 1000),
      };
    })
  );
}

const getBlogsByKeywords = async (keyword = "") => {
  try {
    const [titleData, descriptionData, tagsData, reactedsData] = await Promise.all([
      request(url, queries.title, { keyword }, headers),
      request(url, queries.description, { keyword }, headers),
      request(url, queries.tags, { keywordArray: [keyword] }, headers),
      request(url, getPostReacteds, {}, headers),
    ]);

    const allPosts = [
      ...titleData.postCreateds,
      ...descriptionData.postCreateds,
      ...tagsData.postCreateds,
    ];

    // Deduplicate by blogIdHash
    const uniquePosts = Array.from(
      new Map(allPosts.map((post) => [post.blogIdHash, post])).values()
    );

    const transformed = await transformSearchResults(uniquePosts, reactedsData.postReacteds);
    return transformed;
  } catch (error) {
    console.error("Error searching blogs by keyword:", error);
    throw error;
  }
};

export { getBlogsByKeywords };
