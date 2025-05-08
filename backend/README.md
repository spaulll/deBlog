# deBlog Backend

## 🚀 Overview
The deBlog backend serves as the bridge between the frontend React application and the blockchain infrastructure. It handles IPFS storage operations, smart contract interactions, and provides API endpoints for the decentralized blogging platform.

## 📦 Tech Stack
- **Node.js** - Server runtime environment
- **Express.js** - Web server framework
- **IPFS (via Thirdweb)** - Decentralized storage for blog content
- **Thirdweb SDK** - Web3 authentication and contract interactions
- **Graph Protocol** - Querying the blockchain for blog data

## 🧱 Project Structure
```
backend/
├── libs/                           # Core functionality libraries
│   ├── abi/                        # Smart contract ABIs
│   ├── graph-ops/                  # The Graph protocol integration
│   │   ├── blogsByAuthor.js        # GraphQL query for blogs by author
│   │   ├── blogsByKeyword.js       # GraphQL query for blogs by specific keyword
│   │   ├── comments.js             # GraphQL query for fetching comments for a blog
│   │   ├── latestBlogs.js          # GraphQL query for fetching the latest blogs
│   │   ├── trendingBlogs.js        # GraphQL query for fetching trending blogs
│   │   └── userProfile.js          # GraphQL query for fetching a user's profile
│   ├── ipfsOps.js                  # IPFS operations
│   ├── thirdwebClient.js           # Thirdweb SDK integration
│   ├── contractInteraction.js      # Smart contract interaction utilities
│   └── contracts.js                # Contract address configurations
├── ipfsOps.js                      # IPFS operations for content storage
├── server.js                       # Express server and API routes
├── thirdwebClient.js               # Thirdweb SDK integration
├── .env                            # Environment variables
└── package.json                    # Dependencies and scripts
```

## ⚙️ Setup & Installation

### Prerequisites
- Node.js (v20+ recommended)
- Private key of a Web3 wallet (e.g., MetaMask)
- Funds on the Base Sepolia testnet
- Thirdweb API key (Create one at [Thirdweb](https://thirdweb.com/login))
- Graph Protocol API key (Get one at [The Graph Studio](https://thegraph.com/studio/))

### Environment Variables
Copy the `.env.example` file to `.env` and fill in the required variables:
```bash
cp .env.example .env
```

### Installation
```bash
cd backend
npm install
```

### Running the Server
```bash
npm start
```

The server will start on the port specified in your environment variables (default: 3000).

## 🔗 Blockchain Integration
The backend interacts with two main smart contracts:
- **Blog Contract** - Manages blog posts and content
- **UserProfile Contract** - Handles user registration and profiles

## 📊 GraphQL Queries
The backend uses GraphQL queries to fetch data from the blockchain:
- `blogsByAuthor` - Fetch blogs by a specific author
- `blogsByKeyword` - Fetch blogs by a specific keyword
- `comments` - Fetch comments for a specific blog
- `latestBlogs` - Fetch the latest blogs
- `trendingBlogs` - Fetch trending blogs
- `userProfile` - Fetch a user's profile

## 📝 IPFS Storage
Blog content is stored on IPFS through Thirdweb, ensuring:
- Censorship resistance
- Decentralized content availability
- Permanent storage of blog posts

## 🔒 Security Considerations
- Private keys should never be exposed or committed to version control
- API keys should be properly secured
- Input validation is implemented for all API endpoints