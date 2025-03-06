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
    address: "0xB1bb5a7c1A72762b4807DCBa71D615Dec551bE9f",
    // OPTIONAL: the contract's abi
    abi: [
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
                    "name": "_avatarUrl",
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
                    "name": "_avatarUrl",
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
            "inputs": [
                {
                    "internalType": "address",
                    "name": "_userAddress",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "postIndex",
                    "type": "uint256"
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
            "inputs": [
                {
                    "internalType": "address",
                    "name": "_userAddress",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "postIndex",
                    "type": "uint256"
                }
            ],
            "name": "getPost",
            "outputs": [
                {
                    "components": [
                        {
                            "internalType": "string",
                            "name": "content",
                            "type": "string"
                        },
                        {
                            "internalType": "uint256",
                            "name": "timestamp",
                            "type": "uint256"
                        },
                        {
                            "internalType": "uint256",
                            "name": "likes",
                            "type": "uint256"
                        },
                        {
                            "internalType": "uint256",
                            "name": "dislikes",
                            "type": "uint256"
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
                    "name": "userAddress",
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
                            "name": "avatarUrl",
                            "type": "string"
                        },
                        {
                            "internalType": "uint256",
                            "name": "postCount",
                            "type": "uint256"
                        },
                        {
                            "internalType": "address",
                            "name": "tipWalletAddress",
                            "type": "address"
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
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                }
            ],
            "name": "usernameExists",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
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
                },
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "name": "userPosts",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "content",
                    "type": "string"
                },
                {
                    "internalType": "uint256",
                    "name": "timestamp",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "likes",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "dislikes",
                    "type": "uint256"
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
            "name": "users",
            "outputs": [
                {
                    "internalType": "address",
                    "name": "userAddress",
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
                    "name": "avatarUrl",
                    "type": "string"
                },
                {
                    "internalType": "uint256",
                    "name": "postCount",
                    "type": "uint256"
                },
                {
                    "internalType": "address",
                    "name": "tipWalletAddress",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        }
    ]
});

export { contract };