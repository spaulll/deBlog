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
        uint32 timestamp
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
    // Local per-user post counter.
    mapping(address => uint32) public userPostCount;

    // *************************
    // *** Modifiers         ***
    // *************************
    modifier onlyRegistered() {
        require(userProfile.isRegistered(msg.sender), "User is not registered");
        _;
    }

    modifier onlyCommentOwner(address _postOwner, uint32 _postIndex, uint32 _commentId) {
        Comment storage comment = postComments[_postOwner][_postIndex][_commentId];
        require(comment.commenter == msg.sender, "You are not the owner of this comment");
        _;
    }

    // *************************
    // *** Constructor       ***
    // *************************
    /// @notice Link the blog with the deployed UserProfile contract.
    /// @param _userProfileAddress The address of the UserProfile contract.
    constructor(address _userProfileAddress) {
        userProfile = UserProfile(_userProfileAddress);
    }

    // *************************
    // *** Core Functions    ***
    // *************************

    /// @notice Create a new blog post.
    /// @param _ipfsUri URI where the post content is stored.
    function createPost(string calldata _ipfsUri) external onlyRegistered {
        require(bytes(_ipfsUri).length > 0, "Content cannot be empty");

        // Fetch the user's profile to get their username.
        UserProfile.User memory user = userProfile.getUserProfile(msg.sender);
        require(bytes(user.username).length > 0, "User does not exist");

        // Use local counter for postId.
        uint32 postId = userPostCount[msg.sender];
        userPostCount[msg.sender] = postId + 1;

        // Create the post.
        userPosts[msg.sender][postId] = Post({
            likes: 0,
            dislikes: 0,
            id: postId,
            timestamp: uint32(block.timestamp),
            commentCount: 0,
            edited: false,
            draft: false,
            content: _ipfsUri
        });

        emit PostCreated(msg.sender, user.username, postId, _ipfsUri, uint32(block.timestamp));
    }

    /// @notice Edit an existing post.
    /// @param postIndex The ID of the post.
    /// @param _newContent The new content for the post.
    function editPost(uint32 postIndex, string calldata _newContent) external onlyRegistered {
        Post storage post = userPosts[msg.sender][postIndex];
        require(bytes(post.content).length > 0, "Post does not exist");

        post.content = _newContent;
        post.timestamp = uint32(block.timestamp);
        post.edited = true;

        emit PostEdited(msg.sender, postIndex, _newContent, uint32(block.timestamp));
    }

    /// @notice Like or dislike a post.
    /// @param _userAddress The address of the post owner.
    /// @param postIndex The ID of the post.
    /// @param like True to like the post, false to dislike.
    function toggleLikeDislike(address _userAddress, uint32 postIndex, bool like) external onlyRegistered {
        require(bytes(userPosts[_userAddress][postIndex].content).length > 0, "Post does not exist");

        bool alreadyLiked = hasLiked[msg.sender][_userAddress][postIndex];
        bool alreadyDisliked = hasDisliked[msg.sender][_userAddress][postIndex];

        require(!(alreadyLiked && like) && !(alreadyDisliked && !like), "Action already performed");

        Post storage post = userPosts[_userAddress][postIndex];

        if (like) {
            if (alreadyDisliked) {
                unchecked { post.dislikes -= 1; }
                hasDisliked[msg.sender][_userAddress][postIndex] = false;
            }
            post.likes += 1;
            hasLiked[msg.sender][_userAddress][postIndex] = true;
        } else {
            if (alreadyLiked) {
                unchecked { post.likes -= 1; }
                hasLiked[msg.sender][_userAddress][postIndex] = false;
            }
            post.dislikes += 1;
            hasDisliked[msg.sender][_userAddress][postIndex] = true;
        }

        emit PostReacted(msg.sender, _userAddress, postIndex, like, post.likes, post.dislikes);
    }

    /// @notice Retrieve a published post.
    /// @param _userAddress The address of the post owner.
    /// @param postIndex The ID of the post.
    /// @return post The Post struct.
    function getPost(address _userAddress, uint32 postIndex) external view returns (Post memory post) {
        require(userPosts[_userAddress][postIndex].draft == false, "Draft posts cannot be fetched");
        require(bytes(userPosts[_userAddress][postIndex].content).length > 0, "Post does not exist");
        post = userPosts[_userAddress][postIndex];
    }

    /// @notice Add a comment to a post.
    /// @param _postOwner The address of the post owner.
    /// @param _postIndex The ID of the post.
    /// @param _content The comment text.
    /// @return commentId The new comment's ID.
    function addComment(address _postOwner, uint32 _postIndex, string calldata _content) external onlyRegistered returns (uint32 commentId) {
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

    /// @notice Edit an existing comment.
    /// @param _postOwner The address of the post owner.
    /// @param _postIndex The ID of the post.
    /// @param _commentId The ID of the comment.
    /// @param _newContent The new comment text.
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

    /// @notice Retrieve all comments on a post.
    /// @param _postOwner The address of the post owner.
    /// @param _postIndex The ID of the post.
    /// @return comments An array of Comment structs.
    function getComments(address _postOwner, uint32 _postIndex) external view returns (Comment[] memory comments) {
        require(bytes(userPosts[_postOwner][_postIndex].content).length > 0, "Post does not exist");

        uint32 count = userPosts[_postOwner][_postIndex].commentCount;
        comments = new Comment[](count);

        for (uint32 i = 0; i < count; i++) {
            comments[i] = postComments[_postOwner][_postIndex][i];
        }
    }
}
