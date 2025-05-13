const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  // Ensure target directories exist
  const projectRoot = path.join(__dirname, "../../"); // Go up one level from script to contract folder, then up again to project root
  const backendAbiDir = path.join(projectRoot, "backend/libs/abi");
  const frontendAbiDir = path.join(projectRoot, "frontend/src/lib/abi");

  // Create directories if they don't exist
  [backendAbiDir, frontendAbiDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  });

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
  
  // Set Blog address in UserProfile
  const tx = await userProfile.updateBlogContractAddress(blog.address);
  await tx.wait();
  console.log("UserProfile updated with Blog contract address");

  // Extract ABIs and save to files
  const contracts = [
    { name: "UserProfile", instance: userProfile },
    { name: "Blog", instance: blog },
    { name: "Tipping", instance: tipping }
  ];

  // Copy ABIs to both directories
  for (const contract of contracts) {
    const artifact = await hre.artifacts.readArtifact(contract.name);
    const abi = JSON.stringify(artifact.abi, null, 2);
    
    // Save to backend directory
    const backendPath = path.join(backendAbiDir, `${contract.name}.json`);
    fs.writeFileSync(backendPath, abi);
    console.log(`Saved ${contract.name} ABI to ${backendPath}`);
    
    // Save to frontend directory
    const frontendPath = path.join(frontendAbiDir, `${contract.name}.json`);
    fs.writeFileSync(frontendPath, abi);
    console.log(`Saved ${contract.name} ABI to ${frontendPath}`);
  }

  // Create an addresses.json file with contract addresses in both directories
  const addresses = {
    UserProfile: userProfile.address,
    Blog: blog.address,
    Tipping: tipping.address
  };
  
  const addressesJson = JSON.stringify(addresses, null, 2);
  
  fs.writeFileSync(path.join(backendAbiDir, 'addresses.json'), addressesJson);
  console.log(`Saved contract addresses to backend/libs/abi/addresses.json`);
  
  fs.writeFileSync(path.join(frontendAbiDir, 'addresses.json'), addressesJson);
  console.log(`Saved contract addresses to frontend/src/lib/abi/addresses.json`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});