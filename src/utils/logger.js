// Production-grade logging utility

const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug'
}

class Logger {
  constructor() {
    this.isProduction = import.meta.env.VITE_ENV === 'production'
    this.enableAnalytics = import.meta.env.VITE_ENABLE_ANALYTICS === 'true'
  }

  log(level, message, data = {}) {
    const logEntry = {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    }

    // Console logging in development
    if (!this.isProduction) {
      const consoleMethod = level === LOG_LEVELS.ERROR ? 'error' : 
                           level === LOG_LEVELS.WARN ? 'warn' : 'log'
      console[consoleMethod](`[${level.toUpperCase()}]`, message, data)
    }

    // Send to logging service in production
    if (this.isProduction && this.enableAnalytics) {
      this.sendToLoggingService(logEntry)
    }

    // Store critical errors locally
    if (level === LOG_LEVELS.ERROR) {
      this.storeErrorLocally(logEntry)
    }
  }

  error(message, error = {}) {
    this.log(LOG_LEVELS.ERROR, message, {
      error: error.message || error,
      stack: error.stack,
      ...error
    })
  }

  warn(message, data) {
    this.log(LOG_LEVELS.WARN, message, data)
  }

  info(message, data) {
    this.log(LOG_LEVELS.INFO, message, data)
  }

  debug(message, data) {
    if (!this.isProduction) {
      this.log(LOG_LEVELS.DEBUG, message, data)
    }
  }

  sendToLoggingService(logEntry) {
    // Implement AWS CloudWatch Logs or similar
    // For now, batch and send via API
    try {
      const logs = JSON.parse(localStorage.getItem('app_logs') || '[]')
      logs.push(logEntry)
      
      // Keep only last 100 logs
      if (logs.length > 100) {
        logs.shift()
      }
      
      localStorage.setItem('app_logs', JSON.stringify(logs))

      // Send to backend if batch size reached
      if (logs.length >= 10) {
        this.flushLogs(logs)
      }
    } catch (e) {
      console.error('Failed to store log:', e)
    }
  }

  storeErrorLocally(logEntry) {
    try {
      const errors = JSON.parse(localStorage.getItem('app_errors') || '[]')
      errors.push(logEntry)
      
      // Keep only last 50 errors
      if (errors.length > 50) {
        errors.shift()
      }
      
      localStorage.setItem('app_errors', JSON.stringify(errors))
    } catch (e) {
      console.error('Failed to store error:', e)
    }
  }

  async flushLogs(logs) {
    try {
      // Send logs to backend
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logs })
      })
      
      // Clear local logs after successful send
      localStorage.setItem('app_logs', '[]')
    } catch (e) {
      console.error('Failed to flush logs:', e)
    }
  }

  // Track user actions for analytics
  trackEvent(eventName, properties = {}) {
    if (!this.enableAnalytics) return

    this.info(`Event: ${eventName}`, properties)

    // Send to analytics service (e.g., AWS Pinpoint, Google Analytics)
    if (window.gtag) {
      window.gtag('event', eventName, properties)
    }
  }

  // Track page views
  trackPageView(pageName) {
    this.trackEvent('page_view', { page: pageName })
  }

  // Track errors
  trackError(error, context = {}) {
    this.error('Application Error', { error, context })
    this.trackEvent('error', {
      error: error.message || error,
      context
    })
  }
}

export default new Logger()
