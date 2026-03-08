import axios from 'axios'
import logger from './logger'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Log API requests in development
    logger.debug('API Request', {
      method: config.method,
      url: config.url,
      data: config.data
    })
    
    return config
  },
  (error) => {
    logger.error('API Request Error', error)
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    logger.debug('API Response', {
      url: response.config.url,
      status: response.status,
      data: response.data
    })
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // Log error
    logger.error('API Response Error', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    })

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      // Clear auth and redirect to login
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
      
      return Promise.reject(error)
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      logger.warn('Access forbidden', { url: error.config?.url })
    }

    // Handle 404 Not Found
    if (error.response?.status === 404) {
      logger.warn('Resource not found', { url: error.config?.url })
    }

    // Handle 500 Server Error
    if (error.response?.status >= 500) {
      logger.error('Server error', {
        url: error.config?.url,
        status: error.response?.status
      })
    }

    // Handle network errors
    if (error.message === 'Network Error') {
      logger.error('Network error - check connection')
      
      // Retry logic for network errors
      if (!originalRequest._retryCount) {
        originalRequest._retryCount = 0
      }
      
      if (originalRequest._retryCount < 3) {
        originalRequest._retryCount++
        logger.info(`Retrying request (${originalRequest._retryCount}/3)`)
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => 
          setTimeout(resolve, 1000 * originalRequest._retryCount)
        )
        
        return api(originalRequest)
      }
    }

    // Handle timeout
    if (error.code === 'ECONNABORTED') {
      logger.error('Request timeout', { url: error.config?.url })
    }

    return Promise.reject(error)
  }
)

// Helper functions for common API patterns
export const apiHelpers = {
  // GET with error handling
  async get(url, config = {}) {
    try {
      const response = await api.get(url, config)
      return { data: response.data, error: null }
    } catch (error) {
      return { data: null, error: error.response?.data || error.message }
    }
  },

  // POST with error handling
  async post(url, data, config = {}) {
    try {
      const response = await api.post(url, data, config)
      return { data: response.data, error: null }
    } catch (error) {
      return { data: null, error: error.response?.data || error.message }
    }
  },

  // PUT with error handling
  async put(url, data, config = {}) {
    try {
      const response = await api.put(url, data, config)
      return { data: response.data, error: null }
    } catch (error) {
      return { data: null, error: error.response?.data || error.message }
    }
  },

  // DELETE with error handling
  async delete(url, config = {}) {
    try {
      const response = await api.delete(url, config)
      return { data: response.data, error: null }
    } catch (error) {
      return { data: null, error: error.response?.data || error.message }
    }
  }
}

export default api
