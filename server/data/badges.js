// Gamification: Badges and Achievements
const badges = [
  {
    id: 'first-lesson',
    name: 'First Steps',
    description: 'Complete your first lesson',
    icon: '🎯',
    xpRequired: 0,
    condition: 'completedLessons >= 1'
  },
  {
    id: 'week-streak',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '🔥',
    xpRequired: 0,
    condition: 'streak >= 7'
  },
  {
    id: 'hundred-xp',
    name: 'Century',
    description: 'Earn 100 XP',
    icon: '💯',
    xpRequired: 100,
    condition: 'xp >= 100'
  },
  {
    id: 'first-course',
    name: 'Course Completer',
    description: 'Complete your first course',
    icon: '🎓',
    xpRequired: 0,
    condition: 'completedCourses >= 1'
  },
  {
    id: 'five-courses',
    name: 'Learning Machine',
    description: 'Complete 5 courses',
    icon: '🚀',
    xpRequired: 0,
    condition: 'completedCourses >= 5'
  },
  {
    id: 'thousand-xp',
    name: 'XP Master',
    description: 'Earn 1000 XP',
    icon: '⭐',
    xpRequired: 1000,
    condition: 'xp >= 1000'
  },
  {
    id: 'month-streak',
    name: 'Consistency King',
    description: 'Maintain a 30-day streak',
    icon: '👑',
    xpRequired: 0,
    condition: 'streak >= 30'
  },
  {
    id: 'ten-courses',
    name: 'Knowledge Seeker',
    description: 'Complete 10 courses',
    icon: '📚',
    xpRequired: 0,
    condition: 'completedCourses >= 10'
  }
]

// XP Levels
const levels = [
  { level: 1, xpRequired: 0, title: 'Beginner' },
  { level: 2, xpRequired: 100, title: 'Learner' },
  { level: 3, xpRequired: 250, title: 'Apprentice' },
  { level: 4, xpRequired: 500, title: 'Practitioner' },
  { level: 5, xpRequired: 1000, title: 'Expert' },
  { level: 6, xpRequired: 2000, title: 'Master' },
  { level: 7, xpRequired: 4000, title: 'Guru' },
  { level: 8, xpRequired: 8000, title: 'Legend' }
]

function calculateLevel(xp) {
  for (let i = levels.length - 1; i >= 0; i--) {
    if (xp >= levels[i].xpRequired) {
      return levels[i]
    }
  }
  return levels[0]
}

function getNextLevel(currentXp) {
  const currentLevel = calculateLevel(currentXp)
  const nextLevelIndex = levels.findIndex(l => l.level === currentLevel.level) + 1
  return nextLevelIndex < levels.length ? levels[nextLevelIndex] : null
}

module.exports = { badges, levels, calculateLevel, getNextLevel }
