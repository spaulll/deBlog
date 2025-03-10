// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract UserProfile {
    // *************************
    // *** Event Definitions ***
    // *************************
    event UserProfileCreated(address indexed userAddress, string username);

    // *************************
    // *** Data Structures   ***
    // *************************
    struct User {
        address userAddress;
        address tipWalletAddress;
        string username;
        string bio;
        string avatarUri;
        uint16 postCount;       // Optional: May be used if you want to track posts here.
        uint32 memberSince;
    }

    // *************************
    // *** State Variables   ***
    // *************************
    mapping(address => User) internal users;
    mapping(bytes32 => bool) public usernameExists;
    mapping(address => bool) public isRegistered;

    // *************************
    // *** Core Functions    ***
    // *************************

    /// @notice Create a new user profile.
    /// @param _username Unique username for the user.
    /// @param _bio Short bio of the user.
    /// @param _avatarUri URI of the user's avatar.
    function createUser(
        string calldata _username, 
        string calldata _bio, 
        string calldata _avatarUri
    ) external {
        // Ensure username is nonempty and shorter than 10 characters.
        require(bytes(_username).length > 0 && bytes(_username).length < 10, "Username cannot be empty or longer than 10 characters");
        require(bytes(users[msg.sender].username).length == 0, "User already exists");

        // Use the hash of the username for checking uniqueness.
        bytes32 usernameHash = keccak256(bytes(_username));
        require(!usernameExists[usernameHash], "Username already exists");

        // Create the user profile.
        User memory newUser = User({
            userAddress: msg.sender,
            tipWalletAddress: msg.sender,
            username: _username,
            bio: _bio,
            avatarUri: _avatarUri,
            postCount: 0,
            memberSince: uint32(block.timestamp)
        });

        users[msg.sender] = newUser;
        usernameExists[usernameHash] = true;
        isRegistered[msg.sender] = true;

        emit UserProfileCreated(msg.sender, _username);
    }

    /// @notice Edit an existing user profile.
    /// @param _username New username for the user.
    /// @param _bio Updated biography.
    /// @param _avatarUri Updated avatar URL.
    /// @param _tipWalletAddress Updated tip wallet address.
    function editProfile(
        string calldata _username, 
        string calldata _bio, 
        string calldata _avatarUri, 
        address _tipWalletAddress
    ) external {
        require(bytes(_username).length > 0, "Username cannot be empty");
        require(bytes(users[msg.sender].username).length > 0, "User does not exist");
        require(
            keccak256(bytes(users[msg.sender].username)) != keccak256(bytes(_username)), 
            "Old and new username cannot be the same"
        );
        
        // Free the old username.
        bytes32 oldUsernameHash = keccak256(bytes(users[msg.sender].username));
        usernameExists[oldUsernameHash] = false;

        // Check that the new username is not taken.
        bytes32 newUsernameHash = keccak256(bytes(_username));
        require(!usernameExists[newUsernameHash], "Username already exists");

        // Update user details.
        users[msg.sender].username = _username;
        users[msg.sender].bio = _bio;
        users[msg.sender].avatarUri = _avatarUri;
        users[msg.sender].tipWalletAddress = _tipWalletAddress;

        usernameExists[newUsernameHash] = true;
    }

    /// @notice Fetch a user's profile.
    /// @param _userAddress The address of the user.
    /// @return user The User struct containing profile data.
    function getUserProfile(address _userAddress) external view returns (User memory user) {
        user = users[_userAddress];
    }

    /// @notice Fetch the tip wallet address of a user.
    /// @param _userAddress The address of the user.
    /// @return tipWalletAddress The wallet address for receiving tips.
    function getUserTipWallet(address _userAddress) external view returns (address tipWalletAddress) {
        require(bytes(users[_userAddress].username).length > 0, "User does not exist");
        tipWalletAddress = users[_userAddress].tipWalletAddress;
    }
}

