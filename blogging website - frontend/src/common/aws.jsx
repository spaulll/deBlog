
const getImgURL = async (img) => {
    try {
      // Prepare the form data
      const formData = new FormData();
      formData.append('image', img);
  
      // Upload the image to the backend
      const uploadResponse = await fetch('http://localhost:3000/get-upload-image', {
        method: 'POST',
        body: formData,
      });
  
      if (uploadResponse.ok) {
        const { id } = await uploadResponse.json();
        console.log('Image uploaded successfully. ID:', id);
        const imageUrl= `http://localhost:3000/image/${id}`;
        return imageUrl;
        // Retrieve the image from the backend using the returned ID
        // const retrieveResponse = await fetch(`http://localhost:3000/image/${id}`);
      } else {
        console.error('Failed to upload image:', uploadResponse.statusText);
      }
    } catch (error) {
      console.error('Error during image upload or retrieval:', error);
    }
  };
export default getImgURL;