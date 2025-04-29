import { gql, request } from 'graphql-request';
import dotenv from 'dotenv';
dotenv.config();

// URL and header setup
const url = process.env.PROFILE_SUBGRAPH_URL;
const headers = { Authorization: `Bearer ${process.env.GRAPH_API_KEY}` };

// Verify environment variables are loaded
if (!url) {
    console.error('PROFILE_SUBGRAPH_URL environment variable is not defined');
    throw new Error('Missing required environment variable: PROFILE_SUBGRAPH_URL');
}

if (!process.env.GRAPH_API_KEY) {
    console.error('GRAPH_API_KEY environment variable is not defined');
    throw new Error('Missing required environment variable: GRAPH_API_KEY');
}

function buildQueryString(address, username) {
    let queryString;
    if (address && username) {
        queryString = gql`
            query {
                userProfileCreateds(where: { userAddress: "${address.toLowerCase()}", username_contains_nocase: "${username}" }) {
                    userAddress
                    username
                    bio
                    avatarUri
                }
            }
        `;
    } else if (address) {
        queryString = gql`
            query {
                userProfileCreateds(where: { userAddress: "${address.toLowerCase()}" }) {
                    userAddress
                    username
                    bio
                    avatarUri
                }
            }
        `;
    } else if (username) {
        queryString = gql`
            query {
                userProfileCreateds(where: { username_contains_nocase: "${username}" }) {
                    userAddress
                    username
                    bio
                    avatarUri
                }
            }
        `;
    } else {
        queryString = gql`
            query {
                userProfileCreateds {
                    userAddress
                    username
                    bio
                    avatarUri
                }
            }
        `;
    }
    return queryString;
}

function transformUserProfiles(userProfiles) {
    return userProfiles.map((profile) => ({
        personal_info: {
            user_address: profile.userAddress,
            username: profile.username,
            bio: profile.bio,
            profile_img: profile.avatarUri || `https://api.dicebear.com/9.x/adventurer/svg?seed=${profile.userAddress.toLowerCase()}`,
        },
        user_address: profile.userAddress,
    }));
}

const searchUserProfiles = async ({ address, username }) => {
    console.log('searchUserProfiles() called:', address, username);
    try {
        const query = buildQueryString(address, username);
        console.log('GraphQL Query:', query); // Log the query for debugging
        // Execute the query without variables
        const data = await request(url, query, {}, headers);
        const formattedProfiles = transformUserProfiles(data.userProfileCreateds);
        // console.log('Formatted User Profiles:', formattedProfiles);
        return formattedProfiles;
    } catch (error) {
        console.error('Error fetching user profiles:', error);
        throw error;
    }
};

export { searchUserProfiles };