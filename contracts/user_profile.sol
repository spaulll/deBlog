// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract UserProfile {

    // ********************
    // *** Event Types ****
    // ********************

    /// @notice Emitted when a new user is created.
    event UserProfileCreated(address indexed userAddress, string username);
   
    /// @notice Emitted when a new post is created.
    event PostCreated(
        address indexed userAddress, 
        string indexed username,
        uint32 postId, 
        string content, 
        uint32 timestamp
    );

    /// @notice Emitted when a post is edited.
    event PostEdited(
        address indexed userAddress, 
        uint32 postId, 
        string content, 
        uint32 timestamp
    );

    /// @notice Emitted when a post receives a like or dislike update.
    event PostReacted(
        address indexed reactor, 
        address indexed postOwner, 
        uint32 postId, 
        bool like, 
        uint64 likes, 
        uint64 dislikes
    );
    
    // ********************
    // *** Data Structs ***
    // ********************

    // Structure to store user data
    struct User {
        address userAddress;          // User's own address
        address tipWalletAddress;     // Wallet address for receiving tips
        string username;              // Unique username
        string bio;                   // User's bio
        string avatarUri;             // URL of the user's avatar
        uint16 postCount;             // Count of posts (max ~ 65k)
        uint32 memberSince;           // Timestamp when the user joined (seconds since epoch)
    }

    // Structure to store post data.
    struct Post {
        uint32 likes;         // Number of likes (max ~ 4.9 billion)
        uint32 dislikes;      // Number of dislikes (max ~ 4.9 billion)
        uint32 id;            // Unique identifier for the post
        uint32 timestamp;     // Timestamp when the post was created (seconds since epoch)
        uint32 commentCount;  // Count of comments on this post
        bool edited;          // Flag indicating if the post has been edited
        bool draft;           // Flag indicating if the post is a draft
        string content;       // Content of the post (dynamic, stored separately)
    }

    // Structure to store comment data.
    struct Comment {
        uint32 commentId;    // Unique identifier for the comment within a post
        uint32 timestamp;    // Timestamp when the comment was added/edited
        address commenter;   // Address of the commenter
        string content;      // Content of the comment
    }

    // ********************
    // *** State Vars *****
    // ********************

    // Mapping from user address to user profile
    mapping(address => User) internal users;

    // Mapping from user address and post index (as uint32) to a Post struct.
    // First key: User address.
    // Second key: Post index (uint32).
    mapping(address => mapping(uint32 => Post)) internal userPosts;

    // Nested mapping to track if a user has liked or disliked a post.
    // First key: Post owner.
    // Second key: Post index (uint32).
    // Third key: User address.
    mapping(address => mapping(address => mapping(uint32 => bool))) public hasLiked;
    mapping(address => mapping(address => mapping(uint32 => bool))) public hasDisliked;

    // Mapping to track if a username already exists.
    mapping(bytes32 => bool) public usernameExists;

    mapping(address => bool) public isRegistered;
    // Nested mapping for storing comments.
    // First key: Owner of the post.
    // Second key: Post index (uint32).
    // Third key: Comment id (uint32).
    mapping(address => mapping(uint32 => mapping(uint32 => Comment))) internal postComments;

    // ********************
    // *** Modifiers *****
    // ********************

    // Modifier to restrict access only to the owner of the profile
    modifier onlyProfileOwner() {
        require(msg.sender == users[msg.sender].userAddress, "You are not the owner");
        _;
    }
    
    modifier onlyRegistered() {
        require(bytes(users[msg.sender].username).length > 0, "You are not registered");
        _;
    }

    // Modifier to restrict access only to the comment owner when editing a comment.
    modifier onlyCommentOwner(address _postOwner, uint32 _postIndex, uint32 _commentId) {
        Comment storage comment = postComments[_postOwner][_postIndex][_commentId];
        require(comment.commenter == msg.sender, "You are not the owner of this comment");
        _;
    }

    // ********************
    // *** Core Functions *
    // ********************

    /// @notice Create a new user profile.
    /// @param _username Unique username for the user.
    /// @param _bio Short bio of the user.
    /// @param _avatarUri URI of the user's avatar.
    function createUser(
        string calldata _username, 
        string calldata _bio, 
        string calldata _avatarUri
    ) external {
        require(bytes(_username).length > 0 || bytes(_username).length < 10, "Username cannot be empty or longer than 10 characters");
        require(bytes(users[msg.sender].username).length == 0, "User already exists");

        // Use the hash of the username for checking uniqueness.
        bytes32 usernameHash = keccak256(bytes(_username));
        require(!usernameExists[usernameHash], "Username already exists");

        // Create a new user profile; default tip wallet is the user's own address.
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
        usernameExists[usernameHash] = true; // Mark the username as taken
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
    ) external onlyProfileOwner {
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

        // Update the user profile details.
        users[msg.sender].username = _username;
        users[msg.sender].bio = _bio;
        users[msg.sender].avatarUri = _avatarUri;
        users[msg.sender].tipWalletAddress = _tipWalletAddress;

        usernameExists[newUsernameHash] = true; // Mark the new username as taken.
    }

    /// @notice Fetch a user's profile data.
    /// @param _userAddress The address of the user.
    /// @return user The User struct containing profile data.
    function getUserProfile(address _userAddress) external view returns (User memory user) {
        user = users[_userAddress];
    }

    /// @notice Create a new post for the user.
    /// @param _content The content of the post.
    function createPost(string calldata _content) external onlyRegistered onlyProfileOwner {
        User storage user = users[msg.sender];
        require(bytes(user.username).length > 0, "User does not exist");
        require(bytes(_content).length > 0, "Content cannot be empty");

        // Use the user's current postCount as the postId.
        uint32 postId = user.postCount;

        // Create a new post.
        userPosts[msg.sender][postId] = Post({
            likes: 0,
            dislikes: 0,
            id: postId,
            timestamp: uint32(block.timestamp),
            commentCount: 0,
            edited: false,
            draft: false,
            content: _content
        });

        // Increment the user's postCount.
        user.postCount += 1;

        emit PostCreated(msg.sender, user.username, postId, _content, uint32(block.timestamp));
    }

    /// @notice Edit an existing post.
    /// @param postIndex The index (ID) of the post.
    /// @param _newContent The new content for the post.
    function editPost(uint32 postIndex, string calldata _newContent) external onlyRegistered onlyProfileOwner {
        require(bytes(userPosts[msg.sender][postIndex].content).length > 0, "Post does not exist");

        Post storage post = userPosts[msg.sender][postIndex];
        post.content = _newContent;
        post.timestamp = uint32(block.timestamp);
        post.edited = true;

        emit PostEdited(msg.sender, postIndex, _newContent, uint32(block.timestamp));
    }

// function editDraftPost(uint32 postIndex, string calldata _newContent) external onlyRegistered onlyProfileOwner {
    
// }

    /// @notice Like or dislike a post.
    /// @param _userAddress The address of the post owner.
    /// @param postIndex The index (ID) of the post.
    /// @param like True to like the post, false to dislike.
    function toggleLikeDislike(address _userAddress, uint32 postIndex, bool like) external {
        require(bytes(userPosts[_userAddress][postIndex].content).length > 0, "Post does not exist");

        bool alreadyLiked = hasLiked[msg.sender][_userAddress][postIndex];
        bool alreadyDisliked = hasDisliked[msg.sender][_userAddress][postIndex];

        // Prevent repeating the same action.
        require(!(alreadyLiked && like) && !(alreadyDisliked && !like), "Action already performed");

        Post storage post = userPosts[_userAddress][postIndex];

        if (like) {
            if (alreadyDisliked) {
                unchecked {
                    post.dislikes -= 1;
                }
                hasDisliked[msg.sender][_userAddress][postIndex] = false;
            }
            post.likes += 1;
            hasLiked[msg.sender][_userAddress][postIndex] = true;
        } else {
            if (alreadyLiked) {
                unchecked {
                    post.likes -= 1;
                }
                hasLiked[msg.sender][_userAddress][postIndex] = false;
            }
            post.dislikes += 1;
            hasDisliked[msg.sender][_userAddress][postIndex] = true;
        }
        
        emit PostReacted(msg.sender, _userAddress, postIndex, like, post.likes, post.dislikes);
    }

    /// @notice Fetch a specific post of a user.
    /// @param _userAddress The address of the post owner.
    /// @param postIndex The index (ID) of the post.
    /// @return post The Post struct containing post details.
    function getPost(address _userAddress, uint32 postIndex) external view returns (Post memory post) {
        require(userPosts[_userAddress][postIndex].draft == false, "Draft posts cannot be fetched");
        require(bytes(userPosts[_userAddress][postIndex].content).length > 0, "Post does not exist");
        post = userPosts[_userAddress][postIndex];
    }

    /// @notice Fetch the tip wallet address of a user.
    /// @param _userAddress The address of the user.
    /// @return tipWalletAddress The wallet address for receiving tips.
    function getUserTipWallet(address _userAddress) public view returns (address tipWalletAddress) {
        require(bytes(users[_userAddress].username).length > 0, "User does not exist");
        tipWalletAddress = users[_userAddress].tipWalletAddress;
    }

    /// @notice Add a comment to a specific post.
    /// @param _postOwner The address of the post owner.
    /// @param _postIndex The index (ID) of the post.
    /// @param _content The content of the comment.
    /// @return commentId The unique identifier assigned to the new comment.
    function addComment(address _postOwner, uint32 _postIndex, string calldata _content) external returns (uint32 commentId) {
        require(bytes(_content).length > 0, "Content cannot be empty");
        require(bytes(userPosts[_postOwner][_postIndex].content).length > 0, "Post does not exist");

        Post storage post = userPosts[_postOwner][_postIndex];
        commentId = post.commentCount;

        postComments[_postOwner][_postIndex][commentId] = Comment({
            commentId: commentId,
            timestamp: uint32(block.timestamp),
            commenter: msg.sender,
            content: _content
        });

        post.commentCount += 1;
    }

    /// @notice Edit an existing comment on a post.
    /// @param _postOwner The address of the post owner.
    /// @param _postIndex The index (ID) of the post.
    /// @param _commentId The id of the comment to be edited.
    /// @param _newContent The new content for the comment.
    function editComment(
        address _postOwner, 
        uint32 _postIndex, 
        uint32 _commentId, 
        string calldata _newContent
    )
        external
        onlyCommentOwner(_postOwner, _postIndex, _commentId)
    {
        require(bytes(userPosts[_postOwner][_postIndex].content).length > 0, "Post does not exist");
        require(bytes(postComments[_postOwner][_postIndex][_commentId].content).length > 0, "Comment does not exist");

        Comment storage commentToEdit = postComments[_postOwner][_postIndex][_commentId];
        commentToEdit.content = _newContent;
        commentToEdit.timestamp = uint32(block.timestamp);
    }

    /// @notice Fetch all comments on a post.
    /// @param _postOwner The address of the post owner.
    /// @param _postIndex The index (ID) of the post.
    /// @return comments An array of Comment structs containing all comment details for the post.
    function getComments(address _postOwner, uint32 _postIndex) external view returns (Comment[] memory comments) {
        require(bytes(userPosts[_postOwner][_postIndex].content).length > 0, "Post does not exist");

        uint32 count = userPosts[_postOwner][_postIndex].commentCount;
        comments = new Comment[](count);

        for (uint32 i = 0; i < count; i++) {
            comments[i] = postComments[_postOwner][_postIndex][i];
        }
    }
}
