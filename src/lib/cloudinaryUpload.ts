// Client-side Cloudinary upload using unsigned upload preset
export async function uploadToCloudinary(
  file: string | File,
  folder: string = 'park-bbq-kitchen'
): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  
  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary configuration missing');
  }

  try {
    if (typeof file === 'string') {
      // Base64 string (signature) - convert to blob
      const response = await fetch(file);
      const blob = await response.blob();
      return await uploadFileToCloudinary(blob, folder, cloudName, uploadPreset);
    } else {
      // File object (kitchen image)
      return await uploadFileToCloudinary(file, folder, cloudName, uploadPreset);
    }
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload to Cloudinary');
  }
}

async function uploadFileToCloudinary(
  file: Blob | File,
  folder: string,
  cloudName: string,
  uploadPreset: string
): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error?.message || 'Upload failed');
  }

  return data.secure_url;
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
  // Note: Deletion requires API key and secret, so this should be done server-side
  // For now, we'll implement a placeholder
  console.warn('Cloudinary deletion requires server-side implementation');
  throw new Error('Cloudinary deletion requires server-side API');
}
