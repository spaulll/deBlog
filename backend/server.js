import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createAuth } from "thirdweb/auth";
import { privateKeyToAccount } from "thirdweb/wallets";
import { thirdwebClient } from "./thirdwebClient.js";
import multer from "multer";
import { ThirdwebStorage } from "@thirdweb-dev/storage";
import { File } from "fetch-blob/file.js";



const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) throw new Error("PRIVATE_KEY is not defined");

const domain = process.env.DOMAIN;
if (!domain) throw new Error("DOMAIN is not defined");

const thirdwebSecretKey = process.env.THIRDWEB_SECRET_KEY;
if (!thirdwebSecretKey) throw new Error("THIRDWEB_SECRET_KEY is not defined");

console.log("DOMAIN: ", domain);
const port = process.env.PORT || 3000;

const app = express();
const storage = multer.memoryStorage();
const upload = multer({ storage });

app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin: domain,
        credentials: true,
    })
);

const thirdwebAuth = createAuth({
    domain: domain,
    client: thirdwebClient,
    adminAccount: privateKeyToAccount({
        client: thirdwebClient,
        privateKey: privateKey,
    }),
});

app.get("/", (req, res) => {
    return res.send("Auth server is live");
});

app.get("/login", async (req, res) => {
    const address = req.query.address;
    const chainId = req.query.chainId;

    if (typeof address !== "string") {
        return res.status(400).send("Address is required");
    }

    return res.send(
        await thirdwebAuth.generatePayload({
            address,
            chainId: chainId ? parseInt(chainId) : undefined,
        })
    );
});

app.post("/login", async (req, res) => {
    const payload = req.body;

    const verifiedPayload = await thirdwebAuth.verifyPayload(payload);

    if (verifiedPayload.valid) {
        const jwt = await thirdwebAuth.generateJWT({
            payload: verifiedPayload.payload,
        });
        res.cookie("jwt", jwt);
        return res.status(200).send({ token: jwt });
    }

    res.status(400).send("Failed to login");
});

app.get("/isLoggedIn", async (req, res) => {
    const jwt = req.cookies?.jwt;

    if (!jwt) {
        return res.send(false);
    }

    console.log("Received JWT", jwt);
    const authResult = await thirdwebAuth.verifyJWT({ jwt });

    if (!authResult.valid) {
        return res.send(false);
    }
    console.log("Verified JWT", authResult);
    return res.send(true);
});

app.post("/logout", (req, res) => {
    res.clearCookie("jwt");
    return res.send(true);
});

app.post("/upload-img-return-URL", upload.single("image"), async (req, res) => {
    try {
        // Step 1: Authenticate the user
        const jwt = req.cookies?.jwt;
        if (!jwt) {
            console.log("No JWT found in cookies");
            return res.status(401).json({ success: 0, message: "Unauthorized" });
        }
        const authResult = await thirdwebAuth.verifyJWT({ jwt });
        if (!authResult.valid) {
            console.log("Invalid JWT");
            return res.status(401).json({ success: 0, message: "Unauthorized" });
        }
        
        // Step 2: Validate the image
        if (!req.file) {
            console.log("No file uploaded");
            return res.status(400).json({ success: 0, message: "No file uploaded." });
        }
        const { buffer, originalname, mimetype } = req.file;

        // Step 3: Upload the image to IPFS using thirdweb
        const storage = new ThirdwebStorage({
            secretKey: thirdwebSecretKey,
        });

        // Method 1: Direct upload using the buffer
        const ipfsUri = await storage.upload(buffer, {
            name: originalname,
            type: mimetype
        });
        
        // If Method 1 doesn't work, try Method 2
        // const blob = new Blob([buffer], { type: mimetype });
        // const file = new File([blob], originalname, { type: mimetype });
        // const ipfsUri = await storage.upload(file);
        
        console.log("IPFS URI:", ipfsUri);

        // Resolve the IPFS URI to a public gateway URL.
        const imageUrl = storage.resolveScheme(ipfsUri);
        console.log("Image URL:", imageUrl);

        return res.status(200).json({
            success: 1,
            message: "Image uploaded successfully.",
            file: { url: imageUrl },
        });
    } catch (err) {
        console.error("Error processing image upload:", err);
        return res.status(500).json({ success: 0, message: "Internal Server Error." });
    }
});

app.listen(port, () => {
    console.log(`⚡ Auth server listening on port ${port}....`);
});