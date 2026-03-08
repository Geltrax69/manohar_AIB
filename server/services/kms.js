const { KMSClient, EncryptCommand, DecryptCommand, GenerateDataKeyCommand } = require("@aws-sdk/client-kms");

// Initialize KMS client
const client = new KMSClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: process.env.AWS_ACCESS_KEY_ID ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  } : undefined
});

const KMS_KEY_ID = process.env.KMS_KEY_ID;

/**
 * Encrypt data using KMS
 * @param {string|Buffer} plaintext - Data to encrypt
 * @returns {Promise<string>} - Base64 encoded encrypted data
 */
async function encrypt(plaintext) {
  if (!KMS_KEY_ID) {
    console.warn('KMS not configured, returning plaintext');
    return Buffer.from(plaintext).toString('base64');
  }

  try {
    const command = new EncryptCommand({
      KeyId: KMS_KEY_ID,
      Plaintext: Buffer.from(plaintext)
    });

    const response = await client.send(command);
    return Buffer.from(response.CiphertextBlob).toString('base64');
  } catch (error) {
    console.error('KMS encryption error:', error);
    throw error;
  }
}

/**
 * Decrypt data using KMS
 * @param {string} ciphertext - Base64 encoded encrypted data
 * @returns {Promise<string>} - Decrypted data
 */
async function decrypt(ciphertext) {
  if (!KMS_KEY_ID) {
    console.warn('KMS not configured, returning ciphertext');
    return Buffer.from(ciphertext, 'base64').toString();
  }

  try {
    const command = new DecryptCommand({
      CiphertextBlob: Buffer.from(ciphertext, 'base64')
    });

    const response = await client.send(command);
    return Buffer.from(response.Plaintext).toString();
  } catch (error) {
    console.error('KMS decryption error:', error);
    throw error;
  }
}

/**
 * Generate data encryption key
 * @returns {Promise<object>} - {plaintext, ciphertext}
 */
async function generateDataKey() {
  if (!KMS_KEY_ID) {
    throw new Error('KMS not configured');
  }

  try {
    const command = new GenerateDataKeyCommand({
      KeyId: KMS_KEY_ID,
      KeySpec: 'AES_256'
    });

    const response = await client.send(command);

    return {
      plaintext: Buffer.from(response.Plaintext).toString('base64'),
      ciphertext: Buffer.from(response.CiphertextBlob).toString('base64')
    };
  } catch (error) {
    console.error('Generate data key error:', error);
    throw error;
  }
}

/**
 * Encrypt sensitive user data
 * @param {object} data - Data to encrypt
 * @returns {Promise<string>} - Encrypted data
 */
async function encryptUserData(data) {
  const jsonString = JSON.stringify(data);
  return encrypt(jsonString);
}

/**
 * Decrypt sensitive user data
 * @param {string} encryptedData - Encrypted data
 * @returns {Promise<object>} - Decrypted data
 */
async function decryptUserData(encryptedData) {
  const jsonString = await decrypt(encryptedData);
  return JSON.parse(jsonString);
}

/**
 * Check if KMS is configured
 * @returns {boolean}
 */
function isKMSConfigured() {
  return !!(KMS_KEY_ID && process.env.AWS_REGION && (process.env.AWS_ACCESS_KEY_ID || process.env.AWS_PROFILE));
}

module.exports = {
  encrypt,
  decrypt,
  generateDataKey,
  encryptUserData,
  decryptUserData,
  isKMSConfigured
};
