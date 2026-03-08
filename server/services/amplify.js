const { AmplifyClient, CreateAppCommand, CreateBranchCommand, StartDeploymentCommand } = require("@aws-sdk/client-amplify");

// Initialize Amplify client
const client = new AmplifyClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: process.env.AWS_ACCESS_KEY_ID ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  } : undefined
});

/**
 * Deploy user project to AWS Amplify
 * @param {string} userId - User ID
 * @param {string} projectName - Project name
 * @param {string} repositoryUrl - Git repository URL
 * @returns {Promise<object>} - Deployment info
 */
async function deployProject(userId, projectName, repositoryUrl) {
  try {
    // Create Amplify app
    const createAppCommand = new CreateAppCommand({
      name: `${projectName}-${userId}`,
      repository: repositoryUrl,
      platform: 'WEB',
      environmentVariables: {
        USER_ID: userId,
        PROJECT_NAME: projectName
      }
    });

    const appResponse = await client.send(createAppCommand);
    const appId = appResponse.app.appId;

    // Create main branch
    const createBranchCommand = new CreateBranchCommand({
      appId: appId,
      branchName: 'main',
      enableAutoBuild: true
    });

    await client.send(createBranchCommand);

    // Start deployment
    const startDeploymentCommand = new StartDeploymentCommand({
      appId: appId,
      branchName: 'main'
    });

    const deploymentResponse = await client.send(startDeploymentCommand);

    return {
      appId,
      deploymentId: deploymentResponse.jobSummary.jobId,
      url: `https://main.${appId}.amplifyapp.com`,
      status: 'DEPLOYING'
    };
  } catch (error) {
    console.error('Amplify deployment error:', error);
    throw error;
  }
}

/**
 * Deploy static site from code
 * @param {string} userId - User ID
 * @param {string} projectName - Project name
 * @param {object} files - Project files {filename: content}
 * @returns {Promise<object>} - Deployment info
 */
async function deployStaticSite(userId, projectName, files) {
  try {
    // For static sites, we'll use S3 + CloudFront instead
    // This is a placeholder for the actual implementation
    
    return {
      message: 'Static site deployment requires S3 bucket and CloudFront distribution',
      recommendation: 'Use deployToS3AndCloudFront function instead'
    };
  } catch (error) {
    console.error('Static site deployment error:', error);
    throw error;
  }
}

/**
 * Get deployment status
 * @param {string} appId - Amplify app ID
 * @param {string} branchName - Branch name
 * @returns {Promise<object>} - Deployment status
 */
async function getDeploymentStatus(appId, branchName = 'main') {
  try {
    // This would use GetJobCommand to check deployment status
    // Placeholder implementation
    return {
      status: 'PENDING',
      message: 'Use AWS Console to check deployment status'
    };
  } catch (error) {
    console.error('Get deployment status error:', error);
    throw error;
  }
}

/**
 * Check if AWS Amplify is configured
 * @returns {boolean}
 */
function isAmplifyConfigured() {
  return !!(process.env.AWS_REGION && (process.env.AWS_ACCESS_KEY_ID || process.env.AWS_PROFILE));
}

module.exports = {
  deployProject,
  deployStaticSite,
  getDeploymentStatus,
  isAmplifyConfigured
};
