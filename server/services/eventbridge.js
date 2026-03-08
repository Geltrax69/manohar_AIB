const { EventBridgeClient, PutEventsCommand } = require("@aws-sdk/client-eventbridge");

// Initialize EventBridge client
const client = new EventBridgeClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: process.env.AWS_ACCESS_KEY_ID ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  } : undefined
});

const EVENT_BUS_NAME = process.env.EVENTBRIDGE_BUS_NAME || 'default';

/**
 * Publish event to EventBridge
 * @param {string} eventType - Event type (e.g., 'user.registered', 'lesson.completed')
 * @param {object} eventData - Event data
 * @param {string} source - Event source (default: 'linguadev.api')
 * @returns {Promise<object>} - Event result
 */
async function publishEvent(eventType, eventData, source = 'linguadev.api') {
  try {
    const command = new PutEventsCommand({
      Entries: [
        {
          Source: source,
          DetailType: eventType,
          Detail: JSON.stringify(eventData),
          EventBusName: EVENT_BUS_NAME,
          Time: new Date()
        }
      ]
    });

    const response = await client.send(command);
    
    if (response.FailedEntryCount > 0) {
      console.error('EventBridge publish failed:', response.Entries[0].ErrorMessage);
      throw new Error(response.Entries[0].ErrorMessage);
    }

    return {
      eventId: response.Entries[0].EventId,
      success: true
    };
  } catch (error) {
    console.error('EventBridge publish error:', error);
    // Don't throw - events are fire-and-forget
    return { success: false, error: error.message };
  }
}

// ==================== EVENT PUBLISHERS ====================

/**
 * Publish user registration event
 * @param {object} userData - User data
 */
async function publishUserRegistered(userData) {
  return publishEvent('user.registered', {
    userId: userData.userId,
    email: userData.email,
    language: userData.selectedLanguage,
    timestamp: new Date().toISOString()
  });
}

/**
 * Publish lesson completion event
 * @param {string} userId - User ID
 * @param {string} courseId - Course ID
 * @param {string} lessonId - Lesson ID
 * @param {number} xpEarned - XP earned
 */
async function publishLessonCompleted(userId, courseId, lessonId, xpEarned) {
  return publishEvent('lesson.completed', {
    userId,
    courseId,
    lessonId,
    xpEarned,
    timestamp: new Date().toISOString()
  });
}

/**
 * Publish course completion event
 * @param {string} userId - User ID
 * @param {string} courseId - Course ID
 * @param {number} xpEarned - XP earned
 */
async function publishCourseCompleted(userId, courseId, xpEarned) {
  return publishEvent('course.completed', {
    userId,
    courseId,
    xpEarned,
    timestamp: new Date().toISOString()
  });
}

/**
 * Publish badge earned event
 * @param {string} userId - User ID
 * @param {object} badge - Badge data
 */
async function publishBadgeEarned(userId, badge) {
  return publishEvent('badge.earned', {
    userId,
    badgeId: badge.id,
    badgeName: badge.name,
    timestamp: new Date().toISOString()
  });
}

/**
 * Publish streak milestone event
 * @param {string} userId - User ID
 * @param {number} streak - Current streak
 */
async function publishStreakMilestone(userId, streak) {
  return publishEvent('streak.milestone', {
    userId,
    streak,
    timestamp: new Date().toISOString()
  });
}

/**
 * Publish AI chat event (for analytics)
 * @param {string} userId - User ID
 * @param {string} language - Language used
 * @param {boolean} success - Whether AI response was successful
 */
async function publishAIChatEvent(userId, language, success) {
  return publishEvent('ai.chat', {
    userId,
    language,
    success,
    timestamp: new Date().toISOString()
  });
}

/**
 * Publish code execution event (for analytics)
 * @param {string} userId - User ID
 * @param {string} language - Programming language
 * @param {boolean} success - Whether execution was successful
 */
async function publishCodeExecuted(userId, language, success) {
  return publishEvent('code.executed', {
    userId,
    language,
    success,
    timestamp: new Date().toISOString()
  });
}

/**
 * Publish project deployment event
 * @param {string} userId - User ID
 * @param {string} projectId - Project ID
 * @param {string} deploymentUrl - Deployment URL
 */
async function publishProjectDeployed(userId, projectId, deploymentUrl) {
  return publishEvent('project.deployed', {
    userId,
    projectId,
    deploymentUrl,
    timestamp: new Date().toISOString()
  });
}

/**
 * Publish error event (for monitoring)
 * @param {string} errorType - Error type
 * @param {string} errorMessage - Error message
 * @param {object} context - Error context
 */
async function publishErrorEvent(errorType, errorMessage, context = {}) {
  return publishEvent('error.occurred', {
    errorType,
    errorMessage,
    context,
    timestamp: new Date().toISOString()
  }, 'linguadev.monitoring');
}

/**
 * Check if EventBridge is configured
 * @returns {boolean}
 */
function isEventBridgeConfigured() {
  return !!(process.env.AWS_REGION && (process.env.AWS_ACCESS_KEY_ID || process.env.AWS_PROFILE));
}

module.exports = {
  // Core functions
  publishEvent,
  isEventBridgeConfigured,
  
  // Event publishers
  publishUserRegistered,
  publishLessonCompleted,
  publishCourseCompleted,
  publishBadgeEarned,
  publishStreakMilestone,
  publishAIChatEvent,
  publishCodeExecuted,
  publishProjectDeployed,
  publishErrorEvent
};
