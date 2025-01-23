const getImgURL = async (img) => {
  try {
    // Prepare the form data
    const formData = new FormData();
    formData.append('image', img);

    // Upload the image to the backend
    const uploadResponse = await fetch(`${import.meta.env.VITE_SERVER_URL}/get-upload-image`, {
      method: 'POST',
      body: formData,
    });

    if (uploadResponse.ok) {
      const { id } = await uploadResponse.json();
      console.log('Image uploaded successfully. ID:', id);
      const imageUrl = `${import.meta.env.VITE_SERVER_URL}/${id}`;
      return imageUrl;
    } else {
      console.error('Failed to upload image:', uploadResponse.statusText);
    }
  } catch (error) {
    console.error('Error during image upload or retrieval:', error);
  }
};
export default getImgURL;