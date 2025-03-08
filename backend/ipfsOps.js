import { ThirdwebStorage } from "@thirdweb-dev/storage";

const storage = new ThirdwebStorage({
    secretKey: process.env.THIRDWEB_SECRET_KEY,
});

const uploadToIPFS = async (file) => {
    const ipfsUri = await storage.upload(file);
    return ipfsUri;
};

const getIPFSUrl = async (ipfsUri) => {
    const url = storage.resolveScheme(ipfsUri);
    return url;
};

export { uploadToIPFS, getIPFSUrl };