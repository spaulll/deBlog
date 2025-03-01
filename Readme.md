# deBlog
---
A **decentralized blogging platform** built on Web3, leveraging **IPFS** for storage, **Base Sepolia** for blockchain transactions, and **Thirdweb** for wallet connection & contract interactions. Users can **write blogs, like/dislike posts, comment, and tip creators in ETH/USDC**.

---

## 🚀 Tech Stack

### Frontend
- **React.js** (UI framework)
- **Tailwind CSS** (styling)
- **Thirdweb SDK** (wallet connection & contract interaction)

### Backend / Blockchain
- **Node.js** (backend server)
- **Solidity** (smart contracts)
- **EVM (Base Sepolia testnet)** (blockchain execution)
- **IPFS (via Pinata)** (decentralized storage)
- **SIWE (Sign-In with Ethereum)** (authentication)

## ⚡ Features
- **Decentralized Blog Storage**: Blogs are stored on IPFS for censorship resistance.
- **On-Chain Interactions**: Like, dislike, and comment functionalities stored on Base Sepolia.
- **Tipping System**: Readers can tip content creators in ETH/USDC.
- **Web3 Authentication**: Users sign in using their Ethereum wallet (SIWE).

<!-- ## 📌 Installation & Setup -->

### Prerequisites
- **Node.js** (v16+ recommended)
- **Metamask Wallet** (or any Web3 wallet)
- **Thirdweb account** (for contract management)
- **Pinata account** (for IPFS storage)

<!-- ### Clone the Repository
```sh
git clone https://github.com/spaulll/deBlog.git
cd deBlog
```

### Install Dependencies
```sh
npm install
```

### Environment Variables
Create a **.env** file in the root directory and add:
```env

```

### Run the Development Server
```sh
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. -->

<!-- ## 📝 Smart Contract
The smart contracts are written in **Solidity** and deployed on **Base Sepolia Testnet**.
- **BlogManager.sol**: Handles blog metadata, storage, and retrieval.
- **Interactions.sol**: Manages likes, dislikes, and comments.
- **Tipping.sol**: Allows users to tip blog creators in ETH/USDC.

### Deploy Smart Contracts
1. Set up a Hardhat project inside `contracts/` directory.
2. Configure the **Base Sepolia network** in `hardhat.config.js`.
3. Compile & deploy contracts:
```sh
npx hardhat compile
npx hardhat run scripts/deploy.js --network base-sepolia
``` -->

---
## 🌍 Future Enhancements
- **Mainnet Deployment** on Base blockchain.
- **NFT Integration**: Tokenizing blogs as NFTs.
- **Optimized Gas Usage** for likes/dislikes.
- **More Storage Options** (Arweave, Lit Protocol, etc.).

---
## 🤝 Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

<!-- ## 📜 License
MIT License. See `LICENSE` for details. -->

---
## 🎯 Contact
For questions or collaborations, reach out at [𝕏](https://x.com/SP889900).
