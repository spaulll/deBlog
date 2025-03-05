import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createAuth } from "thirdweb/auth";
import { privateKeyToAccount } from "thirdweb/wallets";
import { thirdwebClient } from "./thirdwebClient.js";

const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) throw new Error("PRIVATE_KEY is not defined");

const domain = process.env.DOMAIN;
if (!domain) throw new Error("DOMAIN is not defined");

const port = process.env.PORT || 3000;

const app = express();
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

    return res.send(true);
});

app.post("/logout", (req, res) => {
    res.clearCookie("jwt");
    return res.send(true);
});

app.listen(port, () => {
    console.log(`⚡ Auth server listening on port ${port}....`);
});