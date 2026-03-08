const {
  CognitoIdentityProviderClient,
  SignUpCommand,
  InitiateAuthCommand,
  GetUserCommand,
  AdminSetUserPasswordCommand,
  AdminCreateUserCommand,
  AdminDeleteUserCommand
} = require("@aws-sdk/client-cognito-identity-provider");

// Initialize Cognito client
const client = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: process.env.AWS_ACCESS_KEY_ID ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  } : undefined
});

const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;
const CLIENT_ID = process.env.COGNITO_CLIENT_ID;

/**
 * Register new user with Cognito
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {object} attributes - User attributes
 * @returns {Promise<object>} - User data
 */
async function registerUser(email, password, attributes = {}) {
  if (!USER_POOL_ID || !CLIENT_ID) {
    throw new Error('Cognito not configured');
  }

  try {
    const userAttributes = [
      { Name: 'email', Value: email },
      ...Object.keys(attributes).map(key => ({
        Name: `custom:${key}`,
        Value: String(attributes[key])
      }))
    ];

    const command = new SignUpCommand({
      ClientId: CLIENT_ID,
      Username: email,
      Password: password,
      UserAttributes: userAttributes
    });

    const response = await client.send(command);

    return {
      userId: response.UserSub,
      email,
      confirmed: response.UserConfirmed
    };
  } catch (error) {
    console.error('Cognito registration error:', error);
    throw error;
  }
}

/**
 * Authenticate user with Cognito
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<object>} - Authentication tokens
 */
async function authenticateUser(email, password) {
  if (!USER_POOL_ID || !CLIENT_ID) {
    throw new Error('Cognito not configured');
  }

  try {
    const command = new InitiateAuthCommand({
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: CLIENT_ID,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password
      }
    });

    const response = await client.send(command);

    return {
      accessToken: response.AuthenticationResult.AccessToken,
      idToken: response.AuthenticationResult.IdToken,
      refreshToken: response.AuthenticationResult.RefreshToken,
      expiresIn: response.AuthenticationResult.ExpiresIn
    };
  } catch (error) {
    console.error('Cognito authentication error:', error);
    throw error;
  }
}

/**
 * Get user info from access token
 * @param {string} accessToken - Access token
 * @returns {Promise<object>} - User info
 */
async function getUserInfo(accessToken) {
  if (!USER_POOL_ID || !CLIENT_ID) {
    throw new Error('Cognito not configured');
  }

  try {
    const command = new GetUserCommand({
      AccessToken: accessToken
    });

    const response = await client.send(command);

    const attributes = {};
    response.UserAttributes.forEach(attr => {
      attributes[attr.Name] = attr.Value;
    });

    return {
      username: response.Username,
      attributes
    };
  } catch (error) {
    console.error('Get user info error:', error);
    throw error;
  }
}

/**
 * Admin create user (for testing/admin purposes)
 * @param {string} email - User email
 * @param {string} temporaryPassword - Temporary password
 * @param {object} attributes - User attributes
 * @returns {Promise<object>} - User data
 */
async function adminCreateUser(email, temporaryPassword, attributes = {}) {
  if (!USER_POOL_ID) {
    throw new Error('Cognito not configured');
  }

  try {
    const userAttributes = [
      { Name: 'email', Value: email },
      { Name: 'email_verified', Value: 'true' },
      ...Object.keys(attributes).map(key => ({
        Name: `custom:${key}`,
        Value: String(attributes[key])
      }))
    ];

    const command = new AdminCreateUserCommand({
      UserPoolId: USER_POOL_ID,
      Username: email,
      TemporaryPassword: temporaryPassword,
      UserAttributes: userAttributes,
      MessageAction: 'SUPPRESS' // Don't send welcome email
    });

    const response = await client.send(command);

    return {
      username: response.User.Username,
      status: response.User.UserStatus
    };
  } catch (error) {
    console.error('Admin create user error:', error);
    throw error;
  }
}

/**
 * Check if Cognito is configured
 * @returns {boolean}
 */
function isCognitoConfigured() {
  return !!(USER_POOL_ID && CLIENT_ID && process.env.AWS_REGION);
}

module.exports = {
  registerUser,
  authenticateUser,
  getUserInfo,
  adminCreateUser,
  isCognitoConfigured
};
