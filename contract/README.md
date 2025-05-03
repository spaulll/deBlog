# DeBlog Smart Contracts

This repository contains the smart contracts for **DeBlog**, a decentralized blogging platform. It includes contracts for user profiles and blogging functionalities, written in Solidity and deployed using Hardhat.

---

## 📦 Contracts

### 1. `UserProfile.sol`
Handles:
- User registration
- Profile editing
- Tip wallet management

### 2. `Blog.sol`
Manages:
- Blog post creation
- Post count updates linked to user profiles
- Edit blog posts
- Comments

---

## 🧱 Project Structure

```
.
├── contracts/         # Solidity contracts
│   ├── Blog.sol
│   └── UserProfile.sol
├── scripts/           # Deployment scripts
│   └── deploy.js
├── test/              # Optional: test cases
├── artifacts/         # Build output (ignored in git)
├── cache/             # Cache (ignored in git)
├── .env               # Env vars (not tracked)
├── .env.example       # Env var template
├── .gitignore
├── hardhat.config.js
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup `.env`

```bash
cp .env.example .env
```

Update `.env` with your values:

```
PRIVATE_KEY=your_wallet_private_key
RPC_URL=https://your_rpc_provider
NETWORK=network_name
```

### 3. Compile Contracts

```bash
npx hardhat compile
```

### 4. Deploy Contracts

```bash
npx hardhat run scripts/deploy.js --network network_name
```

> This will deploy both `UserProfile` and `Blog` contracts.

---

## ✅ Verify Deployment (Optional)

Use [Etherscan](https://etherscan.io/) or similar tools depending on your network.

### Verify on Hardhat:

```bash
npx hardhat verify --network megaETH <contract_address> <constructor_args>
```