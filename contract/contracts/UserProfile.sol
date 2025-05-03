// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract UserProfile {
    // *************************
    // *** Event Definitions ***
    // *************************
    event UserProfileCreated(address indexed userAddress, string username, string bio, string avatarUri, string[] socialLinks, bool isEdited);
    event UserProfileEdited(address indexed userAddress, string username, string bio, string avatarUri, address tipWalletAddress, string[] socialLinks, bool isEdited);
    event BlogContractUpdated(address indexed oldBlogContract, address indexed newBlogContract);

    // *************************
    // *** Data Structures   ***
    // *************************
    struct User {
        address userAddress;
        address tipWalletAddress;
        string username;
        string bio;
        string avatarUri;
        uint32 postCount;     
        uint32 memberSince;
        string[] socialLinks; 
        bool isEdited; // Flag to indicate if the profile has been edited
    }

    // *************************
    // *** State Variables   ***
    // *************************
    mapping(address => User) internal users;
    mapping(bytes32 => bool) public usernameExists;
    mapping(address => bool) public isRegistered;
    mapping(string => address) public usernameToAddress;

    // The address of the blog contract that interacts with this contract.
    address public blogContractAddress;
    
    // Contract owner for administrative functions
    address public owner;
    
    // *************************
    // *** Modifiers         ***
    // *************************
    modifier onlyBlogContract() {
        require(msg.sender == blogContractAddress, "Only Blog contract can call this function");
        _;
    }

    modifier onlyProfileOwner() {
        require(isRegistered[msg.sender], "User does not exist");
        require(msg.sender == users[msg.sender].userAddress, "Only the profile owner can call this function");
        _;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only contract owner can call this function");
        _;
    }

    // *************************
    // *** Constructor       ***
    // *************************
    constructor() {
        owner = msg.sender;
    }

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
        string calldata _avatarUri,
        string[] calldata _socialLinks
    ) external {
        // Ensure username is nonempty and shorter than 10 characters.
        require(bytes(_username).length > 0 && bytes(_username).length <= 10, "Username cannot be empty or longer than 10 characters");
        require(!isRegistered[msg.sender], "User already exists");

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
            memberSince: uint32(block.timestamp),
            socialLinks: _socialLinks,
            isEdited: false
        });
        usernameToAddress[_username] = msg.sender;
        users[msg.sender] = newUser;
        usernameExists[usernameHash] = true;
        isRegistered[msg.sender] = true;

        emit UserProfileCreated(msg.sender, _username, _bio, _avatarUri, _socialLinks, false);
    }

    /// @notice Edit an existing user profile.
    /// @param _username New username for the user.
    /// @param _bio Updated biography.
    /// @param _avatarUri Updated avatar URL.
    /// @param _tipWalletAddress Updated tip wallet address.
    /// @param _socialLinks Updated social media links.
    function editProfile(
        string calldata _username, 
        string calldata _bio, 
        string calldata _avatarUri, 
        address _tipWalletAddress,
        string[] calldata _socialLinks
    ) external onlyProfileOwner {
        require(bytes(_username).length > 0 && bytes(_username).length <= 10, "Username cannot be empty or longer than 10 characters");
        
        string memory oldUsername = users[msg.sender].username;
        
        // If username is changing, update username mappings
        if (keccak256(bytes(oldUsername)) != keccak256(bytes(_username))) {
            // Check that the new username is not taken
            bytes32 newUsernameHash = keccak256(bytes(_username));
            require(!usernameExists[newUsernameHash], "Username already exists");
            
            // Free the old username
            bytes32 oldUsernameHash = keccak256(bytes(oldUsername));
            usernameExists[oldUsernameHash] = false;
            delete usernameToAddress[oldUsername]; // Clean up old mapping
            
            // Set new username mappings
            usernameToAddress[_username] = msg.sender;
            usernameExists[newUsernameHash] = true;
        }
        
        // Validate tip wallet address
        require(_tipWalletAddress != address(0), "Invalid tip wallet address");
        
        // Update user details
        users[msg.sender].username = _username;
        users[msg.sender].bio = _bio;
        users[msg.sender].avatarUri = _avatarUri;
        users[msg.sender].tipWalletAddress = _tipWalletAddress;
        users[msg.sender].socialLinks = _socialLinks;
        users[msg.sender].isEdited = true; // Set the edited flag to true

        emit UserProfileEdited(msg.sender, _username, _bio, _avatarUri, _tipWalletAddress, _socialLinks, true);
    }

    /// @notice Fetch a user's profile.
    /// @param _userAddress The address of the user.
    /// @return user The User struct containing profile data.
    function getUserProfile(address _userAddress) external view returns (User memory user) {
        require(isRegistered[_userAddress], "User does not exist");
        return users[_userAddress];
    }

    /// @notice Fetch the tip wallet address of a user.
    /// @param _userAddress The address of the user.
    /// @return tipWalletAddress The wallet address for receiving tips.
    function getUserTipWallet(address _userAddress) external view returns (address tipWalletAddress) {
        require(isRegistered[_userAddress], "User does not exist");
        return users[_userAddress].tipWalletAddress;
    }

    /// @notice update post count of a user.
    /// @param _userAddress The address of the user.
    /// @param _postCount The new post count.
    function updatePostCount(address _userAddress, uint32 _postCount) external onlyBlogContract {
        require(isRegistered[_userAddress], "User does not exist");
        users[_userAddress].postCount = _postCount;
    }

    /// @notice update blog contract address.
    /// @param _blogContractAddress The address of the blog contract.
    function updateBlogContractAddress(address _blogContractAddress) external onlyOwner {
        require(_blogContractAddress != address(0), "Invalid blog contract address");
        
        address oldBlogContract = blogContractAddress;
        blogContractAddress = _blogContractAddress;
        
        emit BlogContractUpdated(oldBlogContract, _blogContractAddress);
    }
    
    /// @notice Transfer contract ownership
    /// @param _newOwner The address of the new owner
    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "Invalid owner address");
        owner = _newOwner;
    }
}