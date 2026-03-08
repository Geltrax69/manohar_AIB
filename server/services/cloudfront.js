const { CloudFrontClient, CreateInvalidationCommand, GetDistributionCommand } = require("@aws-sdk/client-cloudfront");

// Initialize CloudFront client
const client = new CloudFrontClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: process.env.AWS_ACCESS_KEY_ID ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  } : undefined
});

const DISTRIBUTION_ID = process.env.CLOUDFRONT_DISTRIBUTION_ID;

/**
 * Invalidate CloudFront cache
 * @param {array} paths - Array of paths to invalidate (e.g., ['/index.html', '/assets/*'])
 * @returns {Promise<object>} - Invalidation info
 */
async function invalidateCache(paths = ['/*']) {
  if (!DISTRIBUTION_ID) {
    console.warn('CloudFront distribution ID not configured');
    return { message: 'CloudFront not configured' };
  }

  try {
    const command = new CreateInvalidationCommand({
      DistributionId: DISTRIBUTION_ID,
      InvalidationBatch: {
        CallerReference: `invalidation-${Date.now()}`,
        Paths: {
          Quantity: paths.length,
          Items: paths
        }
      }
    });

    const response = await client.send(command);
    
    return {
      invalidationId: response.Invalidation.Id,
      status: response.Invalidation.Status,
      createTime: response.Invalidation.CreateTime
    };
  } catch (error) {
    console.error('CloudFront invalidation error:', error);
    throw error;
  }
}

/**
 * Get distribution info
 * @returns {Promise<object>} - Distribution info
 */
async function getDistributionInfo() {
  if (!DISTRIBUTION_ID) {
    return { message: 'CloudFront not configured' };
  }

  try {
    const command = new GetDistributionCommand({
      Id: DISTRIBUTION_ID
    });

    const response = await client.send(command);
    
    return {
      id: response.Distribution.Id,
      domainName: response.Distribution.DomainName,
      status: response.Distribution.Status,
      enabled: response.Distribution.DistributionConfig.Enabled
    };
  } catch (error) {
    console.error('Get distribution error:', error);
    throw error;
  }
}

/**
 * Generate CloudFront signed URL for private content
 * @param {string} url - Content URL
 * @param {number} expiresIn - Expiration time in seconds
 * @returns {string} - Signed URL
 */
function generateSignedUrl(url, expiresIn = 3600) {
  // This requires CloudFront key pair
  // Placeholder implementation
  console.warn('CloudFront signed URLs require key pair configuration');
  return url;
}

/**
 * Check if CloudFront is configured
 * @returns {boolean}
 */
function isCloudFrontConfigured() {
  return !!(DISTRIBUTION_ID && process.env.AWS_REGION && (process.env.AWS_ACCESS_KEY_ID || process.env.AWS_PROFILE));
}

/**
 * Get CDN URL for asset
 * @param {string} assetPath - Asset path
 * @returns {string} - CDN URL
 */
function getCDNUrl(assetPath) {
  if (!DISTRIBUTION_ID) {
    return assetPath; // Return original path if CloudFront not configured
  }

  const distributionDomain = process.env.CLOUDFRONT_DOMAIN || `${DISTRIBUTION_ID}.cloudfront.net`;
  return `https://${distributionDomain}${assetPath.startsWith('/') ? '' : '/'}${assetPath}`;
}

module.exports = {
  invalidateCache,
  getDistributionInfo,
  generateSignedUrl,
  getCDNUrl,
  isCloudFrontConfigured
};
