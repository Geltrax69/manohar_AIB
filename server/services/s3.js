const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

// Initialize S3 client
const client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: process.env.AWS_ACCESS_KEY_ID ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  } : undefined
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'linguadev-user-files';

/**
 * Upload file to S3
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} fileName - Original file name
 * @param {string} userId - User ID
 * @param {string} contentType - MIME type
 * @returns {Promise<string>} - S3 key
 */
async function uploadFile(fileBuffer, fileName, userId, contentType = 'application/octet-stream') {
  try {
    const key = `users/${userId}/${Date.now()}-${fileName}`;
    
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
      Metadata: {
        userId: userId,
        originalName: fileName,
        uploadDate: new Date().toISOString()
      }
    });

    await client.send(command);
    return key;
  } catch (error) {
    console.error('S3 upload error:', error);
    throw error;
  }
}

/**
 * Get presigned URL for file download
 * @param {string} key - S3 key
 * @param {number} expiresIn - URL expiration in seconds (default: 1 hour)
 * @returns {Promise<string>} - Presigned URL
 */
async function getFileUrl(key, expiresIn = 3600) {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key
    });

    const url = await getSignedUrl(client, command, { expiresIn });
    return url;
  } catch (error) {
    console.error('S3 get URL error:', error);
    throw error;
  }
}

/**
 * Delete file from S3
 * @param {string} key - S3 key
 * @returns {Promise<void>}
 */
async function deleteFile(key) {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key
    });

    await client.send(command);
  } catch (error) {
    console.error('S3 delete error:', error);
    throw error;
  }
}

/**
 * Upload user code/project to S3
 * @param {string} code - Code content
 * @param {string} userId - User ID
 * @param {string} projectName - Project name
 * @returns {Promise<string>} - S3 key
 */
async function uploadCode(code, userId, projectName) {
  try {
    const key = `users/${userId}/projects/${projectName}-${Date.now()}.txt`;
    
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: code,
      ContentType: 'text/plain',
      Metadata: {
        userId: userId,
        projectName: projectName,
        uploadDate: new Date().toISOString()
      }
    });

    await client.send(command);
    return key;
  } catch (error) {
    console.error('S3 code upload error:', error);
    throw error;
  }
}

/**
 * Check if AWS S3 is configured
 * @returns {boolean}
 */
function isS3Configured() {
  return !!(process.env.AWS_REGION && (process.env.AWS_ACCESS_KEY_ID || process.env.AWS_PROFILE) && process.env.AWS_S3_BUCKET);
}

module.exports = { 
  uploadFile,
  getFileUrl,
  deleteFile,
  uploadCode,
  isS3Configured
};
