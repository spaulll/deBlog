// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./UserProfile.sol";

contract Blog {
    // *************************
    // *** Linking Contracts ***
    // *************************
    UserProfile public userProfile;

    // *************************
    // *** Event Definitions ***
    // *************************
    event PostCreated(
        address indexed userAddress, 
        string indexed username,
        uint32 postId, 
        string ipfsUri, 
        uint32 timestamp, 
        string[] tags,
        bytes32 blogIdHash
    );
    event PostEdited(
        address indexed userAddress, 
        uint32 postId, 
        string content, 
        uint32 timestamp
    );
    event PostReacted(
        address indexed reactor, 
        address indexed postOwner, 
        uint32 postId, 
        bool like, 
        uint32 likes, 
        uint32 dislikes
    );

    // *************************
    // *** Data Structures   ***
    // *************************
    struct Post {
        uint32 likes;
        uint32 dislikes;
        uint32 id;
        uint32 timestamp;
        uint32 commentCount;
        bool edited;
        bool draft;
        string content;
        string[] tags;
        bytes32 blogIdHash;
    }

    struct Comment {
        uint32 commentId;
        uint32 timestamp;
        address commenter;
        string content;
    }

    // *************************
    // *** State Variables   ***
    // *************************
    // Mapping: user address => (postId => Post)
    mapping(address => mapping(uint32 => Post)) internal userPosts;
    // Mapping: user address => (postId => (commentId => Comment))
    mapping(address => mapping(uint32 => mapping(uint32 => Comment))) internal postComments;
    // Like/dislike tracking.
    mapping(address => mapping(address => mapping(uint32 => bool))) public hasLiked;
    mapping(address => mapping(address => mapping(uint32 => bool))) public hasDisliked;
    // Per-user post counter.
    mapping(address => uint32) public userPostCount;
    // Tag tracking.
    mapping(bytes32 => bool) internal tagExists;
    // Get blogIdHash by tag.
    // key 1: tagHash, key 2: blogIdHash[]
    mapping(bytes32 => bytes32[]) public blogIdHashesByTag;
    // Get postId by blogIdHash.
    mapping(bytes32 => uint32) public postIdsByBlogIdHash;
    // Mapping to track the owner of each post by its blogIdHash.
    mapping(bytes32 => address) public postOwner;

    // *************************
    // *** Modifiers         ***
    // *************************
    modifier onlyRegistered() {
        require(userProfile.isRegistered(msg.sender), "User is not registered");
        _;
    }

    // *************************
    // *** Constructor       ***
    // *************************
    /// @notice Link the blog with the deployed UserProfile contract.
    /// @param _userProfileContractAddress The address of the UserProfile contract.
    constructor(address _userProfileContractAddress) {
        userProfile = UserProfile(_userProfileContractAddress);
    }

    // *************************
    // *** Core Functions    ***
    // *************************

    /// @notice Create a new blog post.
    /// @param _ipfsUri URI where the post content is stored.
    /// @param _tags Tags for the post.
    /// @param _blogIdHash Unique identifier for the post.
    function createPost(string calldata _ipfsUri, string[] calldata _tags, bytes32 _blogIdHash) external onlyRegistered {
        require(bytes(_ipfsUri).length > 0, "Content cannot be empty");

        // Fetch the user's profile to get their username.
        UserProfile.User memory user = userProfile.getUserProfile(msg.sender);
        require(bytes(user.username).length > 0, "User does not exist");

        // Use local counter for postId.
        uint32 postId = userPostCount[msg.sender];
        userPostCount[msg.sender] = postId + 1;
        // Assign the postId to the blogIdHash.
        postIdsByBlogIdHash[_blogIdHash] = postId;

        // Assign the blogIdHash to each tag.
        for (uint256 i = 0; i < _tags.length; i++) {
            bytes32 tagHash = keccak256(abi.encodePacked(_tags[i]));
            blogIdHashesByTag[tagHash].push(_blogIdHash);
        }

        // Track the owner of this post.
        postOwner[_blogIdHash] = msg.sender;

        // Create the post.
        userPosts[msg.sender][postId] = Post({
            likes: 0,
            dislikes: 0,
            id: postId,
            timestamp: uint32(block.timestamp),
            commentCount: 0,
            edited: false,
            draft: false,
            content: _ipfsUri,
            tags: _tags,
            blogIdHash: _blogIdHash
        });

        emit PostCreated(msg.sender, user.username, postId, _ipfsUri, uint32(block.timestamp), _tags, _blogIdHash);
    }

    /// @notice Edit an existing post using its blogIdHash.
    /// @param _blogIdHash The unique identifier for the post.
    /// @param _newContent The new content for the post.
    function editPost(bytes32 _blogIdHash, string calldata _newContent) external onlyRegistered {
        address owner = postOwner[_blogIdHash];
        require(owner == msg.sender, "Only post owner can edit");
        uint32 postIndex = postIdsByBlogIdHash[_blogIdHash];
        Post storage post = userPosts[owner][postIndex];
        require(bytes(post.content).length > 0, "Post does not exist");

        post.content = _newContent;
        post.timestamp = uint32(block.timestamp);
        post.edited = true;

        emit PostEdited(msg.sender, postIndex, _newContent, uint32(block.timestamp));
    }

    /// @notice Like or dislike a post using its blogIdHash.
    /// @param _blogIdHash The unique identifier for the post.
    /// @param like True to like the post, false to dislike.
    function toggleLikeDislike(bytes32 _blogIdHash, bool like) external onlyRegistered {
        address owner = postOwner[_blogIdHash];
        uint32 postIndex = postIdsByBlogIdHash[_blogIdHash];
        require(bytes(userPosts[owner][postIndex].content).length > 0, "Post does not exist");

        bool alreadyLiked = hasLiked[msg.sender][owner][postIndex];
        bool alreadyDisliked = hasDisliked[msg.sender][owner][postIndex];

        require(!(alreadyLiked && like) && !(alreadyDisliked && !like), "Action already performed");

        Post storage post = userPosts[owner][postIndex];

        if (like) {
            if (alreadyDisliked) {
                unchecked { post.dislikes -= 1; }
                hasDisliked[msg.sender][owner][postIndex] = false;
            }
            post.likes += 1;
            hasLiked[msg.sender][owner][postIndex] = true;
        } else {
            if (alreadyLiked) {
                unchecked { post.likes -= 1; }
                hasLiked[msg.sender][owner][postIndex] = false;
            }
            post.dislikes += 1;
            hasDisliked[msg.sender][owner][postIndex] = true;
        }

        emit PostReacted(msg.sender, owner, postIndex, like, post.likes, post.dislikes);
    }

    /// @notice Retrieve a published post by its blogIdHash.
    /// @param _blogIdHash The unique identifier for the post.
    /// @return post The Post struct.
    function getPost(bytes32 _blogIdHash) external view returns (Post memory post) {
        address owner = postOwner[_blogIdHash];
        uint32 postIndex = postIdsByBlogIdHash[_blogIdHash];
        require(userPosts[owner][postIndex].draft == false, "Draft posts cannot be fetched");
        require(bytes(userPosts[owner][postIndex].content).length > 0, "Post does not exist");
        post = userPosts[owner][postIndex];
    }

    /// @notice Add a comment to a post using its blogIdHash.
    /// @param _blogIdHash The unique identifier for the post.
    /// @param _content The comment text.
    /// @return commentId The new comment's ID.
    function addComment(bytes32 _blogIdHash, string calldata _content) external onlyRegistered returns (uint32 commentId) {
        require(bytes(_content).length > 0, "Content cannot be empty");
        address owner = postOwner[_blogIdHash];
        uint32 postIndex = postIdsByBlogIdHash[_blogIdHash];
        require(bytes(userPosts[owner][postIndex].content).length > 0, "Post does not exist");

        Post storage post = userPosts[owner][postIndex];
        commentId = post.commentCount;

        postComments[owner][postIndex][commentId] = Comment({
            commentId: commentId,
            timestamp: uint32(block.timestamp),
            commenter: msg.sender,
            content: _content
        });

        post.commentCount += 1;
    }

    /// @notice Edit an existing comment on a post using its blogIdHash.
    /// @param _blogIdHash The unique identifier for the post.
    /// @param _commentId The ID of the comment.
    /// @param _newContent The new comment text.
    function editComment(bytes32 _blogIdHash, uint32 _commentId, string calldata _newContent) external {
        address owner = postOwner[_blogIdHash];
        uint32 postIndex = postIdsByBlogIdHash[_blogIdHash];
        Comment storage comment = postComments[owner][postIndex][_commentId];
        require(comment.commenter == msg.sender, "You are not the owner of this comment");
        require(bytes(userPosts[owner][postIndex].content).length > 0, "Post does not exist");
        require(bytes(comment.content).length > 0, "Comment does not exist");

        comment.content = _newContent;
        comment.timestamp = uint32(block.timestamp);
    }

    /// @notice Retrieve all comments on a post using its blogIdHash.
    /// @param _blogIdHash The unique identifier for the post.
    /// @return comments An array of Comment structs.
    function getComments(bytes32 _blogIdHash) external view returns (Comment[] memory comments) {
        address owner = postOwner[_blogIdHash];
        uint32 postIndex = postIdsByBlogIdHash[_blogIdHash];
        require(bytes(userPosts[owner][postIndex].content).length > 0, "Post does not exist");

        uint32 count = userPosts[owner][postIndex].commentCount;
        comments = new Comment[](count);

        for (uint32 i = 0; i < count; i++) {
            comments[i] = postComments[owner][postIndex][i];
        }
    }
}
