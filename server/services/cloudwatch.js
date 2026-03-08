const { CloudWatchLogsClient, PutLogEventsCommand, CreateLogStreamCommand, DescribeLogStreamsCommand } = require("@aws-sdk/client-cloudwatch-logs");

// Initialize CloudWatch client
const client = new CloudWatchLogsClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: process.env.AWS_ACCESS_KEY_ID ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  } : undefined
});

const LOG_GROUP = process.env.AWS_CLOUDWATCH_LOG_GROUP || '/linguadev/application';
const LOG_STREAM = `server-${Date.now()}`;

let sequenceToken = null;
let logStreamCreated = false;

/**
 * Create log stream if it doesn't exist
 */
async function ensureLogStream() {
  if (logStreamCreated) return;

  try {
    // Check if log stream exists
    const describeCommand = new DescribeLogStreamsCommand({
      logGroupName: LOG_GROUP,
      logStreamNamePrefix: LOG_STREAM
    });

    const describeResponse = await client.send(describeCommand);
    
    if (describeResponse.logStreams && describeResponse.logStreams.length > 0) {
      sequenceToken = describeResponse.logStreams[0].uploadSequenceToken;
      logStreamCreated = true;
      return;
    }

    // Create log stream if it doesn't exist
    const createCommand = new CreateLogStreamCommand({
      logGroupName: LOG_GROUP,
      logStreamName: LOG_STREAM
    });

    await client.send(createCommand);
    logStreamCreated = true;
  } catch (error) {
    if (error.name !== 'ResourceAlreadyExistsException') {
      console.error('CloudWatch log stream creation error:', error);
    }
    logStreamCreated = true; // Assume it exists
  }
}

/**
 * Send log to CloudWatch
 * @param {string} level - Log level (INFO, WARN, ERROR)
 * @param {string} message - Log message
 * @param {object} metadata - Additional metadata
 */
async function sendToCloudWatch(level, message, metadata = {}) {
  try {
    await ensureLogStream();

    const logEvent = {
      timestamp: Date.now(),
      message: JSON.stringify({
        level,
        message,
        metadata,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
      })
    };

    const params = {
      logGroupName: LOG_GROUP,
      logStreamName: LOG_STREAM,
      logEvents: [logEvent]
    };

    if (sequenceToken) {
      params.sequenceToken = sequenceToken;
    }

    const command = new PutLogEventsCommand(params);
    const response = await client.send(command);
    
    // Update sequence token for next log
    sequenceToken = response.nextSequenceToken;
  } catch (error) {
    // Don't throw error for logging failures
    console.error('CloudWatch logging error:', error.message);
  }
}

/**
 * Enhanced logger with CloudWatch integration
 */
const logger = {
  info: (message, metadata = {}) => {
    console.log(`[INFO] ${message}`, metadata);
    if (isCloudWatchConfigured()) {
      sendToCloudWatch('INFO', message, metadata).catch(() => {});
    }
  },
  
  warn: (message, metadata = {}) => {
    console.warn(`[WARN] ${message}`, metadata);
    if (isCloudWatchConfigured()) {
      sendToCloudWatch('WARN', message, metadata).catch(() => {});
    }
  },
  
  error: (message, metadata = {}) => {
    console.error(`[ERROR] ${message}`, metadata);
    if (isCloudWatchConfigured()) {
      sendToCloudWatch('ERROR', message, metadata).catch(() => {});
    }
  },
  
  debug: (message, metadata = {}) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, metadata);
    }
  }
};

/**
 * Check if AWS CloudWatch is configured
 * @returns {boolean}
 */
function isCloudWatchConfigured() {
  return !!(process.env.AWS_REGION && (process.env.AWS_ACCESS_KEY_ID || process.env.AWS_PROFILE));
}

module.exports = { 
  logger,
  sendToCloudWatch,
  isCloudWatchConfigured
};
