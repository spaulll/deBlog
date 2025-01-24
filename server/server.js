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
import db from "./Schema/imgdb.js";
const require = createRequire(import.meta.url);
const serviceAccount = require("./react-js-blog-website-c3587-firebase-adminsdk-yrei8-8bdd095672.json");

// Import Schema
import User from "./Schema/User.js";
import imgdb from "./Schema/imgdb.js";
import { verify } from "crypto";
import Blog from "./Schema/Blog.js";

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
server.post("/get-upload-image", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  const { buffer, originalname } = req.file;
  const insertQuery = `INSERT INTO images (filename, data) VALUES (?, ?)`;

  imgdb.run(insertQuery, [originalname, buffer], function (err) {
    if (err) {
      console.error("Error saving image to the database:", err);
      res.status(500).send("Failed to save image.");
    } else {
      res.status(200).json({ id: this.lastID }); // Return the generated ID
    }
  });
});

//upload and return
server.post("/upload-img-return-URL", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: 0, message: "No file uploaded." });
  }

  const { buffer, originalname } = req.file;
  const insertQuery = `INSERT INTO images (filename, data) VALUES (?, ?)`;

  imgdb.run(insertQuery, [originalname, buffer], function (err) {
    if (err) {
      console.error("Error saving image to the database:", err);
      return res
        .status(500)
        .json({ success: 0, message: "Failed to save image." });
    }

    // Return a URL to retrieve the uploaded image by its ID
    const imageId = this.lastID; // Get the auto-generated ID of the inserted image
    const imageUrl = `http://localhost:3000/image/${imageId}`;
    res.status(200).json({
      success: 1,
      file: { url: imageUrl },
    });
  });
});

// Route to retrieve an image by ID

server.get("/image/:id", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const imageId = req.params.id;
  const selectQuery = `SELECT filename, data FROM images WHERE id = ?`;

  imgdb.get(selectQuery, [imageId], (err, row) => {
    if (err) {
      console.error("Error retrieving image from database:", err);
      return res.status(500).send("Failed to retrieve image.");
    }
    if (!row) {
      return res.status(404).send("Image not found.");
    } else {
      res.set("Content-Type", "image/jpeg"); // Adjust MIME type if needed
      res.send(row.data);
    }
  });
});

// Route to list all images

server.get("/images", (req, res) => {
  const selectQuery = `SELECT id, filename FROM images`;

  db.all(selectQuery, (err, rows) => {
    if (err) {
      console.error("Error retrieving images:", err);
      res.status(500).send("Failed to retrieve images.");
    } else {
      res.status(200).json(rows);
    }
  });
});

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
  let { tag, query, page, author } = req.body;
  let findQuery;
  if (tag) {
    findQuery = { tags: tag, draft: false };
  } else if (query) {
    findQuery = { draft: false, title: new RegExp(query, "i") };
  }else if (author) {
    findQuery = { author, draft: false};
  }

  let maxLimit = 2;
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
      "personal_info.username": new RegExp(query, "i") 
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
      details: err.message
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
  }else if (author) {
    findQuery = { author, draft: false};
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
  User.findOne({"personal_info.username": username})
  .select("-personal_info.password -google_auth -updateAt -blogs")

    .then(user => {
      return res.status(200).json({ user});
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
  let { title, des, banner, tags, content, draft } = req.body;
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
    title
      .replace(/[^a-zA-Z0-9]/g, " ")
      .replace(/\s+/g, "-")
      .trim() + nanoid();
  // return res.status(200).json({ status: "good to go" });
  // return res.status(200).json(req.body);
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
