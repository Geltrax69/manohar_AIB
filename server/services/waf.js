/**
 * AWS WAF Integration
 * 
 * Note: WAF is typically configured at the CloudFront or ALB level,
 * not directly in the application code. This module provides
 * helper functions for WAF-related operations and monitoring.
 */

/**
 * WAF Rule Recommendations for LinguaDev AI
 */
const WAF_RULES = {
  // Core AWS Managed Rules
  CORE_RULE_SET: 'AWSManagedRulesCommonRuleSet',
  
  // Known Bad Inputs
  KNOWN_BAD_INPUTS: 'AWSManagedRulesKnownBadInputsRuleSet',
  
  // SQL Injection Protection
  SQL_DATABASE: 'AWSManagedRulesSQLiRuleSet',
  
  // Linux/Unix Protection
  LINUX: 'AWSManagedRulesLinuxRuleSet',
  
  // Rate Limiting
  RATE_LIMIT: 'AWSManagedRulesRateLimitRuleSet',
  
  // Bot Control
  BOT_CONTROL: 'AWSManagedRulesBotControlRuleSet'
};

/**
 * Check if request should be blocked (application-level checks)
 * @param {object} req - Express request object
 * @returns {object} - {blocked: boolean, reason: string}
 */
function checkRequest(req) {
  const checks = [
    checkSQLInjection(req),
    checkXSS(req),
    checkPathTraversal(req),
    checkLargePayload(req)
  ];

  const blocked = checks.find(check => check.blocked);
  return blocked || { blocked: false };
}

/**
 * Check for SQL injection patterns
 * @param {object} req - Express request object
 * @returns {object} - {blocked: boolean, reason: string}
 */
function checkSQLInjection(req) {
  const sqlPatterns = [
    /(\bUNION\b.*\bSELECT\b)/i,
    /(\bSELECT\b.*\bFROM\b)/i,
    /(\bINSERT\b.*\bINTO\b)/i,
    /(\bDELETE\b.*\bFROM\b)/i,
    /(\bDROP\b.*\bTABLE\b)/i,
    /(\bEXEC\b|\bEXECUTE\b)/i,
    /(;|\-\-|\/\*|\*\/)/
  ];

  // Skip if body hasn't been parsed yet
  const checkString = JSON.stringify(req.body || {}) + JSON.stringify(req.query || {});
  
  for (const pattern of sqlPatterns) {
    if (pattern.test(checkString)) {
      return {
        blocked: true,
        reason: 'Potential SQL injection detected',
        pattern: pattern.toString()
      };
    }
  }

  return { blocked: false };
}

/**
 * Check for XSS patterns
 * @param {object} req - Express request object
 * @returns {object} - {blocked: boolean, reason: string}
 */
function checkXSS(req) {
  const xssPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi, // Event handlers like onclick=
    /<iframe/gi,
    /eval\(/gi,
    /expression\(/gi
  ];

  const checkString = JSON.stringify(req.body || {}) + JSON.stringify(req.query || {});
  
  for (const pattern of xssPatterns) {
    if (pattern.test(checkString)) {
      return {
        blocked: true,
        reason: 'Potential XSS attack detected',
        pattern: pattern.toString()
      };
    }
  }

  return { blocked: false };
}

/**
 * Check for path traversal attempts
 * @param {object} req - Express request object
 * @returns {object} - {blocked: boolean, reason: string}
 */
function checkPathTraversal(req) {
  const pathPatterns = [
    /\.\.\//g,
    /\.\.\\/g,
    /%2e%2e%2f/gi,
    /%2e%2e\\/gi
  ];

  const checkString = req.path + JSON.stringify(req.query || {});
  
  for (const pattern of pathPatterns) {
    if (pattern.test(checkString)) {
      return {
        blocked: true,
        reason: 'Path traversal attempt detected',
        pattern: pattern.toString()
      };
    }
  }

  return { blocked: false };
}

/**
 * Check for large payload (potential DoS)
 * @param {object} req - Express request object
 * @returns {object} - {blocked: boolean, reason: string}
 */
function checkLargePayload(req) {
  const MAX_BODY_SIZE = 10 * 1024 * 1024; // 10MB
  
  // Skip if body hasn't been parsed yet
  if (!req.body) {
    return { blocked: false };
  }
  
  const bodySize = JSON.stringify(req.body).length;
  
  if (bodySize > MAX_BODY_SIZE) {
    return {
      blocked: true,
      reason: 'Payload too large',
      size: bodySize
    };
  }

  return { blocked: false };
}

/**
 * Express middleware for WAF-like protection
 * @returns {function} - Express middleware
 */
function wafMiddleware() {
  return (req, res, next) => {
    const check = checkRequest(req);
    
    if (check.blocked) {
      console.warn('WAF: Request blocked', {
        ip: req.ip,
        path: req.path,
        reason: check.reason
      });
      
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Request blocked by security policy'
      });
    }
    
    next();
  };
}

/**
 * Get WAF configuration recommendations
 * @returns {object} - WAF configuration
 */
function getWAFRecommendations() {
  return {
    rules: WAF_RULES,
    recommendations: [
      'Enable AWS Managed Rules for Common Rule Set',
      'Enable SQL Injection Protection',
      'Enable XSS Protection',
      'Enable Rate Limiting (100 requests per 5 minutes)',
      'Enable Bot Control for API endpoints',
      'Configure IP reputation lists',
      'Set up CloudWatch alarms for blocked requests',
      'Review WAF logs regularly'
    ],
    setup: {
      cloudfront: 'Associate WAF Web ACL with CloudFront distribution',
      alb: 'Associate WAF Web ACL with Application Load Balancer',
      apiGateway: 'Associate WAF Web ACL with API Gateway'
    }
  };
}

/**
 * Check if WAF is configured (at infrastructure level)
 * @returns {boolean}
 */
function isWAFConfigured() {
  // WAF is configured at CloudFront/ALB level, not in application
  // This checks if WAF environment variables are set
  return !!(process.env.WAF_WEB_ACL_ID || process.env.WAF_ENABLED === 'true');
}

module.exports = {
  checkRequest,
  checkSQLInjection,
  checkXSS,
  checkPathTraversal,
  checkLargePayload,
  wafMiddleware,
  getWAFRecommendations,
  isWAFConfigured,
  WAF_RULES
};
