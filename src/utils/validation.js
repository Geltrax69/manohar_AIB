// Production-grade validation utilities

export const validators = {
  email: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!value) return 'Email is required'
    if (!emailRegex.test(value)) return 'Invalid email format'
    return null
  },

  password: (value) => {
    if (!value) return 'Password is required'
    if (value.length < 8) return 'Password must be at least 8 characters'
    if (!/[A-Z]/.test(value)) return 'Password must contain at least one uppercase letter'
    if (!/[a-z]/.test(value)) return 'Password must contain at least one lowercase letter'
    if (!/[0-9]/.test(value)) return 'Password must contain at least one number'
    return null
  },

  name: (value) => {
    if (!value) return 'Name is required'
    if (value.length < 2) return 'Name must be at least 2 characters'
    if (value.length > 50) return 'Name must be less than 50 characters'
    if (!/^[\p{L}\s'-]+$/u.test(value)) return 'Name can only contain letters, spaces, apostrophes, and hyphens'
    return null
  },

  required: (value, fieldName = 'This field') => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return `${fieldName} is required`
    }
    return null
  },

  minLength: (value, min, fieldName = 'This field') => {
    if (value && value.length < min) {
      return `${fieldName} must be at least ${min} characters`
    }
    return null
  },

  maxLength: (value, max, fieldName = 'This field') => {
    if (value && value.length > max) {
      return `${fieldName} must be less than ${max} characters`
    }
    return null
  },

  phone: (value) => {
    const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/
    if (value && !phoneRegex.test(value)) {
      return 'Invalid phone number format'
    }
    return null
  },

  url: (value) => {
    try {
      if (value) new URL(value)
      return null
    } catch {
      return 'Invalid URL format'
    }
  }
}

export const validateForm = (formData, rules) => {
  const errors = {}
  
  Object.keys(rules).forEach(field => {
    const fieldRules = Array.isArray(rules[field]) ? rules[field] : [rules[field]]
    
    for (const rule of fieldRules) {
      const error = rule(formData[field])
      if (error) {
        errors[field] = error
        break
      }
    }
  })
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input
  
  // Remove potential XSS vectors
  return input
    .replace(/[<>]/g, '')
    .trim()
}

export const sanitizeFormData = (formData) => {
  const sanitized = {}
  
  Object.keys(formData).forEach(key => {
    sanitized[key] = sanitizeInput(formData[key])
  })
  
  return sanitized
}
