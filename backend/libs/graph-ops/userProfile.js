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

// Build query for created profiles
function buildCreatedProfilesQuery(address, username) {
    const whereConditions = [];

    if (address) whereConditions.push(`userAddress: "${address.toLowerCase()}"`);
    if (username) whereConditions.push(`username_contains_nocase: "${username}"`);

    const whereClause = whereConditions.length ? `where: { ${whereConditions.join(', ')} }` : '';

    return gql`
        query {
            createdProfiles: userProfileCreateds(${whereClause}, orderBy: blockTimestamp, orderDirection: desc) {
                userAddress
                username
                bio
                avatarUri
                socialLinks
                blockTimestamp
                isEdited
            }
        }
    `;
}

// Build query for edited profiles
function buildEditedProfilesQuery(address, username) {
    const whereConditions = [];

    if (address) whereConditions.push(`userAddress: "${address.toLowerCase()}"`);
    if (username) whereConditions.push(`username_contains_nocase: "${username}"`);

    const whereClause = whereConditions.length ? `where: { ${whereConditions.join(', ')} }` : '';

    return gql`
        query {
            editedProfiles: userProfileEditeds(${whereClause}, orderBy: blockTimestamp, orderDirection: desc) {
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

// Format the profiles into the desired structure
function formatProfiles(profiles) {
    return profiles.map(profile => ({
        personal_info: {
            user_address: profile.userAddress,
            username: profile.username || '',
            bio: profile.bio || '',
            profile_img: profile.avatarUri || `https://api.dicebear.com/9.x/adventurer/svg?seed=${profile.userAddress.toLowerCase()}`,
            social_links: profile.socialLinks || [],
        },
        user_address: profile.userAddress,
    }));
}

const searchUserProfiles = async ({ address, username }) => {
    console.log('searchUserProfiles() called:', address, username);
    try {
        // 1. Get created profiles matching the search criteria
        const createdQuery = buildCreatedProfilesQuery(address, username);
        const createdData = await request(url, createdQuery, {}, headers);
        const createdProfiles = createdData.createdProfiles || [];
        
        // 2. Get edited profiles matching the search criteria
        const editedQuery = buildEditedProfilesQuery(address, username);
        const editedData = await request(url, editedQuery, {}, headers);
        const editedProfiles = editedData.editedProfiles || [];
        
        // 3. Collect all unique addresses from both queries
        const uniqueAddresses = new Set([
            ...createdProfiles.map(p => p.userAddress.toLowerCase()),
            ...editedProfiles.map(p => p.userAddress.toLowerCase())
        ]);
        
        // 4. Early return if no addresses found - this prevents the empty array query
        if (uniqueAddresses.size === 0) {
            console.log('No profiles found matching the search criteria');
            return [];
        }
        
        // 5. For all addresses found, get their complete profile history
        const fullProfileHistoryQuery = gql`
            query {
                createdProfiles: userProfileCreateds(
                    where: { userAddress_in: [${Array.from(uniqueAddresses).map(addr => `"${addr}"`).join(', ')}] },
                    orderBy: blockTimestamp,
                    orderDirection: desc
                ) {
                    userAddress
                    username
                    bio
                    avatarUri
                    socialLinks
                    blockTimestamp
                    isEdited
                }
                editedProfiles: userProfileEditeds(
                    where: { userAddress_in: [${Array.from(uniqueAddresses).map(addr => `"${addr}"`).join(', ')}] },
                    orderBy: blockTimestamp,
                    orderDirection: desc
                ) {
                    userAddress
                    username
                    bio
                    avatarUri
                    socialLinks
                    blockTimestamp
                }
            }
        `;
        
        const fullHistoryData = await request(url, fullProfileHistoryQuery, {}, headers);
        const allCreatedProfiles = fullHistoryData.createdProfiles || [];
        const allEditedProfiles = fullHistoryData.editedProfiles || [];
        
        // 6. Get the most recent profile (created or edited) for each address
        const finalProfilesMap = new Map();
        
        // First add all created profiles
        for (const profile of allCreatedProfiles) {
            const address = profile.userAddress.toLowerCase();
            finalProfilesMap.set(address, profile);
        }
        
        // Then update with any edited profiles if they're more recent
        for (const profile of allEditedProfiles) {
            const address = profile.userAddress.toLowerCase();
            // Only update if this edit is newer than what we have
            if (!finalProfilesMap.has(address) || 
                profile.blockTimestamp > finalProfilesMap.get(address).blockTimestamp) {
                finalProfilesMap.set(address, profile);
            }
        }
        
        // 7. Format and return the final profiles
        const finalProfiles = Array.from(finalProfilesMap.values());
        return formatProfiles(finalProfiles);
    } catch (error) {
        console.error('Error fetching user profiles:', error);
        throw error;
    }
};

export { searchUserProfiles };