import React, { useState, useEffect } from "react";
import { X, Copy, CheckCircle } from "lucide-react";
import { QRCodeSVG } from 'qrcode.react';
import { LoadingOverlay } from "./register.modal-component";

export default function ApproveTransactionModal({setHandelSupportLoading}) {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [account, setAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [ethBalance, setEthBalance] = useState("0");
  const [isApproving, setIsApproving] = useState(false);
  const [error, setError] = useState("");
  const [txHash, setTxHash] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [chainId, setChainId] = useState(null);
  const [ownerWlletAdderss, setOwnerWlletAdderss] = useState("0x726DCb71dc9298D87796309cdBAf3220EbC68472") //change by contract data
    
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
          }
          
          // Listen for account changes
          window.ethereum.on('accountsChanged', (accounts) => {
            if (accounts.length > 0) {
              setAccount(accounts[0]);
              setIsWalletConnected(true);
              fetchEthBalance(accounts[0]);
            } else {
              setIsWalletConnected(false);
              setAccount("");
              setEthBalance("0");
            }
          });
          
          // Listen for chain changes
          window.ethereum.on('chainChanged', (chainId) => {
            setChainId(chainId);
            if (account) {
              fetchEthBalance(account);
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

  //hadel close
  const handelchange =()=>{
    setHandelSupportLoading(false);
  }
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
    } catch (err) {
      console.error(err);
      setError("Failed to connect wallet. Please try again.");
    }
  };
  
  // Approve transaction function
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
    
    setError("");
    setIsApproving(true);
    
    try {
      // Convert amount to wei
      const amountInWei = `0x${(parseFloat(amount) * 1e18).toString(16)}`;
      
      const params = {
        from: account,
        to: recipientAddress,
        value: amountInWei,
      };
      
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [params],
      });
      
      setTxHash(txHash);
      
    } catch (err) {
      console.error(err);
      setError(err.message || "Transaction failed. Please try again.");
    } finally {
      setIsApproving(false);
    }
  };
  
  // Copy address to clipboard
  const copyAddress = () => {
    navigator.clipboard.writeText(recipientAddress);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };
  
  // Format address for display
  const formatAddress = (address) => {
    if (!address) return "";
    return `${address.substring(0, 8)}...${address.substring(address.length - 4)}`;
  };


  // Generate QR code for the address
  const QRCode = () => {
    // This is a simplified representation of the QR code
    // In a real implementation, you would use a library like qrcode.react
    return (
        <div>
        <QRCodeSVG value={ownerWlletAdderss} size={128} />
      </div>
    );
  };



  return (
    <>
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md rounded-2xl p-6 md:p-8 relative shadow-2xl bg-white animate-fade-in">
        <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 transition-colors p-1 rounded-full hover:bg-gray-100" onClick={handelchange}>
          <X size={20} />
        </button>
        
        <div className="flex flex-col items-center space-y-6">
          <h2 className="text-xl font-semibold text-gray-800">Approve Transaction</h2>
          
          <div className="w-40 h-40 bg-white flex items-center justify-center rounded-xl border border-gray-200 shadow-sm overflow-hidden p-1">
            <QRCode />
          </div>
          
          <div className="w-full space-y-4">
            <div className="relative w-full">
              <div className="w-full flex items-center">
                <input
                  className="flex-1 text-center border border-gray-200 rounded-l-lg px-4 py-3 text-sm focus:ring-2 focus:ring-gray-800 focus:border-gray-800 outline-none transition"
                  readOnly
                  value={ `${formatAddress(ownerWlletAdderss)}`}
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
            
            <div className="flex items-center justify-between text-sm text-gray-500 px-1">
              <div>Network: Base Sepolia</div>
              <div>Balance: {ethBalance} ETH</div>
            </div>
            
            {error && (
              <div className="text-red-500 text-sm p-2 bg-red-50 rounded-lg">
                {error}
              </div>
            )}
            
            {txHash && (
              <div className="text-green-700 text-sm p-2 bg-green-50 rounded-lg">
                Transaction submitted! Hash: {formatAddress(txHash)}
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
              className={`w-full font-medium py-3 px-4 rounded-lg transition-colors duration-200 shadow-sm ${
                isWalletConnected 
                  ? " bg-grey hover:bg-black hover:text-white text-black" 
                  : " bg-grey hover:bg-black hover:text-white text-black"
              } ${isApproving ? "opacity-70 cursor-not-allowed" : ""}`}

              onClick={approveTransaction}
              disabled={isApproving}
            >
              {isApproving ? "Processing..." : isWalletConnected ? "Approve Transaction" : "Connect Wallet"}
            </button>
          )}
          
          <div className="text-xs text-gray-400 text-center">
            {isWalletConnected 
              ? `Connected wallet: ${formatAddress(account)}` 
              : "Connect your wallet to approve this transaction"}
          </div>
        </div>
      </div>
    </div>
    {isApproving? <LoadingOverlay isLoading={isApproving} text="Wait! tipping..."/>: ""}
    </>
  );
}
