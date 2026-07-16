const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { GetObjectCommand } = require('@aws-sdk/client-s3');
require('dotenv').config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Upload a file to S3
const uploadFile = async (file, folder = 'uploads') => {
  try {
    const fileName = `${folder}/${Date.now()}-${file.originalname.replace(/\s/g, '-')}`;

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await s3Client.send(command);

    const fileUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
    return { success: true, url: fileUrl, key: fileName };
  } catch (error) {
    console.error('uploadFile error:', error);
    return { success: false, error };
  }
};

// Delete a file from S3
const deleteFile = async (key) => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
    });
    await s3Client.send(command);
    return { success: true };
  } catch (error) {
    console.error('deleteFile error:', error);
    return { success: false, error };
  }
};

module.exports = { uploadFile, deleteFile };