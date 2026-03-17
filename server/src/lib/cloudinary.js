const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo',
  api_key: process.env.CLOUDINARY_API_KEY || 'demo',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'demo',
});

const uploadToCloudinary = (fileBuffer, fileType) => {
  return new Promise((resolve, reject) => {
    const resourceType = fileType.startsWith('video') ? 'video' : (fileType === 'application/pdf' ? 'raw' : 'image');
    
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: resourceType, folder: 'rentshield' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    
    uploadStream.end(fileBuffer);
  });
};

const deleteFromCloudinary = (publicId, resourceType = 'image') => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, { resource_type: resourceType }, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
  });
};

module.exports = { cloudinary, uploadToCloudinary, deleteFromCloudinary };
