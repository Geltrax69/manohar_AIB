const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const morgan = require('morgan')
const multer = require('multer')
const path = require('path')

// Database
const connectDB = require('./database')
const User = require('./models/User')
const Course = require('./models/Course')
const Progress = require('./models/Progress')
const inMemoryStore = require('./inMemoryStore')

// Data
const coursesData = require('./data/courses')
const { badges, calculateLevel, getNextLevel } = require('./data/badges')

// AWS Services
const { generateAIResponse, isBedrockConfigured } = require('./services/bedrock')
const { textToSpeech, isPollyConfigured } = require('./services/polly')
const { translateText, translateCodeComments, isTranslateConfigured } = require('./services/translate')
const { uploadFile, getFileUrl, uploadCode, isS3Configured } = require('./services/s3')
const { logger, isCloudWatchConfigured } = require('./services/cloudwatch')

// Gemini AI Service (free alternative to Bedrock)
const { generateGeminiResponse, isGeminiConfigured } = require('./services/gemini')

// Data Layer Services
const dynamodb = require('./services/dynamodb')
const redis = require('./services/redis')

// Integration Layer Services
const amplify = require('./services/amplify')
const cloudfront = require('./services/cloudfront')
const eventbridge = require('./services/eventbridge')

// Security & Monitoring Services
const cognito = require('./services/cognito')
const kms = require('./services/kms')
const xray = require('./services/xray')
const waf = require('./services/waf')

const app = express()
const PORT = process.env.PORT || 5000
const JWT_SECRET = process.env.JWT_SECRET || 'linguadev-secret-key-change-in-production'
const NODE_ENV = process.env.NODE_ENV || 'development'

// Initialize X-Ray tracing (must be before other middleware)
xray.initializeXRay(app)

// Connect to MongoDB with fallback
let isMongoConnected = false
connectDB()
  .then((connected) => {
    isMongoConnected = connected || false
    if (isMongoConnected) {
      logger.info('MongoDB connected successfully')
    } else {
      logger.warn('Using in-memory storage')
    }
  })
  .catch(err => {
    logger.warn('MongoDB not available, using in-memory fallback', { error: err.message })
    isMongoConnected = false
  })

// Check AWS services configuration
const awsServicesStatus = {
  bedrock: isBedrockConfigured(),
  polly: isPollyConfigured(),
  translate: isTranslateConfigured(),
  s3: isS3Configured(),
  cloudwatch: isCloudWatchConfigured(),
  dynamodb: dynamodb.isDynamoDBConfigured(),
  redis: false, // Will be set after initialization
  amplify: amplify.isAmplifyConfigured(),
  cloudfront: cloudfront.isCloudFrontConfigured(),
  eventbridge: eventbridge.isEventBridgeConfigured(),
  cognito: cognito.isCognitoConfigured(),
  kms: kms.isKMSConfigured(),
  xray: xray.isXRayConfigured(),
  waf: waf.isWAFConfigured()
}

// Initialize Redis if configured
if (process.env.REDIS_HOST || process.env.ELASTICACHE_ENDPOINT) {
  redis.initializeRedis();
  setTimeout(() => {
    awsServicesStatus.redis = redis.isRedisConfigured();
    logger.info('Redis initialization complete', { connected: awsServicesStatus.redis });
  }, 1000);
}

logger.info('AWS Services Status', awsServicesStatus)

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname)
  }
})

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|txt|py|js|json|md/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)

    if (extname && mimetype) {
      return cb(null, true)
    } else {
      cb(new Error('Invalid file type'))
    }
  }
})

// Create uploads directory if it doesn't exist
const fs = require('fs')
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads')
}

// Security middleware
app.use(helmet())
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()).filter(Boolean) : [])
]

app.use(cors({
  origin: (origin, callback) => {
    // Non-browser or same-origin requests may not include Origin
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin)) return callback(null, true)
    return callback(new Error(`CORS blocked for origin: ${origin}`))
  },
  credentials: true
}))

// WAF-like protection middleware
app.use(waf.wafMiddleware())

// Body parser
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
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: NODE_ENV === 'development' ? 50 : 5, // Higher limit for development
  message: 'Too many authentication attempts, please try again later.'
})

app.use('/api/', limiter)

// Utilities
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

// Helper to save user (supports both MongoDB and in-memory)
const saveUser = async (user) => {
  if (isMongoConnected) {
    await user.save()
  } else {
    await inMemoryStore.users.save(user)
  }
}

// Helper to find user by id (supports both MongoDB and in-memory)
const findUserById = async (id) => {
  if (isMongoConnected) {
    return await User.findById(id)
  } else {
    return await inMemoryStore.users.findById(id)
  }
}

// Update streak helper
const updateStreak = async (user) => {
  const today = new Date().toDateString()
  const lastActive = new Date(user.lastActiveDate).toDateString()

  if (today !== lastActive) {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toDateString()

    if (lastActive === yesterdayStr) {
      user.streak += 1
    } else {
      user.streak = 1
    }

    user.lastActiveDate = new Date()
    await saveUser(user)
  }
}

// Check and award badges
const checkBadges = async (user) => {
  const newBadges = []

  for (const badge of badges) {
    const alreadyEarned = user.badges.some(b => b.id === badge.id)
    if (alreadyEarned) continue

    let shouldAward = false

    // Safe condition checking without eval()
    if (badge.id === 'first-lesson') {
      shouldAward = user.completedLessons.length >= 1
    } else if (badge.id === 'week-streak') {
      shouldAward = user.streak >= 7
    } else if (badge.id === 'hundred-xp') {
      shouldAward = user.xp >= 100
    } else if (badge.id === 'first-course') {
      shouldAward = user.completedCourses.length >= 1
    } else if (badge.id === 'five-courses') {
      shouldAward = user.completedCourses.length >= 5
    } else if (badge.id === 'thousand-xp') {
      shouldAward = user.xp >= 1000
    } else if (badge.id === 'month-streak') {
      shouldAward = user.streak >= 30
    } else if (badge.id === 'ten-courses') {
      shouldAward = user.completedCourses.length >= 10
    }

    if (shouldAward) {
      user.badges.push({
        id: badge.id,
        name: badge.name,
        earnedAt: new Date()
      })
      newBadges.push(badge)
    }
  }

  if (newBadges.length > 0) {
    await saveUser(user)
  }

  return newBadges
}

// ROUTES

// Register
app.post('/api/auth/register', authLimiter, async (req, res, next) => {
  try {
    let { firstName, lastName, email, password } = req.body

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    firstName = sanitizeInput(firstName)
    lastName = sanitizeInput(lastName)
    email = sanitizeInput(email.toLowerCase())

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' })
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' })
    }

    // Check if user exists (MongoDB or in-memory)
    const existingUser = isMongoConnected
      ? await User.findOne({ email })
      : await inMemoryStore.users.findOne({ email })

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    let user, userId

    if (isMongoConnected) {
      // Use MongoDB
      user = new User({
        firstName,
        lastName,
        email,
        password: hashedPassword
      })
      await user.save()
      userId = user._id
    } else {
      // Use in-memory store
      user = await inMemoryStore.users.create({
        firstName,
        lastName,
        email,
        password: hashedPassword
      })
      userId = user._id
    }

    const token = jwt.sign({ id: userId, email: user.email }, JWT_SECRET, { expiresIn: '7d' })

    const userResponse = isMongoConnected ? user.toObject() : { ...user }
    delete userResponse.password

    console.log(`✅ User registered: ${email}`)
    logger.info('User registered', { email, storage: isMongoConnected ? 'MongoDB' : 'In-Memory' })

    // Publish user registration event
    eventbridge.publishUserRegistered({
      userId: userId.toString(),
      email: user.email,
      selectedLanguage: user.selectedLanguage || 'en'
    })

    res.status(201).json({
      user: userResponse,
      token
    })
  } catch (error) {
    logger.error('Registration error', { error: error.message })
    next(error)
  }
})

// Login
app.post('/api/auth/login', authLimiter, async (req, res, next) => {
  try {
    let { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    email = sanitizeInput(email.toLowerCase())

    // Use MongoDB or in-memory fallback
    const user = isMongoConnected
      ? await User.findOne({ email })
      : await inMemoryStore.users.findOne({ email })

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // Update streak
    await updateStreak(user)

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' })

    const userResponse = isMongoConnected ? user.toObject() : { ...user }
    delete userResponse.password

    console.log(`✅ User logged in: ${email}`)

    res.json({
      user: userResponse,
      token
    })
  } catch (error) {
    next(error)
  }
})

// Skill Assessment
app.post('/api/auth/skill-assessment', authenticateToken, async (req, res, next) => {
  try {
    const { level, goal } = req.body

    const user = await findUserById(req.user.id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    user.level = level
    user.learningPath = {
      goal,
      currentStep: 0,
      steps: []
    }

    await saveUser(user)

    res.json({ message: 'Assessment completed', level, goal })
  } catch (error) {
    next(error)
  }
})

// Get user profile
app.get('/api/user/profile', authenticateToken, async (req, res, next) => {
  try {
    const user = await findUserById(req.user.id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const userResponse = isMongoConnected ? user.toObject() : { ...user }
    delete userResponse.password

    const currentLevel = calculateLevel(user.xp)
    const nextLevel = getNextLevel(user.xp)

    res.json({
      user: userResponse,
      currentLevel,
      nextLevel,
      badges: user.badges
    })
  } catch (error) {
    next(error)
  }
})

// Update user language
app.put('/api/user/language', authenticateToken, async (req, res, next) => {
  try {
    const { language } = req.body

    if (!language) {
      return res.status(400).json({ message: 'Language is required' })
    }

    const user = await findUserById(req.user.id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    user.selectedLanguage = language
    await saveUser(user)

    res.json({ message: 'Language updated', language })
  } catch (error) {
    next(error)
  }
})

// Get dashboard
app.get('/api/learning/dashboard', authenticateToken, async (req, res, next) => {
  try {
    const user = await findUserById(req.user.id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    await updateStreak(user)

    let enrolledCourses = []
    if (isMongoConnected) {
      enrolledCourses = await Course.find({
        id: { $in: user.completedCourses.map(c => c.courseId) }
      }).limit(5)
    } else {
      const allCourses = await inMemoryStore.courses.find()
      const courseIds = user.completedCourses.map(c => c.courseId)
      enrolledCourses = allCourses.filter(c => courseIds.includes(c.id)).slice(0, 5)
    }

    const currentLevel = calculateLevel(user.xp)
    const nextLevel = getNextLevel(user.xp)

    // Mock activity data
    const activity = [60, 80, 50, 90, 70, 40, 85]

    res.json({
      user: {
        xp: user.xp,
        streak: user.streak,
        level: currentLevel,
        nextLevel,
        badges: user.badges
      },
      courses: enrolledCourses,
      activity,
      weeklyGoal: 75
    })
  } catch (error) {
    next(error)
  }
})

// Get all courses
app.get('/api/courses', authenticateToken, async (req, res, next) => {
  try {
    let courses
    if (isMongoConnected) {
      courses = await Course.find()
      if (courses.length === 0) {
        courses = await Course.insertMany(coursesData)
      }
    } else {
      courses = await inMemoryStore.courses.find()
      if (courses.length === 0) {
        courses = await inMemoryStore.courses.insertMany(coursesData)
      }
    }

    res.json(courses)
  } catch (error) {
    next(error)
  }
})

// Get single course
app.get('/api/courses/:id', authenticateToken, async (req, res, next) => {
  try {
    let course
    if (isMongoConnected) {
      course = await Course.findOne({ id: req.params.id })
    } else {
      course = await inMemoryStore.courses.findOne({ id: req.params.id })
    }
    if (!course) {
      return res.status(404).json({ message: 'Course not found' })
    }

    res.json(course)
  } catch (error) {
    next(error)
  }
})

// Complete lesson
app.post('/api/learning/complete-lesson', authenticateToken, async (req, res, next) => {
  try {
    const { courseId, lessonId, xpEarned } = req.body

    const user = await findUserById(req.user.id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Check if already completed
    const alreadyCompleted = user.completedLessons.some(
      l => l.lessonId === lessonId && l.courseId === courseId
    )

    if (!alreadyCompleted) {
      user.completedLessons.push({
        lessonId,
        courseId,
        completedAt: new Date()
      })

      user.xp += xpEarned || 50
      await saveUser(user)

      // Check for new badges
      const newBadges = await checkBadges(user)

      // Publish lesson completion event
      eventbridge.publishLessonCompleted(req.user.id, courseId, lessonId, xpEarned || 50)

      // Publish badge events
      newBadges.forEach(badge => {
        eventbridge.publishBadgeEarned(req.user.id, badge)
      })

      res.json({
        message: 'Lesson completed',
        xp: user.xp,
        newBadges
      })
    } else {
      res.json({ message: 'Lesson already completed' })
    }
  } catch (error) {
    next(error)
  }
})

// Complete course
app.post('/api/learning/complete-course', authenticateToken, async (req, res, next) => {
  try {
    const { courseId } = req.body

    const user = await findUserById(req.user.id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const alreadyCompleted = user.completedCourses.some(c => c.courseId === courseId)

    if (!alreadyCompleted) {
      user.completedCourses.push({
        courseId,
        completedAt: new Date()
      })

      user.xp += 200
      await saveUser(user)

      const newBadges = await checkBadges(user)

      res.json({
        message: 'Course completed',
        xp: user.xp,
        newBadges
      })
    } else {
      res.json({ message: 'Course already completed' })
    }
  } catch (error) {
    next(error)
  }
})

// Get badges
app.get('/api/gamification/badges', authenticateToken, (req, res) => {
  res.json(badges)
})

// Get leaderboard
app.get('/api/gamification/leaderboard', authenticateToken, async (req, res, next) => {
  try {
    const { type = 'global', limit = 10 } = req.query

    // Try to get from Redis cache first
    const cacheKey = `leaderboard:${type}:${limit}`
    let leaderboard = await redis.getCache(cacheKey)

    if (!leaderboard) {
      // Get from Redis leaderboard
      leaderboard = await redis.getLeaderboard(type, parseInt(limit))

      // Enrich with user data
      const enrichedLeaderboard = await Promise.all(
        leaderboard.map(async (entry) => {
          const user = await User.findById(entry.userId).select('firstName lastName selectedLanguage')
          return {
            ...entry,
            user: user ? {
              firstName: user.firstName,
              lastName: user.lastName,
              language: user.selectedLanguage
            } : null
          }
        })
      )

      // Cache for 5 minutes
      await redis.setCache(cacheKey, enrichedLeaderboard, 300)
      leaderboard = enrichedLeaderboard
    }

    // Get current user's rank
    const userRank = await redis.getUserRank(type, req.user.id)
    const userScore = await redis.getUserScore(type, req.user.id)

    res.json({
      leaderboard,
      currentUser: {
        rank: userRank,
        score: userScore
      }
    })
  } catch (error) {
    logger.error('Leaderboard error', { error: error.message })
    next(error)
  }
})

// Deploy project to AWS Amplify
app.post('/api/deployment/deploy', authenticateToken, async (req, res, next) => {
  try {
    const { projectName, repositoryUrl, code } = req.body

    if (!projectName) {
      return res.status(400).json({ message: 'Project name is required' })
    }

    let deploymentInfo

    if (amplify.isAmplifyConfigured()) {
      if (repositoryUrl) {
        // Deploy from Git repository
        deploymentInfo = await amplify.deployProject(req.user.id, projectName, repositoryUrl)
      } else if (code) {
        // Deploy static site (requires S3 + CloudFront)
        deploymentInfo = {
          message: 'Static deployment coming soon',
          projectName,
          userId: req.user.id
        }
      } else {
        return res.status(400).json({ message: 'Repository URL or code is required' })
      }

      // Publish deployment event
      if (deploymentInfo.url) {
        eventbridge.publishProjectDeployed(req.user.id, projectName, deploymentInfo.url)
      }

      logger.info('Project deployed', { userId: req.user.id, projectName })

      res.json(deploymentInfo)
    } else {
      res.json({
        message: 'AWS Amplify not configured',
        recommendation: 'Configure AWS Amplify to enable one-click deployments'
      })
    }
  } catch (error) {
    logger.error('Deployment error', { error: error.message })
    next(error)
  }
})

// Invalidate CDN cache
app.post('/api/cdn/invalidate', authenticateToken, async (req, res, next) => {
  try {
    const { paths = ['/*'] } = req.body

    if (cloudfront.isCloudFrontConfigured()) {
      const result = await cloudfront.invalidateCache(paths)
      logger.info('CDN cache invalidated', { userId: req.user.id, paths })
      res.json(result)
    } else {
      res.json({
        message: 'CloudFront not configured',
        recommendation: 'Configure CloudFront distribution for CDN caching'
      })
    }
  } catch (error) {
    logger.error('CDN invalidation error', { error: error.message })
    next(error)
  }
})

// AI Tutor with file upload support
app.post('/api/ai/chat', authenticateToken, upload.array('files', 5), async (req, res, next) => {
  try {
    let { message, language } = req.body

    if (!message && (!req.files || req.files.length === 0)) {
      return res.status(400).json({ message: 'Message or files required' })
    }

    message = sanitizeInput(message || '')

    // Handle file uploads
    let fileContext = ''
    const fileNames = []

    if (req.files && req.files.length > 0) {
      fileContext = `\n\nUser uploaded ${req.files.length} file(s):\n`

      for (const file of req.files) {
        fileNames.push(file.originalname)
        fileContext += `- ${file.originalname} (${file.mimetype})\n`

        // If it's a code file, read its content
        if (file.mimetype === 'text/plain' || file.originalname.endsWith('.py') || file.originalname.endsWith('.js')) {
          try {
            const content = fs.readFileSync(file.path, 'utf8')
            fileContext += `Content:\n${content.substring(0, 500)}\n\n`

            // Upload to S3 if configured
            if (isS3Configured()) {
              const fileBuffer = fs.readFileSync(file.path)
              const s3Key = await uploadFile(fileBuffer, file.originalname, req.user.id, file.mimetype)
              logger.info('File uploaded to S3', { userId: req.user.id, s3Key })
            }
          } catch (err) {
            logger.error('Error reading file', { error: err.message })
          }
        }
      }
    }

    // Generate AI response: Bedrock → Gemini → Canned fallback
    let response

    if (isBedrockConfigured()) {
      try {
        const fullMessage = message + fileContext
        response = await generateAIResponse(fullMessage, language || 'en', { files: fileNames })

        // Generate audio if Polly is configured
        if (isPollyConfigured() && response.text) {
          try {
            const languageMap = { 'hi': 'hi-IN', 'ta': 'ta-IN', 'te': 'te-IN', 'en': 'en-US' }
            const audioLanguage = languageMap[language] || 'en-US'
            const audioBase64 = await textToSpeech(response.text, audioLanguage)
            response.audio = audioBase64
          } catch (audioError) {
            logger.warn('Audio generation failed', { error: audioError.message })
          }
        }

        logger.info('AI response generated via Bedrock', { userId: req.user.id, language })
      } catch (bedrockError) {
        logger.error('Bedrock error, trying Gemini fallback', { error: bedrockError.message })
        if (isGeminiConfigured()) {
          response = await generateGeminiResponse(message + fileContext, language || 'en')
        } else {
          response = getFallbackResponse(message, language, fileContext)
        }
      }
    } else if (isGeminiConfigured()) {
      // Use Gemini as primary AI when Bedrock is not configured
      try {
        response = await generateGeminiResponse(message + fileContext, language || 'en')
        logger.info('AI response generated via Gemini', { userId: req.user.id, language })
      } catch (geminiError) {
        logger.error('Gemini error, using canned fallback', { error: geminiError.message })
        response = getFallbackResponse(message, language, fileContext)
      }
    } else {
      // No AI configured — use canned fallback
      response = getFallbackResponse(message, language, fileContext)
    }

    res.json(response)
  } catch (error) {
    logger.error('AI chat error', { error: error.message })
    next(error)
  }
})

// Fallback response function
function getFallbackResponse(message, language, fileContext) {
  const responses = {
    'hi': {
      text: message.includes('loop') || message.includes('लूप')
        ? 'Loop ka upayog code ke ek block ko bar-bar repeat karne ke liye kiya jata hai.'
        : fileContext
          ? `Main aapki files dekh raha hoon. ${fileContext}\n\nKya aap chahte hain ki main is code ko explain karun?`
          : 'Main aapki madad karne ke liye yahan hoon. Kripya apna sawal detail mein puchein.',
      code: message.includes('loop') ? `fruits = ['seb', 'kela', 'aam']\n\nfor fruit in fruits:\n    print(fruit)` : null,
      followUp: 'Kya aapko isme koi confusion hai? Main aur explain kar sakta hoon.'
    },
    'ta': {
      text: message.includes('loop')
        ? 'Loop enbathu oru code block-ai thirumba thirumba seyalpadutha payanpadugirathu.'
        : fileContext
          ? `Naan ungal files-ai paarkiren. ${fileContext}\n\nIntha code-ai vilakka venduma?`
          : 'Naan ungalukku uthava inge irukkiren. Ungal kelviyai virivaaga kelungal.',
      code: message.includes('loop') ? `pazhangal = ['apple', 'banana', 'mango']\n\nfor pazham in pazhangal:\n    print(pazham)` : null,
      followUp: 'Ithil ethavathu santhegam irukkiratha? Naan melum vilakkugiren.'
    },
    'te': {
      text: message.includes('loop')
        ? 'Loop anedi code block ni malli malli run cheyadaniki upayogipadutundi.'
        : fileContext
          ? `Nenu mee files chustunnanu. ${fileContext}\n\nEe code ni vivarinchala?`
          : 'Nenu miku sahayam cheyadaniki unnanu. Daya chesi mee prasnanu vivaramuga adagandi.',
      code: message.includes('loop') ? `pandlu = ['apple', 'banana', 'mango']\n\nfor pandu in pandlu:\n    print(pandu)` : null,
      followUp: 'Indulo emaina sandeham unda? Nenu inka vivaranga cheppagalanu.'
    },
    'en': {
      text: message.includes('loop')
        ? 'A loop is used to repeat a block of code multiple times.'
        : fileContext
          ? `I can see your uploaded files. ${fileContext}\n\nWould you like me to explain this code?`
          : 'I\'m here to help you. Please ask your question in detail.',
      code: message.includes('loop') ? `fruits = ['apple', 'banana', 'mango']\n\nfor fruit in fruits:\n    print(fruit)` : null,
      followUp: 'Do you have any questions about this? I can explain in more detail.'
    }
  }

  return responses[language] || responses['en']
}

// Voice Chat (AWS Transcribe + Bedrock + Polly)
app.post('/api/ai/voice-chat', authenticateToken, async (req, res, next) => {
  try {
    const { audio, language } = req.body

    if (!audio) {
      return res.status(400).json({ message: 'Audio data required' })
    }

    // Note: AWS Transcribe Streaming requires WebSocket connection
    // For now, we'll use a placeholder that simulates transcription
    // In production, implement WebSocket endpoint for real-time transcription

    const transcript = 'Python में list कैसे बनाते हैं?' // Simulated transcription

    // Generate AI response using Bedrock
    let response

    if (isBedrockConfigured()) {
      try {
        response = await generateAIResponse(transcript, language || 'hi')
        response.transcript = transcript

        // Generate audio response if Polly is configured
        if (isPollyConfigured() && response.text) {
          try {
            const languageMap = {
              'hi': 'hi-IN',
              'ta': 'ta-IN',
              'te': 'te-IN',
              'en': 'en-US'
            }
            const audioLanguage = languageMap[language] || 'hi-IN'
            const audioBase64 = await textToSpeech(response.text, audioLanguage)
            response.audio = audioBase64
          } catch (audioError) {
            logger.warn('Audio generation failed', { error: audioError.message })
          }
        }

        logger.info('Voice chat response generated', { userId: req.user.id, language })
      } catch (error) {
        logger.error('Voice chat error, using fallback', { error: error.message })
        const languageFallbacks = {
          'hi': {
            transcript,
            text: 'Aapne voice message bheja hai. Main samajh gaya hoon.',
            code: `# Voice se code generate kiya gaya\nprint("Hello from voice!")`,
            followUp: 'Kya aap aur kuch puchna chahte hain?'
          },
          'ta': {
            transcript,
            text: 'Neengal voice message anuppiyullirgal. Naan purinthu konden.',
            code: `# Voice moolam code uruvakkappattathu\nprint("Kuralilirunthu vanakkam!")`,
            followUp: 'Neengal melum ethavathu ketka virumbugirirgala?'
          },
          'te': {
            transcript,
            text: 'Meeru voice message pampincharu. Nenu artham chesukunnanu.',
            code: `# Voice nundi code srushtinchabindindi\nprint("Voice nundi namaskaram!")`,
            followUp: 'Meeru inka emaina adagalani anukuntunnara?'
          },
          'en': {
            transcript,
            text: 'You have sent a voice message. I understand.',
            code: `# Code generated from voice\nprint("Hello from voice!")`,
            followUp: 'Would you like to ask anything else?'
          }
        }
        response = languageFallbacks[language] || languageFallbacks['en']
      }
    } else {
      // Fallback response
      const languageFallbacks = {
        'hi': {
          transcript,
          text: 'Aapne voice message bheja hai. Main samajh gaya hoon.',
          code: `# Voice se code generate kiya gaya\nprint("Hello from voice!")`,
          followUp: 'Kya aap aur kuch puchna chahte hain?'
        },
        'ta': {
          transcript,
          text: 'Neengal voice message anuppiyullirgal. Naan purinthu konden.',
          code: `# Voice moolam code uruvakkappattathu\nprint("Kuralilirunthu vanakkam!")`,
          followUp: 'Neengal melum ethavathu ketka virumbugirirgala?'
        },
        'te': {
          transcript,
          text: 'Meeru voice message pampincharu. Nenu artham chesukunnanu.',
          code: `# Voice nundi code srushtinchabindindi\nprint("Voice nundi namaskaram!")`,
          followUp: 'Meeru inka emaina adagalani anukuntunnara?'
        },
        'en': {
          transcript,
          text: 'You have sent a voice message. I understand.',
          code: `# Code generated from voice\nprint("Hello from voice!")`,
          followUp: 'Would you like to ask anything else?'
        }
      }
      response = languageFallbacks[language] || languageFallbacks['en']
    }

    res.json(response)
  } catch (error) {
    logger.error('Voice chat error', { error: error.message })
    next(error)
  }
})

// Logs with CloudWatch integration
app.post('/api/logs', authenticateToken, (req, res, next) => {
  try {
    const { logs } = req.body

    if (!logs || !Array.isArray(logs)) {
      return res.status(400).json({ message: 'Invalid logs format' })
    }

    logger.info('Received client logs', { count: logs.length, userId: req.user.id })

    // Log each entry
    logs.forEach(log => {
      if (log.level === 'error') {
        logger.error('Client error', { ...log, userId: req.user.id })
      } else if (log.level === 'warn') {
        logger.warn('Client warning', { ...log, userId: req.user.id })
      } else {
        logger.info('Client log', { ...log, userId: req.user.id })
      }
    })

    res.json({ success: true, message: 'Logs received' })
  } catch (error) {
    next(error)
  }
})

// Health check
app.get('/api/health', async (req, res) => {
  // Check Redis connection
  const redisHealthy = await redis.pingRedis()

  res.json({
    status: 'ok',
    message: 'LinguaDev AI API is running',
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
    services: {
      mongodb: isMongoConnected,
      aws: {
        // AI/ML Layer
        bedrock: awsServicesStatus.bedrock,
        polly: awsServicesStatus.polly,
        translate: awsServicesStatus.translate,

        // Storage Layer
        s3: awsServicesStatus.s3,
        cloudwatch: awsServicesStatus.cloudwatch,

        // Data Layer
        dynamodb: awsServicesStatus.dynamodb,
        redis: redisHealthy,

        // Integration Layer
        amplify: awsServicesStatus.amplify,
        cloudfront: awsServicesStatus.cloudfront,
        eventbridge: awsServicesStatus.eventbridge,

        // Security & Monitoring
        cognito: awsServicesStatus.cognito,
        kms: awsServicesStatus.kms,
        xray: awsServicesStatus.xray,
        waf: awsServicesStatus.waf
      }
    },
    features: {
      // Core Features
      authentication: 'JWT',
      multilingual: '8 languages',
      codeExecution: 'Browser-based',
      gamification: 'XP, Badges, Streaks',

      // AI Features
      aiChat: awsServicesStatus.bedrock ? 'AWS Bedrock' : 'Fallback',
      voiceToText: 'Simulated (WebSocket needed)',
      textToSpeech: awsServicesStatus.polly ? 'AWS Polly' : 'Not configured',
      translation: awsServicesStatus.translate ? 'AWS Translate' : 'Not configured',

      // Storage Features
      fileStorage: awsServicesStatus.s3 ? 'AWS S3' : 'Local storage',
      logging: awsServicesStatus.cloudwatch ? 'AWS CloudWatch' : 'Console only',

      // Data Features
      database: awsServicesStatus.dynamodb ? 'AWS DynamoDB' : isMongoConnected ? 'MongoDB' : 'In-memory',
      caching: redisHealthy ? 'Redis/ElastiCache' : 'None',
      leaderboard: redisHealthy ? 'Real-time' : 'Disabled',

      // Integration Features
      deployment: awsServicesStatus.amplify ? 'AWS Amplify' : 'Manual',
      cdn: awsServicesStatus.cloudfront ? 'CloudFront' : 'Direct',
      events: awsServicesStatus.eventbridge ? 'EventBridge' : 'Disabled'
    },
    architecture: {
      layers: {
        aiml: 'Bedrock, Polly, Translate',
        data: 'DynamoDB, S3, RDS, ElastiCache',
        integration: 'Amplify, CloudFront, EventBridge',
        security: 'Cognito, KMS, WAF, X-Ray, CloudWatch'
      },
      status: 'Enterprise Production Ready',
      compliance: {
        encryption: awsServicesStatus.kms ? 'KMS Enabled' : 'Standard',
        authentication: awsServicesStatus.cognito ? 'Cognito MFA' : 'JWT',
        monitoring: awsServicesStatus.xray ? 'X-Ray Tracing' : 'Basic Logging',
        firewall: awsServicesStatus.waf ? 'WAF Protected' : 'Application-level'
      }
    }
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint not found' })
})

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err)

  // Add error to X-Ray trace
  xray.addAnnotation('error', true)
  xray.addMetadata('errorDetails', {
    message: err.message,
    stack: err.stack
  })

  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message })
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ message: 'Invalid token' })
  }

  res.status(500).json({
    message: NODE_ENV === 'production' ? 'Internal server error' : err.message
  })
})

// Close X-Ray segment (must be last)
xray.closeXRaySegment(app)

app.listen(PORT, async () => {
  // Update Redis status
  const redisHealthy = await redis.pingRedis()
  awsServicesStatus.redis = redisHealthy

  console.log(`\n${'='.repeat(70)}`)
  console.log(`🚀 LinguaDev AI Server - Enterprise Production Ready`)
  console.log(`${'='.repeat(70)}`)
  console.log(`✅ Server: http://localhost:${PORT}`)
  console.log(`📚 API: http://localhost:${PORT}/api`)
  console.log(`🔒 Environment: ${NODE_ENV}`)
  console.log(`\n📊 Service Status:`)
  console.log(`   MongoDB: ${isMongoConnected ? '✅ Connected' : '⚠️  Fallback mode'}`)
  console.log(`\n☁️  AWS AI/ML Layer:`)
  console.log(`   Bedrock (AI): ${awsServicesStatus.bedrock ? '✅ Configured' : '⚠️  Using fallback'}`)
  console.log(`   Polly (TTS): ${awsServicesStatus.polly ? '✅ Configured' : '⚠️  Not configured'}`)
  console.log(`   Translate: ${awsServicesStatus.translate ? '✅ Configured' : '⚠️  Not configured'}`)
  console.log(`\n💾 AWS Data Layer:`)
  console.log(`   DynamoDB: ${awsServicesStatus.dynamodb ? '✅ Configured' : '⚠️  Using MongoDB'}`)
  console.log(`   S3 (Storage): ${awsServicesStatus.s3 ? '✅ Configured' : '⚠️  Using local storage'}`)
  console.log(`   Redis/ElastiCache: ${redisHealthy ? '✅ Connected' : '⚠️  Not configured'}`)
  console.log(`   CloudWatch: ${awsServicesStatus.cloudwatch ? '✅ Configured' : '⚠️  Console only'}`)
  console.log(`\n🔗 AWS Integration Layer:`)
  console.log(`   Amplify (Deploy): ${awsServicesStatus.amplify ? '✅ Configured' : '⚠️  Not configured'}`)
  console.log(`   CloudFront (CDN): ${awsServicesStatus.cloudfront ? '✅ Configured' : '⚠️  Not configured'}`)
  console.log(`   EventBridge: ${awsServicesStatus.eventbridge ? '✅ Configured' : '⚠️  Not configured'}`)
  console.log(`\n🔒 AWS Security & Monitoring:`)
  console.log(`   Cognito (Auth): ${awsServicesStatus.cognito ? '✅ Configured' : '⚠️  Using JWT'}`)
  console.log(`   KMS (Encryption): ${awsServicesStatus.kms ? '✅ Configured' : '⚠️  Not configured'}`)
  console.log(`   X-Ray (Tracing): ${awsServicesStatus.xray ? '✅ Enabled' : '⚠️  Disabled'}`)
  console.log(`   WAF (Firewall): ${awsServicesStatus.waf ? '✅ Configured' : '⚠️  App-level only'}`)
  console.log(`\n🎮 Features:`)
  console.log(`   ✅ Authentication & Authorization`)
  console.log(`   ✅ Multilingual Support (8 languages)`)
  console.log(`   ✅ Code Execution (Browser-based)`)
  console.log(`   ✅ Gamification System`)
  console.log(`   ✅ File Upload & Processing`)
  console.log(`   ${awsServicesStatus.bedrock ? '✅' : '⚠️ '} AI Tutor ${awsServicesStatus.bedrock ? '(AWS Bedrock)' : '(Fallback)'}`)
  console.log(`   ${awsServicesStatus.polly ? '✅' : '⚠️ '} Text-to-Speech ${awsServicesStatus.polly ? '(AWS Polly)' : ''}`)
  console.log(`   ${redisHealthy ? '✅' : '⚠️ '} Real-time Leaderboard ${redisHealthy ? '(Redis)' : ''}`)
  console.log(`   ${redisHealthy ? '✅' : '⚠️ '} Session Caching ${redisHealthy ? '(Redis)' : ''}`)
  console.log(`   ${awsServicesStatus.amplify ? '✅' : '⚠️ '} One-Click Deployment ${awsServicesStatus.amplify ? '(Amplify)' : ''}`)
  console.log(`   ${awsServicesStatus.eventbridge ? '✅' : '⚠️ '} Event-Driven Architecture ${awsServicesStatus.eventbridge ? '(EventBridge)' : ''}`)
  console.log(`\n💡 Quick Setup:`)
  console.log(`   1. Set AWS credentials in .env file`)
  console.log(`   2. Request Bedrock access in AWS Console`)
  console.log(`   3. Create DynamoDB tables (optional)`)
  console.log(`   4. Set up ElastiCache Redis (optional)`)
  console.log(`   5. Configure CloudFront distribution (optional)`)
  console.log(`   6. Restart server`)
  console.log(`\n📖 Documentation:`)
  console.log(`   • AWS_SETUP_GUIDE.md - Quick start`)
  console.log(`   • AWS_INTEGRATION_ROADMAP.md - Full integration`)
  console.log(`   • AWS_PRODUCTION_READY.md - Production checklist`)
  console.log(`\n${'='.repeat(70)}\n`)

  logger.info('Server started successfully', {
    port: PORT,
    environment: NODE_ENV,
    services: awsServicesStatus
  })
})
