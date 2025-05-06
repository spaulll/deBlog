const hre = require("hardhat");
const { ethers } = require("hardhat");
const readline = require('readline');

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Promisify the question function
function question(query) {
  return new Promise(resolve => {
    rl.question(query, resolve);
  });
}

async function main() {
  try {
    // Prompt for addresses
    const contractAddress = await question('Enter the contract address: ');
    const destinationAddress = await question('Enter the destination address: ');
    
    // Validate addresses
    if (!ethers.utils.isAddress(contractAddress)) {
      console.error(`Invalid contract address: ${contractAddress}`);
      process.exit(1);
    }
    
    if (!ethers.utils.isAddress(destinationAddress)) {
      console.error(`Invalid destination address: ${destinationAddress}`);
      process.exit(1);
    }
    
    console.log(`Contract Address: ${contractAddress}`);
    console.log(`Destination Address: ${destinationAddress}`);
    
    // Get the contract factory
    const TippingContract = await ethers.getContractFactory("Tipping");
    
    // Connect to the deployed contract
    const tippingContract = TippingContract.attach(contractAddress);
    
    // Get the contract's balance before withdrawal
    const balanceBefore = await ethers.provider.getBalance(contractAddress);
    console.log(`Contract Balance Before Withdrawal: ${ethers.utils.formatEther(balanceBefore)} ETH`);
    
    // Get the signer's balance before withdrawal
    const [signer] = await ethers.getSigners();
    const signerBalanceBefore = await signer.getBalance();
    
    // Execute the withdrawal
    console.log(`Withdrawing funds to ${destinationAddress}...`);
    const tx = await tippingContract.withdrawFees(destinationAddress);
    
    // Wait for the transaction to be mined
    console.log(`Transaction hash: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
    
    // Get the contract's balance after withdrawal
    const balanceAfter = await ethers.provider.getBalance(contractAddress);
    console.log(`Contract Balance After Withdrawal: ${ethers.utils.formatEther(balanceAfter)} ETH`);
    
    // Get the destination address balance
    const destinationBalance = await ethers.provider.getBalance(destinationAddress);
    console.log(`Destination Address Balance: ${ethers.utils.formatEther(destinationBalance)} ETH`);
    
    console.log(`Withdrawal successful!`);
    
  } catch (error) {
    console.error("Error withdrawing from contract:", error);
    process.exit(1);
  } finally {
    // Close the readline interface
    rl.close();
  }
}

// Execute the script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });