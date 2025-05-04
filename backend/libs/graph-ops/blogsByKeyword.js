import { gql, request } from 'graphql-request';
import dotenv from 'dotenv';
import NodeCache from 'node-cache';
dotenv.config();

// Cache setup
const cache = new NodeCache({ stdTTL: 300, checkperiod: 60, useClones: false });
const SEARCH_CACHE_PREFIX = 'search_';
const IPFS_CACHE_PREFIX = 'ipfs_';

// The URL for your subgraph endpoint
const url = process.env.BLOGS_SUBGRAPH_URL;
const headers = { Authorization: `Bearer ${process.env.GRAPH_API_KEY}` };

// IPFS gateways to try in order
const IPFS_GATEWAYS = [
  "https://ab0bf91b071000b6bf58102942eead82.ipfscdn.io/ipfs/",
  "https://gateway.pinata.cloud/ipfs/",
  "https://ipfs.io/ipfs/"
];

// Helper functions
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Extract CID from IPFS URI (supports multiple formats)
 */
function extractCIDFromURI(uri) {
  if (!uri) return null;
  
  // Check gateway prefixes
  for (const gateway of IPFS_GATEWAYS) {
    if (uri.startsWith(gateway)) return uri.substring(gateway.length).split('/')[0];
  }
  
  // Handle ipfs:// protocol
  if (uri.startsWith('ipfs://')) return uri.substring(7).split('/')[0];
  
  // Try regex for other formats
  const matches = uri.match(/ipfs\/([a-zA-Z0-9]+)/);
  return matches?.[1] || null;
}

/**
 * Fetch with timeout and retry logic
 */
async function fetchWithRetry(url, timeout = 5000, retries = 2, retryDelay = 500) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      const response = await fetch(url, { signal: controller.signal, cache: 'no-store' });
      clearTimeout(timeoutId);
      
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      return await response.json();
    } catch (err) {
      if (attempt < retries) await sleep(retryDelay);
      else throw err;
    }
  }
}

/**
 * Fetch IPFS content with multiple gateway fallbacks
 */
async function fetchIPFSWithFallbacks(originalUri, bypassCache = false) {
  // Skip invalid URIs or check cache
  if (!originalUri) return { banner: "" };
  const cacheKey = `${IPFS_CACHE_PREFIX}${originalUri}`;
  if (!bypassCache && cache.has(cacheKey)) return cache.get(cacheKey);
  
  // Extract CID and path
  const cid = extractCIDFromURI(originalUri);
  if (!cid) {
    console.warn(`Invalid IPFS URI: ${originalUri}`);
    return { banner: "" };
  }
  
  const path = originalUri.includes(cid + "/") ? 
    originalUri.substring(originalUri.indexOf(cid + "/") + cid.length) : "";
  
  // Try each gateway
  for (const gateway of IPFS_GATEWAYS) {
    try {
      const fullUrl = `${gateway}${cid}${path}`;
      console.log(`Trying IPFS gateway: ${fullUrl}`);
      const data = await fetchWithRetry(fullUrl, 5000, 2, 500);
      cache.set(cacheKey, data, 3600); // Cache success for 1 hour
      return data;
    } catch (err) {
      console.warn(`Gateway ${gateway} failed: ${err.message}`);
    }
  }
  
  // All gateways failed - cache empty result to prevent hammering
  const emptyResult = { banner: "" };
  cache.set(cacheKey, emptyResult, 300);
  return emptyResult;
}

// GraphQL queries
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
  reactions: gql`
    {
      postReacteds {
        blogIdHash
        postOwner
        likes
      }
    }
  `
};

/**
 * Transform search results and fetch all IPFS data concurrently
 */
async function transformSearchResults(posts, postReacteds) {
  // Create reactions lookup map for efficient access
  const reactionsMap = new Map();
  
  // Handle each reaction individually
  postReacteds.forEach(reaction => {
    const blogId = reaction.blogIdHash.toLowerCase();
    const likes = parseInt(reaction.likes || 0);
    
    // Only update if the new likes count is higher (in case of multiple entries)
    if (!reactionsMap.has(blogId) || likes > reactionsMap.get(blogId)) {
      reactionsMap.set(blogId, likes);
    }
  });
  
  // For debugging
  console.log("Search results reactions map:", Object.fromEntries(reactionsMap));

  // Process all posts concurrently
  return Promise.all(posts.map(async post => {
    try {
      const ipfsData = await fetchIPFSWithFallbacks(post.ipfsUri);
      return {
        activity: {
          total_likes: reactionsMap.get(post.blogIdHash.toLowerCase()) || 0,
          total_comments: 0,
          total_parent_comments: 0,
        },
        blog_id: post.blogIdHash,
        title: post.title,
        banner: ipfsData?.banner || "",
        des: post.description,
        tags: post.tags,
        author: {
          personal_info: {
            user_address: post.userAddress,
            username: post.username,
            profile_img: post.avatarUri || 
              `https://api.dicebear.com/9.x/adventurer/svg?seed=${post.userAddress.toLowerCase()}`,
          },
        },
        publishedAt: new Date(post.timestamp * 1000),
      };
    } catch (error) {
      console.error(`Failed to process post ${post.blogIdHash}:`, error);
      return {
        blog_id: post.blogIdHash,
        title: post.title,
        banner: "",
        des: post.description,
        tags: post.tags,
        error: true,
        author: {
          personal_info: {
            user_address: post.userAddress,
            username: post.username,
            profile_img: post.avatarUri || 
              `https://api.dicebear.com/9.x/adventurer/svg?seed=${post.userAddress.toLowerCase()}`,
          },
        },
        publishedAt: new Date(post.timestamp * 1000),
      };
    }
  }));
}

/**
 * Search blogs by keyword with caching
 */
const getBlogsByKeywords = async (keyword = "", forceRefresh = false) => {
  try {
    // Generate cache key based on keyword
    const cacheKey = `${SEARCH_CACHE_PREFIX}${keyword.toLowerCase()}`;
    
    // Check cache first unless forceRefresh is true
    if (!forceRefresh && cache.has(cacheKey)) {
      return cache.get(cacheKey);
    }
    
    // Fetch data from all sources in parallel
    const [titleData, descriptionData, tagsData, reactedsData] = await Promise.all([
      request(url, queries.title, { keyword }, headers),
      request(url, queries.description, { keyword }, headers),
      request(url, queries.tags, { keywordArray: [keyword] }, headers),
      request(url, queries.reactions, {}, headers),
    ]);

    // Combine and deduplicate posts
    const allPosts = [
      ...titleData.postCreateds,
      ...descriptionData.postCreateds,
      ...tagsData.postCreateds,
    ];

    const uniquePosts = Array.from(
      new Map(allPosts.map(post => [post.blogIdHash, post])).values()
    );

    // Transform and fetch IPFS data in parallel
    const transformed = await transformSearchResults(uniquePosts, reactedsData.postReacteds);
    
    // Cache the results
    cache.set(cacheKey, transformed, 600); // Cache for 10 minutes
    
    return transformed;
  } catch (error) {
    console.error("Error searching blogs by keyword:", error);
    throw error;
  }
};

/**
 * Clear search cache for specific keyword or all searches
 */
const clearSearchCache = (keyword = null) => {
  if (keyword) {
    // Clear specific keyword cache
    const cacheKey = `${SEARCH_CACHE_PREFIX}${keyword.toLowerCase()}`;
    cache.del(cacheKey);
    return { cleared: [cacheKey] };
  } else {
    // Clear all search caches
    const allKeys = cache.keys();
    const searchKeys = allKeys.filter(key => key.startsWith(SEARCH_CACHE_PREFIX));
    searchKeys.forEach(key => cache.del(key));
    return { cleared: searchKeys };
  }
};

/**
 * Get cache statistics for monitoring
 */
const getCacheStats = () => ({
  keys: cache.keys(),
  stats: cache.getStats()
});

export { getBlogsByKeywords, clearSearchCache, getCacheStats };