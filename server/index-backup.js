const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { v4: uuidv4 } = require('uuid')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const morgan = require('morgan')

const app = express()
const PORT = process.env.PORT || 5000
const JWT_SECRET = process.env.JWT_SECRET || 'linguadev-secret-key-change-in-production'
const NODE_ENV = process.env.NODE_ENV || 'development'

// Security middleware
app.use(helmet())

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}))

// Body parser with size limits
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Logging
if (NODE_ENV === 'development') {
  app.use(morgan('dev'))
} else {
  app.use(morgan('combined'))
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // limit each IP to 5 login/register attempts per 15 minutes
  message: 'Too many authentication attempts, please try again later.'
})

app.use('/api/', limiter)

// In-memory database (replace with real database in production)
const users = []
const courses = [
  {
    id: '1',
    title: 'Python Lists',
    language: 'hi',
    level: 'intermediate',
    progress: 65,
    description: 'सूचियों के साथ काम करना सीखें'
  }
]

const dashboardActivity = [60, 80, 50, 90, 70, 40, 85]

// Validation middleware
const validateInput = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body)
    if (error) {
      return res.status(400).json({ 
        message: 'Validation error', 
        details: error.details[0].message 
      })
    }
    next()
  }
}

// Sanitize input
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input
  return input.replace(/[<>]/g, '').trim()
}

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'Access token required' })
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' })
    }
    req.user = user
    next()
  })
}

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err)
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message })
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ message: 'Invalid token' })
  }
  
  res.status(500).json({ 
    message: NODE_ENV === 'production' ? 'Internal server error' : err.message 
  })
}

// Routes

// Register
app.post('/api/auth/register', authLimiter, async (req, res, next) => {
  try {
    let { firstName, lastName, email, password } = req.body

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    // Sanitize inputs
    firstName = sanitizeInput(firstName)
    lastName = sanitizeInput(lastName)
    email = sanitizeInput(email.toLowerCase())

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' })
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' })
    }

    // Check if user exists
    const existingUser = users.find(u => u.email === email)
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = {
      id: uuidv4(),
      firstName,
      lastName,
      email,
      password: hashedPassword,
      selectedLanguage: null,
      createdAt: new Date().toISOString()
    }

    users.push(user)

    // Generate token
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' })

    // Return user without password
    const { password: _, ...userWithoutPassword } = user

    console.log(`✅ User registered: ${email}`)

    res.status(201).json({
      user: userWithoutPassword,
      token
    })
  } catch (error) {
    next(error)
  }
})

// Login
app.post('/api/auth/login', authLimiter, async (req, res, next) => {
  try {
    let { email, password } = req.body

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    // Sanitize email
    email = sanitizeInput(email.toLowerCase())

    // Find user
    const user = users.find(u => u.email === email)
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // Generate token
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' })

    // Return user without password
    const { password: _, ...userWithoutPassword } = user

    console.log(`✅ User logged in: ${email}`)

    res.json({
      user: userWithoutPassword,
      token
    })
  } catch (error) {
    next(error)
  }
})

// Get dashboard data
app.get('/api/learning/dashboard', authenticateToken, (req, res, next) => {
  try {
    res.json({
      courses,
      activity: dashboardActivity,
      weeklyGoal: 75,
      streak: 12
    })
  } catch (error) {
    next(error)
  }
})

// Get courses
app.get('/api/courses', authenticateToken, (req, res, next) => {
  try {
    const allCourses = [
      {
        id: '1',
        title: 'Python Basics (Hindi)',
        description: 'Learn variables, loops and functions explained in Hindi.',
        language: 'Hindi',
        level: 'Beginner',
        lessons: 24,
        duration: '6h 30m',
        rating: 4.8,
        tag: 'Python'
      },
      {
        id: '2',
        title: 'React Native (Tamil)',
        description: 'Build mobile apps with React. Clear Tamil explanations.',
        language: 'Tamil',
        level: 'Intermediate',
        lessons: 32,
        duration: '8h 45m',
        rating: 4.9,
        tag: 'React Native'
      }
    ]
    
    res.json(allCourses)
  } catch (error) {
    next(error)
  }
})

// AI Tutor chat
app.post('/api/ai/chat', authenticateToken, (req, res, next) => {
  try {
    let { message, language } = req.body
    
    // Validate input
    if (!message) {
      return res.status(400).json({ message: 'Message is required' })
    }
    
    // Sanitize message
    message = sanitizeInput(message)
    
    // Placeholder for AWS Bedrock integration
    // This will be replaced with actual AI service
    
    const response = {
      text: 'Loop ka upayog code ke ek block ko bar-bar repeat karne ke liye kiya jata hai.',
      code: `fruits = ['seb', 'kela', 'aam']\n\nfor fruit in fruits:\n    print(fruit)`,
      followUp: 'Is code mein, for loop list ke har item par jaata hai. Kya aapko isme koi confusion hai?'
    }
    
    res.json(response)
  } catch (error) {
    next(error)
  }
})

// Execute code
app.post('/api/code/execute', authenticateToken, (req, res, next) => {
  try {
    let { code, language } = req.body
    
    // Validate input
    if (!code) {
      return res.status(400).json({ message: 'Code is required' })
    }
    
    // Sanitize code (basic check)
    if (code.length > 10000) {
      return res.status(400).json({ message: 'Code is too long' })
    }
    
    // Placeholder for AWS Lambda code execution
    // This will be replaced with actual code execution service
    
    res.json({
      output: '15',
      executionTime: 0.123,
      status: 'success'
    })
  } catch (error) {
    next(error)
  }
})

// Logs endpoint (for frontend to send logs)
app.post('/api/logs', authenticateToken, (req, res, next) => {
  try {
    const { logs } = req.body
    
    if (!logs || !Array.isArray(logs)) {
      return res.status(400).json({ message: 'Invalid logs format' })
    }
    
    // In production, send to AWS CloudWatch or similar
    console.log('📊 Received logs:', logs.length, 'entries')
    
    res.json({ success: true, message: 'Logs received' })
  } catch (error) {
    next(error)
  }
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'LinguaDev AI API is running',
    environment: NODE_ENV,
    timestamp: new Date().toISOString()
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint not found' })
})

// Error handler (must be last)
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`)
  console.log(`📚 API endpoints available at http://localhost:${PORT}/api`)
  console.log(`🔒 Environment: ${NODE_ENV}`)
  console.log(`🛡️  Security features enabled`)
})
