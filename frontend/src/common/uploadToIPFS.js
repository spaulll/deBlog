// uploadToIPFS.js

const getImgURL = async (img) => {
  try {
    const formData = new FormData();
    formData.append('image', img);
    
    const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/upload-img-return-URL`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });
    
    const result = await response.json();
    
    if (result.success && result.file && result.file.url) {
      return result.file.url;
    } else {
      throw new Error(result.message || "Invalid response format from server");
    }
  } catch (error) {
    console.error("Upload error:", error);
    throw new Error(error.message || "File upload failed!");
  }
};

export default getImgURL;