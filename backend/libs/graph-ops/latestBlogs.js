import { gql, request } from 'graphql-request';
import dotenv from 'dotenv';
import NodeCache from 'node-cache';
dotenv.config();

// Cache setup with constants
const cache = new NodeCache({ stdTTL: 300, checkperiod: 60, useClones: false });
const BLOGS_CACHE_KEY = 'latest_blogs';
const IPFS_CACHE_PREFIX = 'ipfs_';
const FORCE_REFRESH_FLAG = 'force_refresh_flag';

// IPFS gateways to try in order
const IPFS_GATEWAYS = [
  "https://ab0bf91b071000b6bf58102942eead82.ipfscdn.io/ipfs/",
  "https://gateway.pinata.cloud/ipfs/",
  "https://ipfs.io/ipfs/"
];

// GraphQL query
const query = gql`{
  postCreateds(orderBy: timestamp, orderDirection: desc) {
    userAddress, username, blogIdHash, description, ipfsUri, tags, timestamp, title
  }
  postReacteds { blogIdHash, postOwner, likes }
}`;

// Environment variables
const url = process.env.BLOGS_SUBGRAPH_URL;
const headers = { Authorization: `Bearer ${process.env.GRAPH_API_KEY}` };

// Helper functions
const truncateAddress = addr => addr?.length >= 10 ? `${addr.substring(0, 4)}...${addr.substring(addr.length - 4)}` : addr;
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

/**
 * Process blogs and fetch all IPFS data concurrently
 */
async function transformLatestBlogs(latestBlogs, postReacteds, bypassIPFSCache = false) {
  // Create reactions lookup map - NOTE: Convert all keys to lowercase for case-insensitive comparison
  const reactionsMap = new Map();
  
  // Instead of summing, we need to use the actual likes value as it already represents the total
  postReacteds.forEach(reaction => {
    const blogId = reaction.blogIdHash.toLowerCase();
    const likes = parseInt(reaction.likes || 0);
    
    // Only update if the new likes count is higher (in case of multiple entries)
    if (!reactionsMap.has(blogId) || likes > reactionsMap.get(blogId)) {
      reactionsMap.set(blogId, likes);
    }
  });
  
  // For debugging
  console.log("Reactions map:", Object.fromEntries(reactionsMap));

  // Process all posts concurrently
  return Promise.all(latestBlogs.map(async post => {
    try {
      const blogIdLower = post.blogIdHash.toLowerCase();
      const ipfsData = await fetchIPFSWithFallbacks(post.ipfsUri, bypassIPFSCache);
      
      // Debug logging for this specific post
      console.log(`Processing blog ${blogIdLower}`);
      console.log(`Likes found: ${reactionsMap.get(blogIdLower) || 0}`);
      
      return {
        activity: {
          total_likes: reactionsMap.get(blogIdLower) || 0,
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
            fullname: truncateAddress(post.userAddress),
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
            fullname: truncateAddress(post.userAddress),
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
 * Main function to get latest blogs with caching
 */
const getLatestBlogs = async (forceRefresh = false) => {
  try {
    // Check refresh flags
    const shouldForceRefresh = forceRefresh === true || 
                               forceRefresh === 'true' || 
                               cache.get(FORCE_REFRESH_FLAG) === true;
    const refreshIPFSToo = shouldForceRefresh;
    
    // Always clear the force refresh flag when used
    if (cache.get(FORCE_REFRESH_FLAG) === true) {
      cache.del(FORCE_REFRESH_FLAG);
    }
    
    // Return cached data if available and refresh not requested
    if (!shouldForceRefresh && cache.has(BLOGS_CACHE_KEY)) {
      return cache.get(BLOGS_CACHE_KEY);
    }
    
    console.log("Fetching fresh data from subgraph...");
    
    // Fetch fresh data
    const data = await request(url, query, {}, headers);
    
    console.log(`Fetched ${data.postCreateds.length} blogs and ${data.postReacteds.length} reactions`);
    
    const transformedData = await transformLatestBlogs(
      data.postCreateds, 
      data.postReacteds,
      refreshIPFSToo
    );
    
    // Cache and return results
    cache.set(BLOGS_CACHE_KEY, transformedData);
    return transformedData;
  } catch (error) {
    console.error('Error fetching blogs:', error.message);
    // If we have cached data, return it as fallback
    if (cache.has(BLOGS_CACHE_KEY)) {
      console.log("Returning cached data due to error");
      return cache.get(BLOGS_CACHE_KEY);
    }
    return Promise.reject(error);
  }
};

/**
 * Clear cache to force refresh
 */
const invalidateBlogsCache = () => {
  // Clear main blogs cache
  cache.del(BLOGS_CACHE_KEY);
  
  // Clear all IPFS cache entries
  const ipfsKeys = cache.keys().filter(key => key.startsWith(IPFS_CACHE_PREFIX));
  ipfsKeys.forEach(key => cache.del(key));
  
  // Set refresh flag
  cache.set(FORCE_REFRESH_FLAG, true, 300);
  
  console.log("Cache invalidated successfully");
  
  return {
    mainCacheCleared: true,
    ipfsCacheEntries: ipfsKeys.length,
    forceRefreshFlagSet: true
  };
};

/**
 * Get cache statistics
 */
const getCacheStats = () => ({
  keys: cache.keys(),
  stats: cache.getStats(),
  forceRefreshPending: cache.get(FORCE_REFRESH_FLAG) === true
});

export { getLatestBlogs, invalidateBlogsCache, getCacheStats };