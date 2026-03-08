const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { 
  DynamoDBDocumentClient, 
  PutCommand, 
  GetCommand, 
  UpdateCommand, 
  QueryCommand,
  ScanCommand,
  DeleteCommand 
} = require("@aws-sdk/lib-dynamodb");

// Initialize DynamoDB client
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: process.env.AWS_ACCESS_KEY_ID ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  } : undefined
});

const docClient = DynamoDBDocumentClient.from(client);

// Table names
const TABLES = {
  USERS: process.env.DYNAMODB_USERS_TABLE || 'linguadev-users',
  PROGRESS: process.env.DYNAMODB_PROGRESS_TABLE || 'linguadev-progress',
  COURSES: process.env.DYNAMODB_COURSES_TABLE || 'linguadev-courses',
  PROJECTS: process.env.DYNAMODB_PROJECTS_TABLE || 'linguadev-projects'
};

// ==================== USER OPERATIONS ====================

/**
 * Create a new user
 * @param {object} userData - User data
 * @returns {Promise<void>}
 */
async function createUser(userData) {
  const command = new PutCommand({
    TableName: TABLES.USERS,
    Item: {
      userId: userData.userId,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      selectedLanguage: userData.selectedLanguage || 'en',
      xp: 0,
      streak: 0,
      level: 1,
      badges: [],
      completedLessons: [],
      completedCourses: [],
      lastActiveDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  });

  await docClient.send(command);
}

/**
 * Get user by ID
 * @param {string} userId - User ID
 * @returns {Promise<object>} - User data
 */
async function getUser(userId) {
  const command = new GetCommand({
    TableName: TABLES.USERS,
    Key: { userId }
  });

  const response = await docClient.send(command);
  return response.Item;
}

/**
 * Update user profile
 * @param {string} userId - User ID
 * @param {object} updates - Fields to update
 * @returns {Promise<void>}
 */
async function updateUser(userId, updates) {
  const updateExpressions = [];
  const expressionAttributeNames = {};
  const expressionAttributeValues = {};

  Object.keys(updates).forEach((key, index) => {
    updateExpressions.push(`#field${index} = :value${index}`);
    expressionAttributeNames[`#field${index}`] = key;
    expressionAttributeValues[`:value${index}`] = updates[key];
  });

  // Always update the updatedAt timestamp
  updateExpressions.push('#updatedAt = :updatedAt');
  expressionAttributeNames['#updatedAt'] = 'updatedAt';
  expressionAttributeValues[':updatedAt'] = new Date().toISOString();

  const command = new UpdateCommand({
    TableName: TABLES.USERS,
    Key: { userId },
    UpdateExpression: `SET ${updateExpressions.join(', ')}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues
  });

  await docClient.send(command);
}

/**
 * Update user language
 * @param {string} userId - User ID
 * @param {string} language - Language code
 * @returns {Promise<void>}
 */
async function updateUserLanguage(userId, language) {
  await updateUser(userId, { selectedLanguage: language });
}

/**
 * Update user XP and level
 * @param {string} userId - User ID
 * @param {number} xpToAdd - XP to add
 * @returns {Promise<object>} - Updated user data
 */
async function addUserXP(userId, xpToAdd) {
  const command = new UpdateCommand({
    TableName: TABLES.USERS,
    Key: { userId },
    UpdateExpression: 'SET xp = xp + :xp, updatedAt = :updatedAt',
    ExpressionAttributeValues: {
      ':xp': xpToAdd,
      ':updatedAt': new Date().toISOString()
    },
    ReturnValues: 'ALL_NEW'
  });

  const response = await docClient.send(command);
  return response.Attributes;
}

/**
 * Update user streak
 * @param {string} userId - User ID
 * @param {number} streak - New streak value
 * @returns {Promise<void>}
 */
async function updateUserStreak(userId, streak) {
  await updateUser(userId, { 
    streak, 
    lastActiveDate: new Date().toISOString() 
  });
}

/**
 * Add badge to user
 * @param {string} userId - User ID
 * @param {object} badge - Badge data
 * @returns {Promise<void>}
 */
async function addUserBadge(userId, badge) {
  const user = await getUser(userId);
  const badges = user.badges || [];
  
  // Check if badge already exists
  if (!badges.some(b => b.id === badge.id)) {
    badges.push({
      ...badge,
      earnedAt: new Date().toISOString()
    });
    
    await updateUser(userId, { badges });
  }
}

// ==================== PROGRESS OPERATIONS ====================

/**
 * Save user progress for a course
 * @param {string} userId - User ID
 * @param {string} courseId - Course ID
 * @param {object} progressData - Progress data
 * @returns {Promise<void>}
 */
async function saveProgress(userId, courseId, progressData) {
  const command = new PutCommand({
    TableName: TABLES.PROGRESS,
    Item: {
      userId,
      courseId,
      ...progressData,
      updatedAt: new Date().toISOString()
    }
  });

  await docClient.send(command);
}

/**
 * Get user progress for a course
 * @param {string} userId - User ID
 * @param {string} courseId - Course ID
 * @returns {Promise<object>} - Progress data
 */
async function getProgress(userId, courseId) {
  const command = new GetCommand({
    TableName: TABLES.PROGRESS,
    Key: { userId, courseId }
  });

  const response = await docClient.send(command);
  return response.Item;
}

/**
 * Get all progress for a user
 * @param {string} userId - User ID
 * @returns {Promise<array>} - Array of progress records
 */
async function getUserProgress(userId) {
  const command = new QueryCommand({
    TableName: TABLES.PROGRESS,
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId
    }
  });

  const response = await docClient.send(command);
  return response.Items || [];
}

/**
 * Mark lesson as completed
 * @param {string} userId - User ID
 * @param {string} courseId - Course ID
 * @param {string} lessonId - Lesson ID
 * @returns {Promise<void>}
 */
async function completeLesson(userId, courseId, lessonId) {
  const progress = await getProgress(userId, courseId) || { completedLessons: [] };
  
  if (!progress.completedLessons.includes(lessonId)) {
    progress.completedLessons.push(lessonId);
    progress.lastLessonId = lessonId;
    progress.lastAccessedAt = new Date().toISOString();
    
    await saveProgress(userId, courseId, progress);
  }
}

// ==================== COURSE OPERATIONS ====================

/**
 * Get all courses
 * @returns {Promise<array>} - Array of courses
 */
async function getAllCourses() {
  const command = new ScanCommand({
    TableName: TABLES.COURSES
  });

  const response = await docClient.send(command);
  return response.Items || [];
}

/**
 * Get course by ID
 * @param {string} courseId - Course ID
 * @returns {Promise<object>} - Course data
 */
async function getCourse(courseId) {
  const command = new GetCommand({
    TableName: TABLES.COURSES,
    Key: { courseId }
  });

  const response = await docClient.send(command);
  return response.Item;
}

/**
 * Create or update course
 * @param {object} courseData - Course data
 * @returns {Promise<void>}
 */
async function saveCourse(courseData) {
  const command = new PutCommand({
    TableName: TABLES.COURSES,
    Item: {
      ...courseData,
      updatedAt: new Date().toISOString()
    }
  });

  await docClient.send(command);
}

// ==================== PROJECT OPERATIONS ====================

/**
 * Save user project
 * @param {string} userId - User ID
 * @param {object} projectData - Project data
 * @returns {Promise<string>} - Project ID
 */
async function saveProject(userId, projectData) {
  const projectId = `${userId}-${Date.now()}`;
  
  const command = new PutCommand({
    TableName: TABLES.PROJECTS,
    Item: {
      projectId,
      userId,
      ...projectData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  });

  await docClient.send(command);
  return projectId;
}

/**
 * Get user projects
 * @param {string} userId - User ID
 * @returns {Promise<array>} - Array of projects
 */
async function getUserProjects(userId) {
  const command = new QueryCommand({
    TableName: TABLES.PROJECTS,
    IndexName: 'UserIdIndex', // Requires GSI
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId
    }
  });

  const response = await docClient.send(command);
  return response.Items || [];
}

/**
 * Get project by ID
 * @param {string} projectId - Project ID
 * @returns {Promise<object>} - Project data
 */
async function getProject(projectId) {
  const command = new GetCommand({
    TableName: TABLES.PROJECTS,
    Key: { projectId }
  });

  const response = await docClient.send(command);
  return response.Item;
}

/**
 * Delete project
 * @param {string} projectId - Project ID
 * @returns {Promise<void>}
 */
async function deleteProject(projectId) {
  const command = new DeleteCommand({
    TableName: TABLES.PROJECTS,
    Key: { projectId }
  });

  await docClient.send(command);
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Check if DynamoDB is configured
 * @returns {boolean}
 */
function isDynamoDBConfigured() {
  return !!(process.env.AWS_REGION && (process.env.AWS_ACCESS_KEY_ID || process.env.AWS_PROFILE));
}

/**
 * Initialize DynamoDB tables (for development)
 * This should be done via AWS Console or CloudFormation in production
 */
async function initializeTables() {
  // This is a placeholder - tables should be created via AWS Console
  console.log('DynamoDB tables should be created via AWS Console or CloudFormation');
  console.log('Required tables:', Object.values(TABLES));
}

module.exports = {
  // User operations
  createUser,
  getUser,
  updateUser,
  updateUserLanguage,
  addUserXP,
  updateUserStreak,
  addUserBadge,
  
  // Progress operations
  saveProgress,
  getProgress,
  getUserProgress,
  completeLesson,
  
  // Course operations
  getAllCourses,
  getCourse,
  saveCourse,
  
  // Project operations
  saveProject,
  getUserProjects,
  getProject,
  deleteProject,
  
  // Utility
  isDynamoDBConfigured,
  initializeTables,
  TABLES
};
