import React, { useState, useEffect } from "react";
import { X, Copy, CheckCircle } from "lucide-react";
import { QRCodeSVG } from 'qrcode.react';
import { LoadingOverlay } from "./register.modal-component";
import { TippingContract } from "../lib/contracts";
import { ethers, BrowserProvider, parseEther } from "ethers";

// ABI for the Tipping contract
const TIPPING_CONTRACT_ABI = TippingContract.abi;
const contractAddress = TippingContract.address;

export default function ApproveTransactionModal({ setHandelSupportLoading, authorTipAddress }) {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [account, setAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [ethBalance, setEthBalance] = useState("0");
  const [isApproving, setIsApproving] = useState(false);
  const [error, setError] = useState("");
  const [txHash, setTxHash] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [chainId, setChainId] = useState(null);
  const [contract, setContract] = useState(null);

  // Base Sepolia Chain ID and configuration
  const BASE_SEPOLIA_CHAIN_ID = "0x14a34";
  const BASE_SEPOLIA_PARAMS = {
    chainId: "0x14a34",
    chainName: "Base Sepolia",
    nativeCurrency: {
      name: "Sepolia Ether",
      symbol: "ETH",
      decimals: 18
    },
    rpcUrls: ["https://sepolia.base.org"],
    blockExplorerUrls: ["https://sepolia.basescan.org"]
  };

  // Initialize contract instance
  const initializeContract = async (provider) => {
    try {
      const signer = await provider.getSigner();
      const tippingContract = new ethers.Contract(
        contractAddress,
        TIPPING_CONTRACT_ABI,
        signer
      );
      setContract(tippingContract);
    } catch (err) {
      console.error("Error initializing contract:", err);
    }
  };

  // Check if MetaMask is installed and handle wallet connection
  useEffect(() => {
    const checkMetaMask = async () => {
      if (window.ethereum) {
        try {
          // Check if already connected
          const accounts = await window.ethereum.request({
            method: 'eth_accounts'
          });

          // Get current chain
          const chainId = await window.ethereum.request({
            method: 'eth_chainId'
          });
          setChainId(chainId);

          if (accounts.length > 0) {
            setAccount(accounts[0]);
            setIsWalletConnected(true);
            fetchEthBalance(accounts[0]);

            // Initialize contract with ethers provider
            const provider = new BrowserProvider(window.ethereum);
            initializeContract(provider);
          }

          // Listen for account changes
          window.ethereum.on('accountsChanged', (accounts) => {
            if (accounts.length > 0) {
              setAccount(accounts[0]);
              setIsWalletConnected(true);
              fetchEthBalance(accounts[0]);

              // Re-initialize contract with new account
              const provider = new BrowserProvider(window.ethereum);
              initializeContract(provider);
            } else {
              setIsWalletConnected(false);
              setAccount("");
              setEthBalance("0");
              setContract(null);
            }
          });

          // Listen for chain changes
          window.ethereum.on('chainChanged', (chainId) => {
            setChainId(chainId);
            if (account) {
              fetchEthBalance(account);
              // Re-initialize contract on network change
              const provider = new BrowserProvider(window.ethereum);
              initializeContract(provider);
            }
          });
        } catch (err) {
          console.error(err);
        }
      }
    };

    checkMetaMask();

    // Cleanup listeners
    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  useEffect(() => {
    if (authorTipAddress) {
      console.warn("authorTipAddress", authorTipAddress);
    }
  }, [authorTipAddress]);

  //hadel close
  const handelchange = () => {
    setHandelSupportLoading(false);
  };

  // Fetch ETH balance
  const fetchEthBalance = async (address) => {
    try {
      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest']
      });

      // Convert balance from wei to ETH (balance is in hex)
      const balanceInEth = parseInt(balance, 16) / 1e18;
      setEthBalance(balanceInEth.toFixed(4));
    } catch (err) {
      console.error("Error fetching balance:", err);
      setEthBalance("0");
    }
  };

  // Switch to Base Sepolia network
  const switchToBaseSepolia = async () => {
    if (!window.ethereum) return;

    try {
      // Try to switch to the network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: BASE_SEPOLIA_CHAIN_ID }],
      });
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [BASE_SEPOLIA_PARAMS],
          });
        } catch (addError) {
          console.error("Error adding chain:", addError);
          setError("Failed to add Base Sepolia network to MetaMask");
        }
      } else {
        console.error("Error switching chain:", switchError);
        setError("Failed to switch to Base Sepolia network");
      }
    }
  };

  // Connect wallet function
  const connectWallet = async () => {
    setError("");

    if (!window.ethereum) {
      setError("MetaMask is not installed. Please install MetaMask to continue.");
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      setAccount(accounts[0]);
      setIsWalletConnected(true);
      fetchEthBalance(accounts[0]);

      // Check if we're on Base Sepolia
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (chainId !== BASE_SEPOLIA_CHAIN_ID) {
        await switchToBaseSepolia();
      }

      // Initialize contract
      const provider = new BrowserProvider(window.ethereum);
      initializeContract(provider);
    } catch (err) {
      console.error(err);
      setError("Failed to connect wallet. Please try again.");
    }
  };

  // Send tip through the contract
  const approveTransaction = async () => {
    if (!isWalletConnected) {
      await connectWallet();
      return;
    }

    // Ensure we're on Base Sepolia
    if (chainId !== BASE_SEPOLIA_CHAIN_ID) {
      await switchToBaseSepolia();
      return;
    }

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (!authorTipAddress) {
      setError("Creator address is missing");
      return;
    }

    if (!contract) {
      setError("Contract not initialized");
      return;
    }

    setError("");
    setIsApproving(true);

    try {
      // Convert amount to wei
      const amountInWei = parseEther(amount);

      console.log(`Tipping ${authorTipAddress} with ${amount} ETH`);

      // Call the tipUser function on the contract
      const tx = await contract.tipUser(authorTipAddress, {
        value: amountInWei
      });

      setTxHash(tx.hash);
      console.log("Transaction hash:", tx.hash);

      // Wait for transaction to be mined
      await tx.wait();
      console.log("Transaction confirmed");

    } catch (err) {
      console.error(err);

      // Check for user rejection
      if (err.code === 'ACTION_REJECTED' ||
        err.code === 4001 ||
        (err.message && err.message.includes('user denied')) ||
        (err.message && err.message.includes('User denied'))) {
        setError("Transaction was rejected");
      } else {
        setError("Transaction failed. Please try again.");
      }
    } finally {
      setIsApproving(false);
    }
  };

  // Copy address to clipboard
  const copyAddress = () => {
    navigator.clipboard.writeText(authorTipAddress);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Format address for display
  const formatAddress = (address) => {
    if (!address) return "";
    return `${address.substring(0, 7)}...${address.substring(address.length - 4)}`;
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div className="w-full max-w-md rounded-2xl p-6 md:p-8 relative shadow-2xl bg-white animate-fade-in">
          <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 transition-colors p-1 rounded-full hover:bg-gray-100" onClick={handelchange}>
            <X size={20} />
          </button>

          <div className="flex flex-col items-center space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">Send Tip to Creator</h2>

            <div className="w-40 h-40 bg-white flex items-center justify-center rounded-xl border border-gray-200 shadow-sm overflow-hidden p-1">
              <QRCodeSVG value={contractAddress} size={128} />
            </div>

            <div className="w-full space-y-4">
              <div className="relative w-full">
                <div className="w-full flex items-center">
                  <input
                    className="flex-1 text-center border border-gray-200 rounded-l-lg px-4 py-3 text-sm focus:ring-2 focus:ring-gray-800 focus:border-gray-800 outline-none transition"
                    readOnly
                    value={`Tipping ${formatAddress(authorTipAddress || '')}`}
                  />
                  <button
                    onClick={copyAddress}
                    className="bg-gray-100 border border-l-0 border-gray-200 rounded-r-lg px-4 py-3 hover:bg-gray-200 transition-colors"
                  >
                    {isCopied ? <CheckCircle size={18} className="text-green-600" /> : <Copy size={18} />}
                  </button>
                </div>
                {chainId && chainId !== BASE_SEPOLIA_CHAIN_ID && (
                  <div className="absolute top-3 right-14">
                    <div className="text-xs px-2 py-1 bg-yellow-100 rounded-md text-yellow-700">
                      Wrong Network
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 w-full">
                <div className="relative flex-1">
                  <input
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-gray-800 focus:border-gray-800 outline-none transition pr-16"
                    placeholder="Amount"
                    type="number"
                    min="0"
                    step="0.001"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center">
                    <div className="px-3 text-gray-500 font-medium">ETH</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col text-sm text-gray-500 px-1 gap-1">
                <div className="flex items-center justify-between">
                  <div>Network: Base Sepolia</div>
                  <div>Balance: {ethBalance} ETH</div>
                </div>
                <div className="text-xs text-gray-400">
                  Note: 1% platform fee will be deducted
                </div>
              </div>

              {error && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px',
                  backgroundColor: '#FEF2F2',
                  borderRadius: '8px',
                  border: '1px solid #FECACA',
                  marginBottom: '12px',
                  color: '#DC2626'
                }}>
                  <svg xmlns="http://www.w3.org/2000/svg" style={{ height: '20px', width: '20px', marginRight: '8px', flexShrink: 0 }} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span style={{ fontSize: '14px' }}>{error}</span>
                </div>
              )}

              {txHash && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px',
                  backgroundColor: '#F0FDF4',
                  borderRadius: '8px',
                  border: '1px solid #DCFCE7',
                  marginBottom: '12px',
                  color: '#15803D'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" style={{ height: '20px', width: '20px', marginRight: '8px', flexShrink: 0 }} viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span style={{ fontSize: '14px' }}>Transaction submitted!</span>
                  </div>
                  <a
                    href={`https://sepolia.basescan.org/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: '14px',
                      color: '#15803D',
                      textDecoration: 'none'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
                    onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
                  >
                    {formatAddress(txHash)}
                    <svg xmlns="http://www.w3.org/2000/svg" style={{ height: '16px', width: '16px', marginLeft: '4px' }} viewBox="0 0 20 20" fill="currentColor">
                      <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                      <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                    </svg>
                  </a>
                </div>
              )}
            </div>

            {chainId && chainId !== BASE_SEPOLIA_CHAIN_ID && isWalletConnected ? (
              <button
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 shadow-sm"
                onClick={switchToBaseSepolia}
              >
                Switch to Base Sepolia
              </button>
            ) : (
              <button
                className={`w-full font-medium py-3 px-4 rounded-lg transition-colors duration-200 shadow-sm ${isWalletConnected
                  ? "bg-grey hover:bg-black hover:text-white text-black"
                  : "bg-grey hover:bg-black hover:text-white text-black"
                  } ${isApproving ? "opacity-70 cursor-not-allowed" : ""}`}
                onClick={approveTransaction}
                disabled={isApproving}
              >
                {isApproving ? "Processing..." : isWalletConnected ? "Send Tip" : "Connect Metamask to send a tip"}
              </button>
            )}

            <div className="text-xs text-gray-400 text-center">
              {isWalletConnected ? `Connected wallet: ${formatAddress(account)}}` : ``}

            </div>
          </div>
        </div>
      </div>
      {isApproving ? <LoadingOverlay isLoading={isApproving} text="Wait! Processing tip..." /> : ""}
    </>
  );
}