# LinguaDev AI - Design Specification

## 1. System Architecture Overview

LinguaDev AI follows a microservices architecture deployed on AWS, designed for scalability, reliability, and low-latency access across India.

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │  React Native    │  │  Web Browser     │  │  Offline     │  │
│  │  Mobile App      │  │  (Chrome, FF)    │  │  Cache       │  │
│  └──────────────────┘  └──────────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    API GATEWAY LAYER                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  AWS API Gateway (REST + GraphQL)                        │  │
│  │  Rate Limiting | CORS | Request Validation              │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND SERVICES                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Auth Service │  │ Learning     │  │ Developer Tools      │  │
│  │ (Lambda)     │  │ Service      │  │ Service (Lambda)     │  │
│  │              │  │ (Lambda)     │  │                      │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ AI/ML        │  │ Analytics    │  │ Content Management   │  │
│  │ Service      │  │ Service      │  │ Service (Lambda)     │  │
│  │ (Lambda)     │  │ (Lambda)     │  │                      │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    DATA LAYER                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ DynamoDB     │  │ S3           │  │ RDS (PostgreSQL)     │  │
│  │ (User Data)  │  │ (Content)    │  │ (Analytics)          │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    AI/ML LAYER                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ AWS Bedrock  │  │ SageMaker    │  │ Hugging Face Models  │  │
│  │ (GenAI)      │  │ (Training)   │  │ (Fine-tuned)         │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    INTEGRATION LAYER                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ CloudFront   │  │ Cognito      │  │ CloudWatch           │  │
│  │ (CDN)        │  │ (Auth)       │  │ (Monitoring)         │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Data Models

### 2.1 User Entity
```
User {
  userId: UUID (PK)
  email: String (unique)
  phone: String (unique, optional)
  passwordHash: String (encrypted)
  firstName: String
  lastName: String
  profilePicture: URL
  preferredLanguage: Enum (hi, ta, te, kn, bn, mr, gu, pa, or, ur)
  skillLevel: Enum (beginner, intermediate, advanced)
  learningGoals: String[]
  timezone: String
  createdAt: Timestamp
  updatedAt: Timestamp
  lastLoginAt: Timestamp
  isActive: Boolean
  notificationPreferences: {
    emailNotifications: Boolean
    pushNotifications: Boolean
    weeklyDigest: Boolean
  }
}
```

### 2.2 Learning Path Entity
```
LearningPath {
  pathId: UUID (PK)
  userId: UUID (FK)
  goalId: UUID (FK)
  coursesInPath: Course[]
  currentCourseIndex: Integer
  progressPercentage: Float (0-100)
  estimatedCompletionDate: Date
  createdAt: Timestamp
  updatedAt: Timestamp
  status: Enum (active, paused, completed)
}
```

### 2.3 Course Entity
```
Course {
  courseId: UUID (PK)
  title: String
  description: String
  language: String
  difficulty: Enum (beginner, intermediate, advanced)
  duration: Integer (hours)
  lessons: Lesson[]
  prerequisites: CourseId[]
  createdAt: Timestamp
  updatedAt: Timestamp
  version: Integer
}
```

### 2.4 Lesson Entity
```
Lesson {
  lessonId: UUID (PK)
  courseId: UUID (FK)
  title: String
  description: String
  content: {
    text: String (markdown)
    codeExamples: CodeExample[]
    videos: Video[] (future)
    resources: Resource[]
  }
  quiz: Quiz
  practiceProblems: Problem[]
  estimatedDuration: Integer (minutes)
  order: Integer
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

### 2.5 Progress Entity
```
Progress {
  progressId: UUID (PK)
  userId: UUID (FK)
  lessonId: UUID (FK)
  status: Enum (not_started, in_progress, completed)
  quizScore: Float (0-100)
  problemsSolved: Integer
  timeSpent: Integer (seconds)
  completedAt: Timestamp
  lastAccessedAt: Timestamp
}
```

### 2.6 Challenge Entity
```
Challenge {
  challengeId: UUID (PK)
  title: String
  description: String
  difficulty: Enum (easy, medium, hard)
  reward: Integer (points)
  startDate: Timestamp
  endDate: Timestamp
  problemStatement: String
  testCases: TestCase[]
  submissions: Submission[]
  leaderboard: LeaderboardEntry[]
}
```

### 2.7 Achievement Entity
```
Achievement {
  achievementId: UUID (PK)
  userId: UUID (FK)
  type: Enum (badge, certificate, milestone)
  name: String
  description: String
  icon: URL
  earnedAt: Timestamp
  metadata: {
    lessonId: UUID (optional)
    challengeId: UUID (optional)
    streak: Integer (optional)
  }
}
```

---

## 3. API Design

### 3.1 Authentication Endpoints

**POST /auth/register**
```json
Request:
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "firstName": "Priya",
  "lastName": "Kumar",
  "preferredLanguage": "hi"
}

Response (201):
{
  "userId": "uuid",
  "email": "user@example.com",
  "token": "jwt_token",
  "expiresIn": 86400
}
```

**POST /auth/login**
```json
Request:
{
  "email": "user@example.com",
  "password": "SecurePass123"
}

Response (200):
{
  "userId": "uuid",
  "token": "jwt_token",
  "expiresIn": 86400
}
```

### 3.2 Learning Endpoints

**GET /learning/assessment**
```json
Response (200):
{
  "quizId": "uuid",
  "questions": [
    {
      "id": "q1",
      "text": "What is a variable?",
      "options": ["A", "B", "C", "D"],
      "language": "hi"
    }
  ]
}
```

**POST /learning/assessment/submit**
```json
Request:
{
  "quizId": "uuid",
  "answers": {
    "q1": "A",
    "q2": "C"
  }
}

Response (200):
{
  "score": 85,
  "skillLevel": "intermediate",
  "recommendedPath": {
    "pathId": "uuid",
    "courses": [...]
  }
}
```

**GET /learning/path/:pathId**
```json
Response (200):
{
  "pathId": "uuid",
  "courses": [...],
  "progress": 45,
  "estimatedCompletion": "2024-03-15"
}
```

**GET /learning/lesson/:lessonId**
```json
Response (200):
{
  "lessonId": "uuid",
  "title": "Python Lists",
  "content": {...},
  "quiz": {...},
  "problems": [...]
}
```

### 3.3 AI Tutor Endpoints

**POST /ai/tutor/chat**
```json
Request:
{
  "message": "Python में list कैसे बनाते हैं?",
  "language": "hi",
  "context": {
    "lessonId": "uuid",
    "conversationId": "uuid"
  }
}

Response (200):
{
  "response": "बहुत अच्छा सवाल...",
  "codeExample": "fruits = ['आम', 'केला']",
  "relatedResources": [...]
}
```

### 3.4 Code Editor Endpoints

**POST /editor/execute**
```json
Request:
{
  "code": "print('Hello')",
  "language": "python",
  "timeout": 5
}

Response (200):
{
  "output": "Hello",
  "executionTime": 0.123,
  "status": "success"
}
```

**POST /editor/submit**
```json
Request:
{
  "problemId": "uuid",
  "code": "def solve(): ...",
  "language": "python"
}

Response (200):
{
  "passed": true,
  "testsPassed": 5,
  "testsTotal": 5,
  "feedback": "Great solution!",
  "pointsEarned": 20
}
```

### 3.5 Developer Tools Endpoints

**POST /dev/generate-code**
```json
Request:
{
  "prompt": "Create a REST API endpoint for user registration",
  "language": "python",
  "framework": "fastapi"
}

Response (200):
{
  "code": "@app.post('/register')...",
  "explanation": "This endpoint...",
  "testCases": [...]
}
```

**POST /dev/debug**
```json
Request:
{
  "code": "def buggy(): ...",
  "language": "python",
  "error": "IndexError: list index out of range"
}

Response (200):
{
  "bugs": [
    {
      "line": 5,
      "issue": "Array index out of bounds",
      "fix": "Check array length before accessing",
      "correctedCode": "..."
    }
  ]
}
```

### 3.6 Analytics Endpoints

**GET /analytics/dashboard**
```json
Response (200):
{
  "learningVelocity": 4.2,
  "lessonsCompleted": 12,
  "averageTimePerLesson": 28,
  "quizPerformance": 82,
  "skillBreakdown": {...},
  "recommendations": [...]
}
```

---

## 4. Frontend Architecture

### 4.1 Component Structure (React Native)

```
App/
├── screens/
│   ├── Auth/
│   │   ├── LoginScreen
│   │   ├── RegisterScreen
│   │   └── OnboardingScreen
│   ├── Learning/
│   │   ├── DashboardScreen
│   │   ├── LessonScreen
│   │   ├── QuizScreen
│   │   └── PracticeScreen
│   ├── Tutor/
│   │   └── ChatScreen
│   ├── Editor/
│   │   └── CodeEditorScreen
│   ├── Challenges/
│   │   ├── ChallengesListScreen
│   │   ├── ChallengeDetailScreen
│   │   └── LeaderboardScreen
│   ├── Developer/
│   │   ├── CodeGenerationScreen
│   │   ├── DebuggingScreen
│   │   └── OptimizationScreen
│   ├── Analytics/
│   │   └── ProgressDashboardScreen
│   └── Profile/
│       └── ProfileScreen
├── components/
│   ├── common/
│   │   ├── Header
│   │   ├── Footer
│   │   ├── Button
│   │   ├── Card
│   │   └── Modal
│   ├── learning/
│   │   ├── LessonCard
│   │   ├── ProgressBar
│   │   └── QuizQuestion
│   ├── editor/
│   │   ├── CodeEditor
│   │   ├── OutputPanel
│   │   └── SuggestionPanel
│   └── tutor/
│       ├── ChatBubble
│       ├── CodeBlock
│       └── TypingIndicator
├── services/
│   ├── api.ts
│   ├── auth.ts
│   ├── learning.ts
│   ├── tutor.ts
│   ├── editor.ts
│   └── analytics.ts
├── store/
│   ├── authSlice.ts
│   ├── learningSlice.ts
│   ├── uiSlice.ts
│   └── store.ts
├── utils/
│   ├── constants.ts
│   ├── helpers.ts
│   └── validators.ts
└── i18n/
    ├── en.json
    ├── hi.json
    ├── ta.json
    └── ...
```

### 4.2 State Management (Redux)

```
Store:
├── auth
│   ├── user
│   ├── token
│   ├── isAuthenticated
│   └── loading
├── learning
│   ├── currentPath
│   ├── currentLesson
│   ├── progress
│   └── achievements
├── ui
│   ├── language
│   ├── theme
│   ├── notifications
│   └── modals
└── editor
    ├── code
    ├── output
    ├── suggestions
    └── errors
```

---

## 5. Backend Architecture

### 5.1 Lambda Functions

**Authentication Service**
- `auth-register`: User registration
- `auth-login`: User login
- `auth-refresh`: Token refresh
- `auth-logout`: User logout

**Learning Service**
- `learning-assessment`: Skill assessment
- `learning-generate-path`: Generate learning path
- `learning-get-lesson`: Fetch lesson content
- `learning-submit-quiz`: Submit quiz answers
- `learning-update-progress`: Update progress

**AI/ML Service**
- `ai-tutor-chat`: Conversational AI
- `ai-code-generation`: Generate code
- `ai-debugging`: Debug code
- `ai-optimization`: Optimize code

**Developer Tools Service**
- `dev-code-review`: Review submitted code
- `dev-generate-docs`: Generate documentation
- `dev-collaboration`: Handle team collaboration

**Analytics Service**
- `analytics-track-event`: Track user events
- `analytics-generate-report`: Generate progress report
- `analytics-update-leaderboard`: Update leaderboard

### 5.2 Database Schema (DynamoDB)

**Users Table**
- PK: userId
- GSI: email, phone

**LearningPaths Table**
- PK: pathId
- GSI: userId

**Progress Table**
- PK: progressId
- GSI: userId, lessonId

**Achievements Table**
- PK: achievementId
- GSI: userId

**Challenges Table**
- PK: challengeId
- GSI: startDate

---

## 6. AI/ML Design

### 6.1 Bedrock Integration

**Claude Model Usage**
- Conversational AI tutor
- Code explanation
- Doubt resolution
- Feedback generation

**Code Llama Model Usage**
- Code generation
- Code completion
- Bug detection
- Code optimization

### 6.2 SageMaker Fine-tuning

**Custom Models**
- Fine-tune on Indian language datasets
- Optimize for low-latency inference
- Deploy as SageMaker endpoints

### 6.3 Hugging Face Models

**Pre-trained Models**
- Multilingual BERT for NLP
- CodeBERT for code understanding
- mBERT for translation

---

## 7. Security Design

### 7.1 Authentication Flow

```
User Login
    ↓
AWS Cognito
    ↓
JWT Token Generation
    ↓
Token Stored (Secure HttpOnly Cookie)
    ↓
API Requests with Token
    ↓
Token Validation (API Gateway)
    ↓
Request Processing
```

### 7.2 Data Encryption

- **At Rest**: AES-256 encryption in DynamoDB
- **In Transit**: TLS 1.3 for all connections
- **PII**: Encrypted separately with KMS

### 7.3 API Security

- Rate limiting: 100 requests/minute per user
- CORS: Whitelist allowed origins
- Input validation: All inputs sanitized
- SQL injection prevention: Parameterized queries

---

## 8. Performance Optimization

### 8.1 Caching Strategy

- **CloudFront**: Cache static assets (1 hour)
- **DynamoDB DAX**: Cache frequently accessed data (5 minutes)
- **Redis**: Cache session data (30 minutes)
- **Client-side**: Cache lessons and content (offline mode)

### 8.2 Database Optimization

- Indexes on frequently queried fields
- Partition key design for even distribution
- Query optimization for complex operations
- Connection pooling for database

### 8.3 API Optimization

- Pagination for large datasets
- GraphQL for efficient data fetching
- Compression (gzip) for responses
- Lazy loading for content

---

## 9. Deployment Architecture

### 9.1 Infrastructure as Code (CloudFormation)

```yaml
Resources:
  - VPC with public/private subnets
  - API Gateway
  - Lambda functions
  - DynamoDB tables
  - S3 buckets
  - RDS instance
  - CloudFront distribution
  - Cognito user pool
  - CloudWatch monitoring
```

### 9.2 CI/CD Pipeline

```
GitHub Push
    ↓
GitHub Actions Trigger
    ↓
Run Tests & Linting
    ↓
Build Docker Image
    ↓
Push to ECR
    ↓
Deploy to Lambda/ECS
    ↓
Run Integration Tests
    ↓
Deploy to Production
```

### 9.3 Monitoring & Logging

- CloudWatch for logs and metrics
- X-Ray for distributed tracing
- DataDog for APM
- Alerts for critical issues

---

## 10. Correctness Properties

### CP-1: Data Consistency
- All user data changes are atomic
- Progress updates are consistent
- Leaderboard calculations are accurate
- No race conditions in concurrent updates

### CP-2: Authentication & Authorization
- Only authenticated users can access protected resources
- Users can only access their own data
- Role-based access control enforced
- Session tokens expire correctly

### CP-3: Code Execution Safety
- User code runs in isolated sandbox
- No access to system resources
- Execution timeout enforced
- Output captured safely

### CP-4: AI Response Quality
- Tutor responses are contextually relevant
- Code generation produces working code
- Debugging identifies real issues
- Optimization suggestions improve performance

### CP-5: Offline Functionality
- Offline changes sync correctly when online
- No data loss during offline periods
- Conflict resolution for concurrent edits
- Storage limits enforced

### CP-6: Gamification Accuracy
- Points awarded correctly
- Leaderboard rankings accurate
- Badges awarded for correct achievements
- Streaks calculated correctly

### CP-7: Analytics Accuracy
- Progress metrics calculated correctly
- Learning velocity computed accurately
- Skill mastery percentages correct
- Reports generated with accurate data

### CP-8: Performance Guarantees
- API responses within SLA
- Page loads within time limits
- Database queries complete quickly
- No memory leaks in long sessions

### CP-9: Security Guarantees
- All data encrypted at rest and in transit
- No unauthorized access to user data
- SQL injection prevented
- XSS attacks prevented

### CP-10: Accessibility Compliance
- WCAG 2.1 AA standards met
- Keyboard navigation works
- Screen readers compatible
- Color contrast ratios correct

---

## 11. Error Handling & Recovery

### 11.1 Error Categories

**User Errors**
- Invalid input (validation error)
- Authentication failure
- Authorization failure
- Resource not found

**System Errors**
- Database connection failure
- API timeout
- Service unavailable
- Internal server error

### 11.2 Recovery Strategies

- Automatic retry for transient failures
- Graceful degradation for partial failures
- User-friendly error messages in native language
- Error logging for debugging

---

## 12. Testing Strategy

### 12.1 Unit Tests
- Test individual functions
- Mock external dependencies
- Target 80%+ code coverage

### 12.2 Integration Tests
- Test API endpoints
- Test database operations
- Test service interactions

### 12.3 End-to-End Tests
- Test complete user workflows
- Test across different languages
- Test offline functionality

### 12.4 Performance Tests
- Load testing (100K concurrent users)
- Stress testing (peak load)
- Endurance testing (24-hour run)

### 12.5 Security Tests
- Penetration testing
- SQL injection testing
- XSS testing
- Authentication testing

---

## 13. Scalability Design

### 13.1 Horizontal Scaling
- Stateless Lambda functions
- Auto-scaling groups
- Load balancing across instances

### 13.2 Vertical Scaling
- Database read replicas
- Caching layers
- CDN for static content

### 13.3 Data Scaling
- Partition strategy for large tables
- Archive old data
- Compression for storage

---

## 14. Disaster Recovery

### 14.1 Backup Strategy
- Daily automated backups
- Point-in-time recovery
- Cross-region replication

### 14.2 Recovery Time Objectives (RTO)
- Critical services: <15 minutes
- Non-critical services: <1 hour

### 14.3 Recovery Point Objectives (RPO)
- Critical data: <5 minutes
- Non-critical data: <1 hour
