# ✨ deBlog Frontend

## 🚀 Overview

The DeBlog frontend is a **React**-based application that provides a seamless, user-friendly interface to interact with the DeBlog platform. Users can register, create and manage blog posts, as well as engage with content shared by others.

## 📦 Tech Stack

- ⚛️ **React** – JavaScript library for building user interfaces
- 🔗 **React Router** – Library for handling navigation in a single-page application
- 🎨 **Tailwind CSS** – Utility-first CSS framework for rapid styling
- 🧩 **ThirdWeb SDK** – Web3 authentication and smart contract interactions
- 🗂 **IPFS (via ThirdWeb)** – Decentralized storage for blog content

## 🧱 Project Structure

<details>
  <summary>📁 Click to expand project structure</summary>

  ```plaintext
   frontend/
   ├── README.md
   ├── index.html
   ├── package-lock.json
   ├── package.json
   ├── postcss.config.js
   ├── src
   │   ├── App.jsx
   │   ├── common
   │   │   ├── date.jsx
   │   │   ├── page-animation.jsx
   │   │   └── uploadToIPFS.js
   │   ├── components
   │   │   ├── blog-content.component.jsx
   │   │   ├── blog-editor.component.jsx
   │   │   ├── blog-interaction.component.jsx
   │   │   ├── blog-post.component.jsx
   │   │   ├── comment-card.component.jsx
   │   │   ├── comment-field.component.jsx
   │   │   ├── comments.component.jsx
   │   │   ├── inpage-navigation.component.jsx
   │   │   ├── loader.component.jsx
   │   │   ├── manage-blogcard.component.jsx
   │   │   ├── navbar.component.jsx
   │   │   ├── nobanner-blog-post.component.jsx
   │   │   ├── nodata.component.jsx
   │   │   ├── publish-form.component.jsx
   │   │   ├── register.modal-component.jsx
   │   │   ├── sidenavbar.component.jsx
   │   │   ├── tags.component.jsx
   │   │   ├── tipping.modal.jsx
   │   │   ├── tools.component.jsx
   │   │   ├── user-navigation.component.jsx
   │   │   ├── usercard.component.jsx
   │   │   └── web3Component
   │   │       ├── ConnectButtonAuth.jsx
   │   │       └── logout.jsx
   │   ├── contexts
   │   │   └── AuthContext.tsx
   │   ├── imgs
   │   │   ├── 404.png
   │   │   ├── Search-icon.png
   │   │   ├── blog banner.png
   │   │   ├── donation.svg
   │   │   ├── interest.svg
   │   │   └── logo.webp
   │   ├── index.css
   │   ├── lib
   │   │   ├── abi
   │   │   │   ├── BlogAbi.json
   │   │   │   ├── TipAbi.json
   │   │   │   └── UserProfileAbi.json
   │   │   ├── api.ts
   │   │   ├── chain.js
   │   │   ├── client.js
   │   │   ├── contractInteraction.js
   │   │   ├── contracts.js
   │   │   └── randomUsernames.js
   │   ├── main.jsx
   │   └── pages
   │       ├── 404.page.jsx
   │       ├── blog.page.jsx
   │       ├── dashboard.page.jsx
   │       ├── edit-profile.page.jsx
   │       ├── editor.pages.jsx
   │       ├── home.page.jsx
   │       ├── manage-blogs.page.jsx
   │       ├── profile.page.jsx
   │       └── search.page.jsx
   ├── tailwind.config.js
   └── vite.config.js
  ```
</details>

## Setup and Usage

1. Install dependencies:

   ```bash
   npm install
   ```

2. Run the development server:

   ```bash
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173` to view the application.