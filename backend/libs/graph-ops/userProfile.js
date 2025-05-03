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
    const whereEdited = [];

    if (address) whereEdited.push(`userAddress: "${address.toLowerCase()}"`);
    if (username) whereEdited.push(`username_contains_nocase: "${username}"`);

    const whereEditedClause = whereEdited.length ? `where: { ${whereEdited.join(', ')} }` : '';

    return gql`
        query {
            editedProfiles: userProfileEditeds(${whereEditedClause}, orderBy: blockTimestamp, orderDirection: desc) {
                userAddress
                username
                bio
                avatarUri
                socialLinks
                blockTimestamp
            }
        }
    `;
}

async function fetchCreatedProfiles(userAddresses) {
    if (!userAddresses.length) return [];

    const addressFilter = userAddresses.map(addr => `"${addr}"`).join(', ');
    const query = gql`
        query {
            createdProfiles: userProfileCreateds(where: { userAddress_in: [${addressFilter}] }) {
                userAddress
                username
                bio
                avatarUri
                socialLinks
            }
        }
    `;
    const data = await request(url, query, {}, headers);
    return data.createdProfiles;
}

function mergeProfiles(editedProfiles, createdProfiles) {
    const createdMap = new Map();
    createdProfiles.forEach(p => createdMap.set(p.userAddress.toLowerCase(), p));

    const merged = editedProfiles.map(edited => {
        const key = edited.userAddress.toLowerCase();
        const fallback = createdMap.get(key);

        return {
            personal_info: {
                user_address: edited.userAddress,
                username: edited.username || fallback?.username || '',
                bio: edited.bio || fallback?.bio || '',
                profile_img: edited.avatarUri || fallback?.avatarUri || `https://api.dicebear.com/9.x/adventurer/svg?seed=${edited.userAddress.toLowerCase()}`,
                social_links: edited.socialLinks || fallback?.socialLinks || [],
            },
            user_address: edited.userAddress,
        };
    });

    return merged;
}

const searchUserProfiles = async ({ address, username }) => {
    console.log('searchUserProfiles() called:', address, username);
    try {
        const editedQuery = buildQueryString(address, username);
        const editedData = await request(url, editedQuery, {}, headers);

        // ✅ Deduplicate edited profiles by userAddress
        const editedProfilesMap = new Map();
        for (const profile of editedData.editedProfiles || []) {
            const addr = profile.userAddress.toLowerCase();
            if (!editedProfilesMap.has(addr)) {
                editedProfilesMap.set(addr, profile);
            }
        }
        const editedProfiles = Array.from(editedProfilesMap.values());

        const userAddresses = [...editedProfilesMap.keys()];
        const createdProfiles = await fetchCreatedProfiles(userAddresses);

        const merged = mergeProfiles(editedProfiles, createdProfiles);
        return merged;
    } catch (error) {
        console.error('Error fetching user profiles:', error);
        throw error;
    }
};



export { searchUserProfiles };