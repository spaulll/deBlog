// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IUserProfile {
    function getUserTipWallet(address _userAddress) external view returns (address);
    function isRegistered(address _userAddress) external view returns (bool);
}

contract Tipping {
    // *************************
    // *** State Variables   ***
    // *************************
    address public owner;
    address public userProfileContract;
    uint256 public platformFeesCollected;

    uint256 public constant FEE_PERCENTAGE = 1;

    // *************************
    // *** Events            ***
    // *************************
    event TipSent(address indexed from, address indexed to, uint256 amount, uint256 fee);
    event FeesWithdrawn(address indexed to, uint256 amount);

    // *************************
    // *** Modifiers         ***
    // *************************
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    constructor(address _userProfileContract) {
        require(_userProfileContract != address(0), "Invalid UserProfile contract address");
        userProfileContract = _userProfileContract;
        owner = msg.sender;
    }

    // *************************
    // *** Core Logic        ***
    // *************************

    /// @notice Tip a user and deduct 1% platform fee
    /// @param _creatorAddress The address of the user to be tipped
    function tipUser(address _creatorAddress) external payable {
        require(msg.value > 0, "Tip must be greater than 0");

        IUserProfile userProfile = IUserProfile(userProfileContract);
        require(userProfile.isRegistered(_creatorAddress), "User not registered");

        address payable tipWallet = payable(userProfile.getUserTipWallet(_creatorAddress));

        uint256 fee = msg.value / 100; // 1%
        uint256 tipAmount = msg.value - fee;

        platformFeesCollected += fee;
        (bool sent, ) = tipWallet.call{value: tipAmount}("");
        require(sent, "Tip transfer failed");

        emit TipSent(msg.sender, _creatorAddress, tipAmount, fee);
    }

    /// @notice Withdraw collected platform fees
    /// @param _to Address to receive the withdrawn fees
    function withdrawFees(address payable _to) external onlyOwner {
        require(platformFeesCollected > 0, "No fees to withdraw");
        uint256 amount = platformFeesCollected;
        platformFeesCollected = 0;

        (bool sent, ) = _to.call{value: amount}("");
        require(sent, "Fee withdrawal failed");

        emit FeesWithdrawn(_to, amount);
    }

    /// @notice Transfer contract ownership
    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "Invalid new owner");
        owner = _newOwner;
    }

    // Fallback to accept ETH
    receive() external payable {}
}
