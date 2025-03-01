// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface UserContract {
    function getUserTipWallet(address _userAddress) external view returns (address tipWalletAddress);
}

contract Tip {
    address public postContract;
    address public owner;
    uint256 internal contractBalance;

    event TipSent(address sender, address indexed userAddress, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action");
        _;
    }

    constructor(address _postContract) {
        postContract = _postContract;
        owner = msg.sender; // Set the deployer as the owner
    }

    /// @notice Fetch the tip wallet address of a user
    /// @param _userAddress The address of the user.
    /// @return tipWalletAddress The wallet address for receiving tips.
    function getTipWallet(address _userAddress) external view returns (address payable tipWalletAddress) {
        tipWalletAddress = payable(UserContract(postContract).getUserTipWallet(_userAddress));
    }

    /// @notice Send a tip to a user
    /// @param _userAddress The address of the user to receive the tip.
    /// param _amount The amount of Ether to send as a tip.                                 (*to be implemented)
    function sendTip(address _userAddress) public payable {
        require(msg.value > 0, "Amount must be greater than 0");
        require(_userAddress != address(0), "Recipient address must not be empty");

        address payable tipWalletAddress = this.getTipWallet(_userAddress);

        uint256 fee = (msg.value * 1) / 100; // Calculate 1% fee
        uint256 amountToSend = msg.value - fee; // Calculate the remaining 99%

        // Add the fee to the contract's balance
        contractBalance += fee;

        // Transfer 99% of the tip to the creator's wallet
        (bool sent, ) = tipWalletAddress.call{value: amountToSend}("");
        require(sent, "Failed to send Ether to creator");
        emit TipSent(msg.sender, _userAddress, amountToSend);
    }

    /// @notice Withdraw fees from the contract
    function withdrawFees() public {
        require(msg.sender == owner, "Only the owner can withdraw fees");
        require(contractBalance > 0, "No fees available to withdraw");

        uint256 amount = contractBalance;
        contractBalance = 0; // Reset the balance before transfer to prevent re-entrancy
        (bool sent, ) = payable(owner).call{value: amount}("");
        require(sent, "Failed to withdraw fees");
    }

    /// @notice Check the contract's balance
    /// @return balance The current balance of the contract.
    function checkContractBalance() external view onlyOwner returns (uint256 balance) {
        balance = address(this).balance;
    }

    /// @notice Check the balance of a user
    /// @param _userAddress The address of the user to check the balance of.
    /// @return balance The current balance of the user.
    function checkUserBalance(address _userAddress) public view returns (uint256) {
        return UserContract(postContract).getUserTipWallet(_userAddress).balance;
    }
}
