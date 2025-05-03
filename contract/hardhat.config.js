require("@nomiclabs/hardhat-ethers");
require("dotenv").config(); // Import dotenv to load .env file

module.exports = {
  solidity: {
    version: "0.8.28",
    settings: {
      viaIR: true // Enables the new code generator to fix calldata nested array issue
    }
  },

  defaultNetwork: process.env.NETWORK,  // Use the network name from the environment

  networks: {
    [process.env.NETWORK]: {  // Dynamically set the network using the environment variable
      url: process.env.RPC_URL,  // Load RPC URL from environment
      accounts: [process.env.PRIVATE_KEY]  // Load private key from environment
    }
  }
};
