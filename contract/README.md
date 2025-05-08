# ✨ deBlog Smart Contracts

This repository contains the smart contracts for **deBlog**, a **decentralized blogging platform**. It includes contracts for user profiles, blogging functionalities, and tipping mechanisms, written in **Solidity** and deployed using **Hardhat**.

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
- Blog post editing
- Comment functionality

### 3. `Tipping.sol`
Handles:
- Tip distribution to content creators

---

## 🧱 Project Structure

```
.
├── contracts/         # Solidity contracts
│   ├── Blog.sol
│   ├── UserProfile.sol
│   └── Tipping.sol
├── scripts/           # Deployment scripts
│   └── deploy.js
├── artifacts/         # Build output (ignored in git)
├── cache/             # Cache (ignored in git)
├── .env               # Environment variables (not tracked)
├── .env.example       # Environment variable template
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
npx hardhat run scripts/deploy.js --network <network_name>
```
> This will deploy `UserProfile`, `Blog`, and `Tipping` contracts.

---

## ✅ Verify Contracts (Optional)

Use [Base Sepolia Explorer](https://base-sepolia.blockscout.com/) or similar tools depending on your deployment network.

### Verify on Etherscan:

```bash
npx hardhat verify --network <network_name> <contract_address> <constructor_args>
```

---

