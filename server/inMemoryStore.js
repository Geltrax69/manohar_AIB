/**
 * In-Memory Storage Fallback
 * Used when MongoDB is not available
 */

const users = new Map()
const courses = new Map()
const progress = new Map()

let userIdCounter = 1

const inMemoryStore = {
  // User operations
  users: {
    async create(userData) {
      const id = `user_${userIdCounter++}`
      const user = {
        _id: id,
        ...userData,
        completedLessons: [],
        completedCourses: [],
        badges: [],
        xp: 0,
        level: 'beginner',
        streak: 0,
        lastActiveDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
      users.set(id, user)
      return user
    },

    async findOne(query) {
      for (const [id, user] of users.entries()) {
        if (query.email && user.email === query.email) {
          return user
        }
        if (query._id && user._id === query._id) {
          return user
        }
      }
      return null
    },

    async findById(id) {
      return users.get(id) || null
    },

    async updateOne(query, update) {
      const user = await this.findOne(query)
      if (user) {
        Object.assign(user, update.$set || update)
        user.updatedAt = new Date()
        users.set(user._id, user)
        return { modifiedCount: 1 }
      }
      return { modifiedCount: 0 }
    },

    async save(user) {
      user.updatedAt = new Date()
      users.set(user._id, user)
      return user
    }
  },

  // Course operations
  courses: {
    async find(query = {}) {
      return Array.from(courses.values())
    },

    async findOne(query) {
      for (const [id, course] of courses.entries()) {
        if (query.id && course.id === query.id) {
          return course
        }
      }
      return null
    },

    async insertMany(coursesData) {
      const inserted = []
      for (const course of coursesData) {
        const id = course.id || `course_${courses.size + 1}`
        courses.set(id, { ...course, _id: id })
        inserted.push(courses.get(id))
      }
      return inserted
    }
  },

  // Progress operations
  progress: {
    async create(progressData) {
      const id = `progress_${progress.size + 1}`
      const progressEntry = {
        _id: id,
        ...progressData,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      progress.set(id, progressEntry)
      return progressEntry
    },

    async find(query) {
      const results = []
      for (const [id, entry] of progress.entries()) {
        let matches = true
        for (const [key, value] of Object.entries(query)) {
          if (entry[key] !== value) {
            matches = false
            break
          }
        }
        if (matches) {
          results.push(entry)
        }
      }
      return results
    }
  },

  // Clear all data (for testing)
  clear() {
    users.clear()
    courses.clear()
    progress.clear()
    userIdCounter = 1
  },

  // Get stats
  stats() {
    return {
      users: users.size,
      courses: courses.size,
      progress: progress.size
    }
  }
}

module.exports = inMemoryStore
