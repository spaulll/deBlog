//importing tools

import Embed from "@editorjs/embed";
import List from "@editorjs/list";
import Image from "@editorjs/image";
import Header from "@editorjs/header";
import Quote from "@editorjs/quote";
import Marker from "@editorjs/marker";
import InlineCode from "@editorjs/inline-code";

const uploadImageByURL = (e) => {
  let link = new Promise((resolve, reject) => {
    try {
      resolve(e);
    } catch (err) {
      reject(err);
    }
  });
  return link.then((url) => {
    return {
      success: 1,
      file: { url },
    };
  });
};

export const tools = {
  embed: Embed,
  list: { 
    class: List, 
    inlineToolbar: true 
  },
  image: {
    class: Image,
    config: {
      endpoints: {
        byFile: `${import.meta.env.VITE_SERVER_URL}/upload-img-return-URL`,
      },
      uploader: {
        uploadByUrl: uploadImageByURL,
        uploadByFile: (file) => {
          return new Promise((resolve, reject) => {
            const formData = new FormData();
            formData.append("image", file);

            fetch(`${import.meta.env.VITE_SERVER_URL}/upload-img-return-URL`, {
              method: "POST",
              body: formData,
              credentials: "include",
            })
              .then((response) => response.json())
              .then((result) => {
                if (result.success && result.file && result.file.url) {
                  resolve({
                    success: 1,
                    file: { url: result.file.url },
                  });
                } else {
                  reject({
                    success: 0,
                    message: "Invalid response format from server",
                  });
                }
              })
              .catch((error) => {
                console.error("Upload error:", error);
                reject({
                  success: 0,
                  message: "File upload failed!",
                });
              });
          });
        },
      },
    },
  },
  header: {
    class: Header,
    config: {
      placeholder: "Type Heading...",
      levels: [2, 3],
      defaultLevel: 2,
    },
  },
  quote: { 
    class: Quote, 
    inlineToolbar: true 
  },
  marker: Marker,
  inlineCode: InlineCode,
};
