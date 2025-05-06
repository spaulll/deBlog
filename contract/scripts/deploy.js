const hre = require("hardhat");

async function main() {
  // Deploy UserProfile
  const UserProfile = await hre.ethers.getContractFactory("UserProfile");
  const userProfile = await UserProfile.deploy();
  await userProfile.deployed();
  console.log("UserProfile deployed at:", userProfile.address);

  // Deploy Blog with the address of UserProfile
  const Blog = await hre.ethers.getContractFactory("Blog");
  const blog = await Blog.deploy(userProfile.address);
  await blog.deployed();
  console.log("Blog deployed at:", blog.address);

  // Deploy Tipping with the address of UserProfile
  const Tipping = await hre.ethers.getContractFactory("Tipping");
  const tipping = await Tipping.deploy(userProfile.address);
  await tipping.deployed();
  console.log("Tipping deployed at:", tipping.address);
  
  // OPTIONAL: Set Blog address in UserProfile
  const tx = await userProfile.updateBlogContractAddress(blog.address);
  await tx.wait();
  console.log("UserProfile updated with Blog contract address");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
