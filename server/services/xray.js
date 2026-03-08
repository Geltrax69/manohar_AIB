const AWSXRay = require('aws-xray-sdk-core');

let isXRayEnabled = false;

/**
 * Initialize X-Ray tracing
 * @param {object} app - Express app
 */
function initializeXRay(app) {
  if (!process.env.AWS_XRAY_ENABLED || process.env.AWS_XRAY_ENABLED !== 'true') {
    console.log('⚠️  X-Ray tracing disabled');
    return;
  }

  try {
    // Enable X-Ray for AWS SDK
    const AWS = AWSXRay.captureAWS(require('aws-sdk'));
    
    // Enable X-Ray for HTTP/HTTPS requests
    AWSXRay.captureHTTPsGlobal(require('http'));
    AWSXRay.captureHTTPsGlobal(require('https'));
    
    // Add X-Ray middleware to Express
    if (app) {
      app.use(AWSXRay.express.openSegment('LinguaDev-API'));
    }
    
    isXRayEnabled = true;
    console.log('✅ X-Ray tracing enabled');
  } catch (error) {
    console.error('X-Ray initialization error:', error);
    isXRayEnabled = false;
  }
}

/**
 * Close X-Ray segment (add as last middleware)
 * @param {object} app - Express app
 */
function closeXRaySegment(app) {
  if (isXRayEnabled && app) {
    app.use(AWSXRay.express.closeSegment());
  }
}

/**
 * Create custom subsegment for tracing
 * @param {string} name - Subsegment name
 * @param {function} callback - Function to trace
 * @returns {Promise<any>} - Result of callback
 */
async function traceAsync(name, callback) {
  if (!isXRayEnabled) {
    return callback();
  }

  return new Promise((resolve, reject) => {
    AWSXRay.captureAsyncFunc(name, async (subsegment) => {
      try {
        const result = await callback(subsegment);
        subsegment.close();
        resolve(result);
      } catch (error) {
        subsegment.addError(error);
        subsegment.close();
        reject(error);
      }
    });
  });
}

/**
 * Add annotation to current segment
 * @param {string} key - Annotation key
 * @param {any} value - Annotation value
 */
function addAnnotation(key, value) {
  if (!isXRayEnabled) return;
  
  try {
    const segment = AWSXRay.getSegment();
    if (segment) {
      segment.addAnnotation(key, value);
    }
  } catch (error) {
    console.error('Add annotation error:', error);
  }
}

/**
 * Add metadata to current segment
 * @param {string} key - Metadata key
 * @param {any} value - Metadata value
 * @param {string} namespace - Namespace (default: 'default')
 */
function addMetadata(key, value, namespace = 'default') {
  if (!isXRayEnabled) return;
  
  try {
    const segment = AWSXRay.getSegment();
    if (segment) {
      segment.addMetadata(key, value, namespace);
    }
  } catch (error) {
    console.error('Add metadata error:', error);
  }
}

/**
 * Trace database query
 * @param {string} query - SQL query or operation name
 * @param {function} callback - Query function
 * @returns {Promise<any>} - Query result
 */
async function traceDatabase(query, callback) {
  return traceAsync(`Database: ${query}`, async (subsegment) => {
    if (subsegment) {
      subsegment.addAnnotation('query', query);
    }
    return callback();
  });
}

/**
 * Trace external API call
 * @param {string} apiName - API name
 * @param {function} callback - API call function
 * @returns {Promise<any>} - API response
 */
async function traceAPICall(apiName, callback) {
  return traceAsync(`API: ${apiName}`, async (subsegment) => {
    if (subsegment) {
      subsegment.addAnnotation('api', apiName);
    }
    return callback();
  });
}

/**
 * Check if X-Ray is enabled
 * @returns {boolean}
 */
function isXRayConfigured() {
  return isXRayEnabled;
}

module.exports = {
  initializeXRay,
  closeXRaySegment,
  traceAsync,
  addAnnotation,
  addMetadata,
  traceDatabase,
  traceAPICall,
  isXRayConfigured,
  AWSXRay
};
