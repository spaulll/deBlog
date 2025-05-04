import { gql, request } from 'graphql-request';
import dotenv from 'dotenv';
import NodeCache from 'node-cache';
dotenv.config();

// Cache setup
const cache = new NodeCache({ stdTTL: 300, checkperiod: 60, useClones: false });
const AUTHOR_CACHE_PREFIX = 'author_';
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

// Function to dynamically build the GraphQL query based on provided parameters
function buildQuery(hasUsername, hasAddress) {
  let whereClause = '';
  
  if (hasUsername && hasAddress) {
    whereClause = `
      where: { 
        or: [
          { username_contains_nocase: $username },
          { userAddress: $userAddress }
        ]
      }
    `;
  } else if (hasUsername) {
    whereClause = `where: { username_contains_nocase: $username }`;
  } else if (hasAddress) {
    whereClause = `where: { userAddress: $userAddress }`;
  }
  
  return gql`
    query GetPosts($username: String, $userAddress: String) {
      postCreateds(
        orderBy: timestamp,
        orderDirection: desc,
        ${whereClause}
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
}

/**
 * Transform posts and fetch all IPFS data concurrently
 */
async function transformAuthorBlogs(posts, postReacteds) {
  // Create reactions lookup map for efficient access
  const reactionsMap = new Map();
  
  // Instead of using map, handle each reaction individually
  postReacteds.forEach(reaction => {
    const blogId = reaction.blogIdHash.toLowerCase();
    const likes = parseInt(reaction.likes || 0);
    
    // Only update if the new likes count is higher (in case of multiple entries)
    if (!reactionsMap.has(blogId) || likes > reactionsMap.get(blogId)) {
      reactionsMap.set(blogId, likes);
    }
  });
  
  // For debugging
  console.log("Author blogs reactions map:", Object.fromEntries(reactionsMap));

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
            user_address: truncateAddress(post.userAddress),
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
 * Get blogs by author (username or address) with caching
 */
const getBlogsOfAuthor = async (username, address, forceRefresh = false) => {
  try {
    // Determine which parameters are provided
    const hasUsername = username !== null && username !== undefined;
    const hasAddress = address !== null && address !== undefined;
    
    // If no parameters provided, throw an error
    if (!hasUsername && !hasAddress) {
      throw new Error('Either username or address must be provided');
    }
    
    // Generate cache key based on username and/or address
    const cacheKey = `${AUTHOR_CACHE_PREFIX}${hasUsername ? username : ''}:${hasAddress ? address : ''}`;
    
    // Check cache first unless forceRefresh is true
    if (!forceRefresh && cache.has(cacheKey)) {
      console.log(`Retrieved blogs from cache for key: ${cacheKey}`);
      return cache.get(cacheKey);
    }
    
    // Build variables based on which parameter is provided
    const variables = {};
    if (hasUsername) variables.username = username;
    if (hasAddress) variables.userAddress = address;
    
    console.log('GraphQL variables:', variables);
    
    // Build the appropriate query
    const query = buildQuery(hasUsername, hasAddress);
    
    // Execute the query
    const data = await request(url, query, variables, headers);
    console.log('GraphQL response received');
    
    // Transform and fetch IPFS data in parallel
    const transformedBlogs = await transformAuthorBlogs(data.postCreateds, data.postReacteds);
    console.log(`Transformed ${transformedBlogs.length} blogs for author`);
    
    // Cache the results
    cache.set(cacheKey, transformedBlogs, 600); // Cache for 10 minutes
    
    return transformedBlogs;
  } catch (error) {
    console.error('Error fetching author blogs:', error);
    throw error;
  }
};

/**
 * Clear author cache for specific author or all authors
 */
const clearAuthorCache = (username = null, address = null) => {
  if (username || address) {
    // Clear specific author cache
    const cacheKey = `${AUTHOR_CACHE_PREFIX}${username || ''}:${address || ''}`;
    cache.del(cacheKey);
    return { cleared: [cacheKey] };
  } else {
    // Clear all author caches
    const allKeys = cache.keys();
    const authorKeys = allKeys.filter(key => key.startsWith(AUTHOR_CACHE_PREFIX));
    authorKeys.forEach(key => cache.del(key));
    return { cleared: authorKeys };
  }
};

/**
 * Get cache statistics for monitoring
 */
const getCacheStats = () => ({
  keys: cache.keys(),
  stats: cache.getStats()
});

export { getBlogsOfAuthor, clearAuthorCache, getCacheStats };