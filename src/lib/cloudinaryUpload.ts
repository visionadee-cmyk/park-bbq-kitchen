import cloudinary from './cloudinary';

export async function uploadToCloudinary(
  file: string | File,
  folder: string = 'park-bbq-kitchen'
): Promise<string> {
  try {
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    
    if (typeof file === 'string') {
      // Base64 string (signature)
      const uploadResult = await cloudinary.uploader.upload(file, {
        folder,
        upload_preset: uploadPreset,
        resource_type: 'image',
      });
      return uploadResult.secure_url;
    } else {
      // File object (kitchen image)
      return new Promise((resolve, reject) => {
        const arrayBuffer = file.arrayBuffer();
        arrayBuffer.then(buffer => {
          const bufferData = Buffer.from(buffer);
          
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder,
              upload_preset: uploadPreset,
              resource_type: 'image',
            },
            (error, result) => {
              if (error) {
                reject(error);
              } else if (result) {
                resolve(result.secure_url);
              } else {
                reject(new Error('Upload failed'));
              }
            }
          );
          
          uploadStream.end(bufferData);
        });
      });
    }
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload to Cloudinary');
  }
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete from Cloudinary');
  }
}
