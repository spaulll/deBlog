import express from "express";
import mongoose from "mongoose";
import "dotenv/config";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import jwt from "jsonwebtoken";
import cors from "cors";
import admin from "firebase-admin";
import { getAuth } from "firebase-admin/auth";
import { createRequire } from "module";
import multer from "multer";
const require = createRequire(import.meta.url);
const serviceAccount = require("./react-js-blog-website-c3587-firebase-adminsdk-yrei8-8bdd095672.json");

// Import Schema
import User from "./Schema/User.js";
import Image from "./Schema/imgdb.js";
import { verify } from "crypto";
import Blog from "./Schema/Blog.js";
import Notification from "./Schema/Notification.js";
import Comment from "./Schema/Comment.js";
import { title } from "process";

// Regex patterns for validation
const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;
const maxLimit = 10;

// Initialize Express
const server = express();
const port = process.env.PORT || 3000;
const storage = multer.memoryStorage();
const upload = multer({ storage });

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Middleware
server.use(express.json());
server.use(cors());

// Connect to MongoDB
mongoose
  .connect(process.env.DB_LOCATION, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    autoIndex: true,
  })
  .then(() => console.log("Connected to DB"))
  .catch((err) => console.error("DB connection error:", err));

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) {
    return res.status(401).json({ error: "No access token found" });
  }
  jwt.verify(token, process.env.SECRET_ACCESS_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Access token is invalid" });
    }
    req.user = user.id;
    next();
  });
};
// Helper function to format data
const formatDatatoSend = (user) => {
  const access_token = jwt.sign(
    { id: user._id },
    process.env.SECRET_ACCESS_KEY
  );
  return {
    access_token,
    profile_img: user.personal_info.profile_img,
    username: user.personal_info.username,
    fullname: user.personal_info.fullname,
  };
};

// Helper function to generate unique usernames
const generateUsername = async (email) => {
  let username = email.split("@")[0];
  const isUsernameNotUnique = await User.exists({
    "personal_info.username": username,
  });
  if (isUsernameNotUnique) {
    username += nanoid().substring(0, 5);
  }
  return username;
};

// Signup Route
server.post("/signup", async (req, res) => {
  const { fullname, email, password } = req.body;

  // Validation
  if (fullname.length < 3) {
    return res
      .status(400)
      .json({ error: "Full name must be at least 3 characters long." });
  }
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email." });
  }
  if (!password || !passwordRegex.test(password)) {
    return res.status(400).json({
      error:
        "Password must be 6-20 characters long, include at least one uppercase letter, one lowercase letter, and one digit.",
    });
  }

  // Hash password and save user
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const username = await generateUsername(email);
    const newUser = new User({
      personal_info: { fullname, email, password: hashedPassword, username },
    });
    const savedUser = await newUser.save();
    res.status(201).json(formatDatatoSend(savedUser));
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: "Email already exists." });
    }
    res.status(500).json({ error: err.message });
  }
});

// Route to upload an image and return the image ID

//upload and return
server.post(
  "/upload-img-return-URL",
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ success: 0, message: "No file uploaded." });
      }

      const { buffer, originalname, mimetype } = req.file;

      // Check if the image already exists
      const existingImage = await Image.findOne({ name: originalname });

      if (existingImage) {
        // Return the existing image URL if found
        const imageUrl = `http://localhost:${process.env.PORT || 3000}/image/${
          existingImage.image_id
        }`;
        return res.status(200).json({
          success: 1,
          message: "Image already exists.",
          file: { url: imageUrl },
        });
      }

      // If the image does not exist, save it to the database
      const newImage = new Image({
        image_id: new mongoose.Types.ObjectId().toString(),
        name: originalname,
        value: buffer,
        contentType: mimetype,
      });

      await newImage.save();

      // Generate a URL to retrieve the uploaded image
      const imageUrl = `http://localhost:${process.env.PORT || 3000}/image/${
        newImage.image_id
      }`;

      res.status(200).json({
        success: 1,
        message: "Image uploaded successfully.",
        file: { url: imageUrl },
      });
    } catch (err) {
      console.error("Error processing image upload:", err);
      res.status(500).json({ success: 0, message: "Internal Server Error." });
    }
  }
);

// Route to retrieve an image by ID

server.get("/image/:id", async (req, res) => {
  try {
    const image = await Image.findOne({ image_id: req.params.id });

    if (!image) {
      return res.status(404).json({ success: 0, message: "Image not found." });
    }

    res.set("Content-Type", image.contentType);
    res.send(image.value);
  } catch (err) {
    console.error("Error retrieving image:", err);
    res.status(500).json({ success: 0, message: "Internal Server Error." });
  }
});

// Route to list all images

// Signin Route
server.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ "personal_info.email": email });
    if (!user) {
      return res.status(404).json({ error: "Email not found." });
    }

    if (!user.google_auth) {
      const isPasswordCorrect = await bcrypt.compare(
        password,
        user.personal_info.password
      );
      if (!isPasswordCorrect) {
        return res.status(401).json({ error: "Incorrect password." });
      }

      res.status(200).json(formatDatatoSend(user));
    } else {
      return res.status(401).json({
        error: "Account alrady created using this mail through Google.",
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

server.post("/search-blogs", (req, res) => {
  let { tag, query, page, author, limit, eliminate_blog } = req.body;
  let findQuery;
  if (tag) {
    findQuery = { tags: tag, draft: false, blog_id: { $ne: eliminate_blog } };
  } else if (query) {
    findQuery = { draft: false, title: new RegExp(query, "i") };
  } else if (author) {
    findQuery = { author, draft: false };
  }

  let maxLimit = limit ? limit : 2;
  Blog.find(findQuery)
    .populate(
      "author",
      "personal_info.profile_img personal_info.username personal_info.fullname -_id"
    )
    .sort({ publishedAt: -1 }) //tell give me the latest
    .select("blog_id title des banner activity tags publishedAt -_id")
    .skip((page - 1) * maxLimit)
    .limit(maxLimit)
    .then((blogs) => {
      return res.status(200).json({ blogs: blogs });
    })
    .catch((err) => {
      return res.status(500).json({
        error: err.message,
      });
    });
});

server.post("/search-users", async (req, res) => {
  try {
    let { query } = req.body;

    // Validate input
    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    let maxLimit = 10;
    const users = await User.find({
      "personal_info.username": new RegExp(query, "i"),
    })
      .limit(maxLimit)
      .select(
        "personal_info.fullname personal_info.username personal_info.profile_img -_id"
      );

    return res.status(200).json({ users });
  } catch (err) {
    console.error("Search users error:", err);
    return res.status(500).json({
      error: "Internal server error",
      details: err.message,
    });
  }
});

server.post("/search-blogs-count", (req, res) => {
  let { tag, query, author } = req.body;
  let findQuery;
  if (tag) {
    findQuery = { tags: tag, draft: false };
  } else if (query) {
    findQuery = { draft: false, title: new RegExp(query, "i") };
  } else if (author) {
    findQuery = { author, draft: false };
  }
  Blog.countDocuments(findQuery)
    .then((count) => {
      return res.status(200).json({ totalDocs: count });
    })
    .catch((err) => {
      return res.status(500).json({
        error: err.message,
      });
    });
});
server.post("/get-user-profile", (req, res) => {
  let { username } = req.body;
  User.findOne({ "personal_info.username": username })
    .select("-personal_info.password -google_auth -updateAt -blogs")

    .then((user) => {
      return res.status(200).json({ user });
    })
    .catch((err) => {
      return res.status(500).json({
        error: err.message,
      });
    });
});
//store and validate the publish blog part
server.post("/create-blog", verifyJWT, (req, res) => {
  let authorId = req.user;
  console.log(authorId);
  let { title, des, banner, tags, content, draft, id } = req.body;
  console.log (title,+"/n"+ des,+"/n"+ banner,+"/n"+ tags,+"/n"+ content,+"/n"+ draft,+"/n"+ id +"hello")
  if (!title.length) {
    return res
      .status(403)
      .json({ error: "You must provide a title to publish the blog" });
  }
  if (!draft) {
    if (!title.length) {
      return res
        .status(403)
        .json({ error: "You must provide a title to publish the blog" });
    }
    if (!des.length || des.length > 200) {
      return res
        .status(403)
        .json({ error: "You must provide a desciption under 200 character." });
    }
    if (!banner.length) {
      return res
        .status(403)
        .json({ error: "You must provide a banner to publish" });
    }
    if (!content.blocks?.length) {
      return res.status(403).json({ error: "There must be some blog content" });
    }
    if (!tags.length || tags.length > 16) {
      return res
        .status(403)
        .json({ error: "You must provide a tags under limit" });
    }

    tags = tags.map((tag) => tag.toLowerCase());
  }

  let blog_id =
    id ||
    title
      .replace(/[^a-zA-Z0-9]/g, " ")
      .replace(/\s+/g, "-")
      .trim() + nanoid();
  // return res.status(200).json({ status: "good to go" });
  // return res.status(200).json(req.body);
  if (id) {
    Blog.findOneAndUpdate(
      { blog_id },
      {
        title,
        des,
        banner,
        content,
        tags,
        author: authorId,
        blog_id,
        draft: draft ? draft : false,
      }
    )
      .then((user) => {
        return res.status(200).json({ id: blog_id });
      })
      .catch((err) => {
        return res
          .status(500)
          .json({ error: " Faild to update total posts number" });
      });
  } else {
    let blog = new Blog({
      title,
      des,
      banner,
      content,
      tags,
      author: authorId,
      blog_id,
      draft: Boolean(draft),
    });
    blog
      .save()
      .then((blog) => {
        let incrementVal = draft ? 0 : 1;
        User.findOneAndUpdate(
          { _id: authorId },
          {
            $inc: { "account_info.total_posts": incrementVal },
            $push: { blogs: blog._id },
          }
        )
          .then((user) => {
            return res.status(200).json({ id: blog.blog_id });
          })
          .catch((err) => {
            return res
              .status(500)
              .json({ error: " Faild to update total posts number" });
          });
      })
      .catch((err) => {
        return res.status(500).json({ error: err.masssage });
      });
  }
});
server.post("/latest-blogs", (req, res) => {
  let { page } = req.body;
  let maxLimit = 5;
  Blog.find({ draft: false })
    .populate(
      "author",
      "personal_info.profile_img personal_info.username personal_info.fullname -_id"
    )
    .sort({ publishedAt: -1 }) //tell give me the latest
    .select("blog_id title des banner activity tags publishedAt -_id")
    .skip((page - 1) * maxLimit)
    .limit(maxLimit)
    .then((blogs) => {
      return res.status(200).json({ blogs: blogs });
    })
    .catch((err) => {
      return res.status(500).json({
        error: err.message,
      });
    });
});
server.post("/all-latest-blog-count", (req, res) => {
  Blog.countDocuments({ draft: false })
    .then((count) => {
      return res.status(200).json({ totalDocs: count });
    })
    .catch((err) => {
      return res.status(500).json({
        error: err.message,
      });
    });
});
server.get("/trending-blogs", (req, res) => {
  Blog.find({ draft: false })
    .populate(
      "author",
      "personal_info.profile_img personal_info.username personal_info.fullname -_id"
    )
    .sort({
      "activity.total_reads": -1,
      publishedAt: -1,
      "activity.total_likes": -1,
    })
    .select("blog_id title publishedAt -_id")
    .then((blogs) => {
      return res.status(200).json({ blogs });
    })
    .catch((err) => {
      return res.status(500).json({
        error: err.message,
      });
    });
});

// Google login credential authentication
server.post("/google-auth", async (req, res) => {
  try {
    const { access_token } = req.body;

    // Verify that access_token exists and is a string
    if (!access_token || typeof access_token !== "string") {
      return res.status(400).json({
        error:
          "Invalid access token format. Please provide a valid Firebase ID token.",
      });
    }

    try {
      const decodedUser = await getAuth().verifyIdToken(access_token);
      let { email, name, picture } = decodedUser;

      // Update picture URL to get higher resolution
      picture = picture?.replace("s96-c", "s384-c") || "";

      // Find existing user
      let user = await User.findOne({ "personal_info.email": email }).select(
        "personal_info.fullname personal_info.username personal_info.profile_img google_auth"
      );

      if (user) {
        // Check if user was originally signed up with Google
        if (!user.google_auth) {
          return res.status(403).json({
            error:
              "This email was signed up without Google. Please log in with password to access the account",
          });
        }
      } else {
        // Create new user
        const username = await generateUsername(email);
        user = new User({
          personal_info: {
            fullname: name,
            email,
            profile_img: picture,
            username,
          },
          google_auth: true,
        });

        await user.save();
      }

      return res.status(200).json(formatDatatoSend(user));
    } catch (verificationError) {
      console.error("Token verification error:", verificationError);
      return res.status(401).json({
        error: "Invalid token. Please try logging in again.",
      });
    }
  } catch (err) {
    console.error("Server error during Google auth:", err);
    return res.status(500).json({
      error: "Authentication failed. Please try again later.",
    });
  }
});
server.post("/get-blog", (req, res) => {
  let { blog_id, draft, mode } = req.body;
  console.log(blog_id,mode)
  let incrementVal = mode != "edit" ? 1 : 0;
  Blog.findOneAndUpdate(
    { blog_id },
    { $inc: { "activity.total_reads": incrementVal } }
  )
    .populate(
      "author",
      "personal_info.fullname personal_info.username personal_info.profile_img"
    )
    .select("title des content banner activity publishedAt blog_id tags")
    .then((blog) => {
      User.findOneAndUpdate(
        { "personal_info.username": blog.author.personal_info.username },
        { $inc: { "account_info.total_reads": incrementVal } }
      ).catch((err) => {
        return res.status(500).json({ error: err.message });
      });
      if (blog.draft && !draft) {
        return res.status(500).json({ error: "you can not access draft blog" });
      }
      return res.status(200).json({ blog });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});

server.post("/like-blog", verifyJWT, (req, res) => {
  let user_id = req.user;
  let { _id, isLikedByUser } = req.body; // Fixed: match the case from frontend
  let incrementVal = !isLikedByUser ? 1 : -1;

  Blog.findOneAndUpdate(
    { _id },
    { $inc: { "activity.total_likes": incrementVal } }
  )
    .then((blog) => {
      if (!isLikedByUser) {
        let like = new Notification({
          type: "like",
          blog: _id,
          notification_for: blog.author,
          user: user_id,
        });

        like
          .save()
          .then((notification) => {
            return res.status(200).json({ liked_by_user: true });
          })
          .catch((err) => {
            return res.status(500).json({ error: err.message });
          });
      } else {
        // Handle unlike case
        return Notification.deleteOne({
          user: user_id,
          blog: _id,
          type: "like",
        })
          .then(() => {
            return res.status(200).json({ liked_by_user: false });
          })
          .catch((err) => {
            return res.status(500).json({ error: err.message });
          });
      }
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});

server.post("/isliked-by-user", verifyJWT, (req, res) => {
  let user_id = req.user;
  let { _id } = req.body;
  Notification.exists({ user: user_id, type: "like", blog: _id })
    .then((results) => {
      return res.status(200).json({ results });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});


//new comment 
server.post("/add-comment", verifyJWT, (req, res) => {
  let user_id = req.user;

  let { _id, comment, blog_author } = req.body;

  if (!comment.length) {
    return res
      .status(403)
      .json({ error: "write something to leave a comment" });
  }

  let commentObj = {
    blog_id: _id,
    blog_author,
    comment,
    commented_by: user_id,
  };

  // if(replying_to){
  //   commentObj.parent = replying_to;
  // }
  new Comment(commentObj)
    .save()
    .then( async (commentFile) => {
      let { comment, commentedAt, children } = commentFile;
      Blog.findOneAndUpdate(
        { _id },
        {
          $push: { "comments": commentFile._id },
          $inc: { "activity.total_comments": 1,"activity.total_parent_comments": 1 }
          // $inc: { "activity.total_comments": 1,"activity.total_parent_comments": replying_to ? 0 : 1 },
          
        }
      ).then((blog) => {
        console.log("New comment created");
      });


      let notificationObj = {
        // type: replying_to? "reply" : "comment",
        type: "comment",
        blog: _id,
        notification_for: blog_author,
        user: user_id,
        comment: commentFile._id,
      };

      // if(replying_to){
      //   notificationObj.replied_on_comment = replying_to;
      //   await Comment.findANdUpdate({_id:replying_to},{$push:{ children: commentFile._id } } )
      //   .then(replyingToCommentDoc => {
      //     notificationObj.notification_for = replyingToCommentDoc.commented_by
      //   })
      // }

      new Notification(notificationObj)
        .save()
        .then((notification) => console.log("new notification created"));

      return res
        .status(200)
        .json({ comment, commentedAt, _id: commentFile._id, user_id, children });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});

//get or retrive comments from backend to frontend

server.post("/get-blog-comment",(req,res)=>{
  let{blog_id, skip}=req.body;
let maxLimit = 5;
Comment.find({blog_id, isReply:false})
.populate("commented_by","personal_info.username personal_info.fullname personal_info.profile_img")
.skip(skip)
.limit(maxLimit)
.sort({'commentedAt':-1})
.then(comment=>{
  return res.status(200).json(comment);
})
.catch(err=>{
  return res.status(500).json({ error: err.message });

})

})
server.post("/change-password", verifyJWT, (req,res) => {
  let {currentPassword, newPassword} = req.body;
  if(!passwordRegex.test(currentPassword) || !passwordRegex.test(newPassword)){
    return res.status(403).json({
      error:
        "Password must be 6-20 characters long, include at least one uppercase letter, one lowercase letter, and one digit.",
    });

  }
    User.findOne({_id:req.user})
    .then((user)=>{
      if(user.google_auth){
        return res.status(403).json({error: "you have loged in using google, so not possible to chnage password"})
      }
  
      bcrypt.compare(currentPassword, user.personal_info.password,(err, result) => {
        if(err){
          return res.status(500).json({error: "some error occured please try again later"})
        }
  
        if(!result){
          return res.status(403).json({error: "Incorrect current password"})
        }
  
        bcrypt.hash(newPassword, 10, (err, hashed_Password) => {
  
          User.findOneAndUpdate({_id: req.user},{"personal_info.password": hashed_Password})
  
          .then((u) => {
            return res.status(200).json({status: 'password changed'})
          })
          .catch(err =>{
            return res.status(500).json({error: 'some error occured while changing password, try again later'})
          
          })
        })
      })
  
    })
    .catch(err =>{
      return res.status(500).json({error: 'user not found'})
    
    })
  }) 
  
server.post ("/update-profile-img", verifyJWT, (req,res) => {
  let { url } =req.body;
  User.findOneAndUpdate({_id: req.user}, {"personal_info.profile_img": url})
  .then(() => {
    return res.status(200).json({status: 'profile image has been changed'})
  })
  .catch(err =>{
    return res.status(500).json({error: 'some error occured while changing profile picture, try again later'})
  
  })
})

server.post("/update-profile", verifyJWT, (req,res) =>{
  let {username, bio, social_links } = req.body;

  let bioLimit = 150;

  if(username.length <3 ){
    return res.status(403).json({error: 'username atleast 4 letter'})

  }
  if(bio.length > bioLimit)
  {
    return res.status(500).json({error: `Bio must be within ${bioLimit} letters`})

  }

  let socialLinksArr =Object.keys(social_links);
  try{

    for(let i=0; i< socialLinksArr.length; i++){

      if(social_links[socialLinksArr[i]].length){

        let hostname = new URL(social_links[socialLinksArr[i]]).hostname;

        if(! hostname.includes(`${socialLinksArr[i]}.com`) && socialLinksArr[i] != 'website'){

          return res.status(403).json({error: `${socialLinksArr[i]} link is not validateHeaderName. you must enter a valid link`})

        }
      }
    }

  }catch(err){
    return res.status(500).json({error: 'Must provided full social link including http(s), try again later'})

  }


  let updateObj = {
    "personal_info.username" : username,
    "personal_info.bio" : bio,
    social_links
  }

  User.findOneAndUpdate({_id:req.user}, updateObj,{
    runValidators: true
  })
  .then(() =>{
    return res.status(200).json({username })
  })
  .catch( err => {
    if(err.code == 1100){
      return res.status(409).json({error : "username is already exist"})
    }
    return res.status(500).json({error : err.message})
  })
})


server.get("/new-notification", verifyJWT,(req,res) =>{
  let user_id = req.user;
  Notification.exists({notification_for: user_id, seen:false, user:{$ne:user_id}})
  .then(result =>{
    if(result){
      return res.status(200).json({new_notification_available: true}) 
    }else{
      return res.status(200).json({new_notification_available: false })
    }
  })
  .catch(err => {
    console.log(err.message);
    return res.status(500).json(err.message)
  })

})



server.post ( "/notification", verifyJWT, (req,res) => {
  let user_id = req.user;
  let {page, filter, deletedDocCount } = req.body

  let maxLimit = 10;

  let findQuery = {notification_for:user_id, user:{$ne: user_id}};

  let skipDocs = (page -1 ) * maxLimit;

  if(filter != 'all') {
    findQuery.type = filter;
  }
  if(deletedDocCount){
    skipDocs -= deletedDocCount;
  }
  Notification.find(findQuery)
  .skip(skipDocs)
  .limit(maxLimit)
  .populate("blog", "title blog_id")
  .populate("user", "personal_info.fullname personal_info.username personal_info.profile_img")
  .populate("comment", "comment")
  .populate("replied_on_comment", "comment")
  .populate("reply", "comment")
  .sort({createdAt:-1})
  .select("createdAt type seen reply")
  .then(notification =>{
    Notification.updateMany(findQuery, {seen:true})
    .skip(skipDocs)
    .limit(maxLimit)
    .then(() => console.log('notification seen'));
     return res.status(200).json({notification })

  })

  .catch(err => {
    console.log(err.message);
    return res.status(500).json(err.message)
  })


})

server.post("/all-notification-count", verifyJWT, (req,res) => {
  let user_id = req.user;
  let{ filter} = req.body;

  let findQuery = {notification_for:user_id, user:{$ne:user_id}}
  if(filter != 'all'){
    findQuery.type = filter;

  }

  Notification.countDocuments(findQuery)
  .then ( count => {
    return res.status(200).json({totalDocs: count })

  })

  .catch(err => {
    console.log(err.message);
    return res.status(500).json(err.message)
  })
})
//user written blogs
server.post("/user-written-blogs", verifyJWT,(req,res)=>{
  let user_id =req.user;
  let {page, draft, query, deletedDocCount} = req.body;
  let maxLimit = 2;
  let skipDocs =( page - 1 ) * maxLimit;
  if(deletedDocCount){
    skipDocs -= deletedDocCount;
  }
  Blog.find({author:user_id,draft, title:new RegExp(query, 'i') })
  .skip(skipDocs)
  .limit(maxLimit)
  .sort({publishedAt: -1})
  .select("title banner publishedAt blog_id activity des draft -_id")
  .then( blogs =>{
    return res.status(200).json({ blogs})
  })
  .catch( err => {
    return res.status(500).json ({error: err.message});
  })

})

server.post("/user-written-blogs-count", verifyJWT, (req,res) => {
  let user_id =req.user;
  let { draft, query} = req.body;
  Blog.countDocuments({author:user_id,draft, title:new RegExp(query, 'i') })
  .then (count =>{
    return res.status(200).json({totalDocs: count})
  })
  .catch (err => {
    console.log(err.message)
    return res.status(500).json({error:err.message})
  })


})

server.post("/delete-blog", verifyJWT, async (req, res) => {
  try {
    let user_id = req.user;
    let { blog_id } = req.body;
    
    // First verify the blog exists and belongs to the user
    const blog = await Blog.findOne({ blog_id, author: user_id });
    
    if (!blog) {
      return res.status(404).json({ error: "Blog not found or you don't have permission to delete it" });
    }
    
    // Delete the blog
    await Blog.findOneAndDelete({ _id: blog._id });
    
    // Run all these operations in parallel using Promise.all without individual .then()
    await Promise.all([
      // Delete associated notifications
      Notification.deleteMany({ blog: blog._id }),
      
      // Delete associated comments
      Comment.deleteMany({ blog: blog._id }),
      
      // Update user document
      User.findOneAndUpdate(
        { _id: user_id },
        { 
          $pull: { blogs: blog_id }, 
          $inc: { "account_info.total_posts": -1 }
        }
      )
    ]);
    
    console.log("Blog and related data deleted successfully");
    
    // Only send response after all operations complete
    return res.status(200).json({ status: 'done', deletedBlogId: blog_id });
  } catch (err) {
    console.error("Error deleting blog:", err);
    return res.status(500).json({ error: err.message });
  }
});

// Start server
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Clean up on exit
// process.on('SIGINT', () => {
//   db.close((err) => {
//     if (err) {
//       console.error('Error closing the database:', err);
//     } else {
//       console.log('Database connection closed.');
//     }
//     process.exit(0);
//   });
// });
