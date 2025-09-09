const IMGBB_API_KEY = '2e2cff7aac10d311a256c5239f0ba9c3'; // Replace with your actual ImgBB API key
const IMGBB_UPLOAD_URL = 'https://api.imgbb.com/1/upload';

export const uploadToImgBB = async (file: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('key', IMGBB_API_KEY);

    const response = await fetch(IMGBB_UPLOAD_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    const data = await response.json();
    
    if (data.success) {
      return data.data.url;
    } else {
      throw new Error('Image upload failed');
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

export const uploadMultipleImages = async (files: File[]): Promise<string[]> => {
  try {
    const uploadPromises = files.map(file => uploadToImgBB(file));
    const imageUrls = await Promise.all(uploadPromises);
    return imageUrls;
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    throw error;
  }
};