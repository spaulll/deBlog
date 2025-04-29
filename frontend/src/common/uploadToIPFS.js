// uploadToIPFS.js

const compressAndConvertToJPEG = (file, quality = 0.8, maxSize = 1024) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target.result;
    };

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(new File([blob], 'compressed.jpg', { type: 'image/jpeg' }));
          } else {
            reject(new Error("Compression failed"));
          }
        },
        'image/jpeg',
        quality
      );
    };

    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

const getImgURL = async (img) => {
  try {
    const compressedImg = await compressAndConvertToJPEG(img);

    const formData = new FormData();
    formData.append('image', compressedImg);

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
