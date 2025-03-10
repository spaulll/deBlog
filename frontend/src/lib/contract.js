import { getContract } from "thirdweb";
import { baseSepolia } from "thirdweb/chains";
import { client } from "./client";

// get a contract
const contract = getContract({
    // the client you have created via `createThirdwebClient()`
    client,
    // the chain the contract is deployed on
    chain: baseSepolia,
    // the contract's address
    address: "0x97c32897eeCee1132346D31C4e0Be37860562D2C",
    // OPTIONAL: the contract's abi
    abi: [
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "_postOwner",
                    "type": "address"
                },
                {
                    "internalType": "uint32",
                    "name": "_postIndex",
                    "type": "uint32"
                },
                {
                    "internalType": "string",
                    "name": "_content",
                    "type": "string"
                }
            ],
            "name": "addComment",
            "outputs": [
                {
                    "internalType": "uint32",
                    "name": "commentId",
                    "type": "uint32"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "string",
                    "name": "_content",
                    "type": "string"
                }
            ],
            "name": "createPost",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "string",
                    "name": "_username",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "_bio",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "_avatarUri",
                    "type": "string"
                }
            ],
            "name": "createUser",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "_postOwner",
                    "type": "address"
                },
                {
                    "internalType": "uint32",
                    "name": "_postIndex",
                    "type": "uint32"
                },
                {
                    "internalType": "uint32",
                    "name": "_commentId",
                    "type": "uint32"
                },
                {
                    "internalType": "string",
                    "name": "_newContent",
                    "type": "string"
                }
            ],
            "name": "editComment",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint32",
                    "name": "postIndex",
                    "type": "uint32"
                },
                {
                    "internalType": "string",
                    "name": "_newContent",
                    "type": "string"
                }
            ],
            "name": "editPost",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "string",
                    "name": "_username",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "_bio",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "_avatarUri",
                    "type": "string"
                },
                {
                    "internalType": "address",
                    "name": "_tipWalletAddress",
                    "type": "address"
                }
            ],
            "name": "editProfile",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "userAddress",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "string",
                    "name": "username",
                    "type": "string"
                },
                {
                    "indexed": false,
                    "internalType": "uint32",
                    "name": "postId",
                    "type": "uint32"
                },
                {
                    "indexed": false,
                    "internalType": "string",
                    "name": "content",
                    "type": "string"
                },
                {
                    "indexed": false,
                    "internalType": "uint32",
                    "name": "timestamp",
                    "type": "uint32"
                }
            ],
            "name": "PostCreated",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "userAddress",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "uint32",
                    "name": "postId",
                    "type": "uint32"
                },
                {
                    "indexed": false,
                    "internalType": "string",
                    "name": "content",
                    "type": "string"
                },
                {
                    "indexed": false,
                    "internalType": "uint32",
                    "name": "timestamp",
                    "type": "uint32"
                }
            ],
            "name": "PostEdited",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "reactor",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "postOwner",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "uint32",
                    "name": "postId",
                    "type": "uint32"
                },
                {
                    "indexed": false,
                    "internalType": "bool",
                    "name": "like",
                    "type": "bool"
                },
                {
                    "indexed": false,
                    "internalType": "uint64",
                    "name": "likes",
                    "type": "uint64"
                },
                {
                    "indexed": false,
                    "internalType": "uint64",
                    "name": "dislikes",
                    "type": "uint64"
                }
            ],
            "name": "PostReacted",
            "type": "event"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "_userAddress",
                    "type": "address"
                },
                {
                    "internalType": "uint32",
                    "name": "postIndex",
                    "type": "uint32"
                },
                {
                    "internalType": "bool",
                    "name": "like",
                    "type": "bool"
                }
            ],
            "name": "toggleLikeDislike",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "userAddress",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "string",
                    "name": "username",
                    "type": "string"
                }
            ],
            "name": "UserProfileCreated",
            "type": "event"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "_postOwner",
                    "type": "address"
                },
                {
                    "internalType": "uint32",
                    "name": "_postIndex",
                    "type": "uint32"
                }
            ],
            "name": "getComments",
            "outputs": [
                {
                    "components": [
                        {
                            "internalType": "uint32",
                            "name": "commentId",
                            "type": "uint32"
                        },
                        {
                            "internalType": "uint32",
                            "name": "timestamp",
                            "type": "uint32"
                        },
                        {
                            "internalType": "address",
                            "name": "commenter",
                            "type": "address"
                        },
                        {
                            "internalType": "string",
                            "name": "content",
                            "type": "string"
                        }
                    ],
                    "internalType": "struct UserProfile.Comment[]",
                    "name": "comments",
                    "type": "tuple[]"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "_userAddress",
                    "type": "address"
                },
                {
                    "internalType": "uint32",
                    "name": "postIndex",
                    "type": "uint32"
                }
            ],
            "name": "getPost",
            "outputs": [
                {
                    "components": [
                        {
                            "internalType": "uint32",
                            "name": "likes",
                            "type": "uint32"
                        },
                        {
                            "internalType": "uint32",
                            "name": "dislikes",
                            "type": "uint32"
                        },
                        {
                            "internalType": "uint32",
                            "name": "id",
                            "type": "uint32"
                        },
                        {
                            "internalType": "uint32",
                            "name": "timestamp",
                            "type": "uint32"
                        },
                        {
                            "internalType": "uint32",
                            "name": "commentCount",
                            "type": "uint32"
                        },
                        {
                            "internalType": "bool",
                            "name": "edited",
                            "type": "bool"
                        },
                        {
                            "internalType": "bool",
                            "name": "draft",
                            "type": "bool"
                        },
                        {
                            "internalType": "string",
                            "name": "content",
                            "type": "string"
                        }
                    ],
                    "internalType": "struct UserProfile.Post",
                    "name": "post",
                    "type": "tuple"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "_userAddress",
                    "type": "address"
                }
            ],
            "name": "getUserProfile",
            "outputs": [
                {
                    "components": [
                        {
                            "internalType": "address",
                            "name": "userAddress",
                            "type": "address"
                        },
                        {
                            "internalType": "address",
                            "name": "tipWalletAddress",
                            "type": "address"
                        },
                        {
                            "internalType": "string",
                            "name": "username",
                            "type": "string"
                        },
                        {
                            "internalType": "string",
                            "name": "bio",
                            "type": "string"
                        },
                        {
                            "internalType": "string",
                            "name": "avatarUri",
                            "type": "string"
                        },
                        {
                            "internalType": "uint16",
                            "name": "postCount",
                            "type": "uint16"
                        },
                        {
                            "internalType": "uint32",
                            "name": "memberSince",
                            "type": "uint32"
                        }
                    ],
                    "internalType": "struct UserProfile.User",
                    "name": "user",
                    "type": "tuple"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "_userAddress",
                    "type": "address"
                }
            ],
            "name": "getUserTipWallet",
            "outputs": [
                {
                    "internalType": "address",
                    "name": "tipWalletAddress",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "name": "isRegistered",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        }
    ]
});

export { contract };