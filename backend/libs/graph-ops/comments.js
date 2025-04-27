// comments.js
import { gql, request } from 'graphql-request';
import dotenv from 'dotenv';
dotenv.config();

const url = process.env.BLOGS_SUBGRAPH_URL;
console.log("URL at comment.js:", url);
const headers = { Authorization: `Bearer ${process.env.GRAPH_API_KEY}` };
console.log("Headers at comment.js:", headers);
const query = gql`
  query ($blogIdHash: Bytes!) {
    commentAddeds(orderBy: timestamp, orderDirection: desc, where: { blogIdHash: $blogIdHash }) {
      userAddress
      username
      avatarUri
      blogIdHash
      content
      timestamp
    }
  }
`;

async function transformComments(comments) {
    return comments.map((comment) => {
        return {
            // commenter_address: comment.userAddress,
            // username: comment.username,
            // profile_img: comment.avatarUri || `https://api.dicebear.com/9.x/adventurer/svg?seed=${comment.userAddress}`,
            blog_id: comment.blogIdHash,
            comment: comment.content,
            commentedAt: comment.timestamp,
            commented_by: {
                personal_info: {
                    username: comment.username,
                    profile_img: comment.avatarUri || `https://api.dicebear.com/9.x/adventurer/svg?seed=${comment.userAddress}`,
                    commenter_address: comment.userAddress,
                },
            },
        };
    });
}

const getComments = async (blogIdHash) => {
    try {
        const data = await request(url, query, { blogIdHash }, headers);
        console.log("Comment response at comment.js:", data);
        const comments = transformComments(data.commentAddeds);
        console.log("Comments: ", comments)
        return comments;
    } catch (error) {
        console.error("Error fetching comments:", error);
        throw error;
    }
};

// getComments("0x4881bd60ef35528240600d4174a52fd177e3cc85b27075d9049eaa62015e23f5")
//     .then((comments) => console.log(comments))
//     .catch((error) => console.error(error));
export { getComments };