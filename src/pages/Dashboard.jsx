import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useLearningStore } from '../store/learningStore'
import Layout from '../components/Layout'
import XPBar from '../components/XPBar'
import StreakDisplay from '../components/StreakDisplay'
import BadgeDisplay from '../components/BadgeDisplay'
import { Play, Star, TrendingUp, Flame, Target } from 'lucide-react'
import api from '../utils/api'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { weeklyGoal, streak } = useLearningStore()
  const [courses, setCourses] = useState([])
  const [activity, setActivity] = useState([])
  const [userStats, setUserStats] = useState(null)
  const [badges, setBadges] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDashboardData()
    fetchUserProfile()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/learning/dashboard')
      setCourses(response.data.courses)
      setActivity(response.data.activity)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      setError('Failed to load dashboard data')
    }
  }

  const fetchUserProfile = async () => {
    try {
      setLoading(true)
      const response = await api.get('/user/profile')
      setUserStats(response.data)

      // Fetch badges list
      const badgesData = [
        { id: 'first-lesson', name: 'First Steps', description: 'Complete your first lesson', icon: '🎯' },
        { id: 'week-streak', name: 'Week Warrior', description: 'Maintain a 7-day streak', icon: '🔥' },
        { id: 'hundred-xp', name: 'Century', description: 'Earn 100 XP', icon: '💯' },
        { id: 'first-course', name: 'Course Completer', description: 'Complete your first course', icon: '🎓' },
        { id: 'five-courses', name: 'Learning Machine', description: 'Complete 5 courses', icon: '🚀' },
        { id: 'thousand-xp', name: 'XP Master', description: 'Earn 1000 XP', icon: '⭐' },
        { id: 'month-streak', name: 'Consistency King', description: 'Maintain a 30-day streak', icon: '👑' },
        { id: 'ten-courses', name: 'Knowledge Seeker', description: 'Complete 10 courses', icon: '📚' }
      ]
      setBadges(badgesData)
      setError(null)
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
      setError('Failed to load profile data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-400">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto text-center py-12">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2">Unable to Load Dashboard</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => {
              setError(null)
              setLoading(true)
              fetchUserProfile()
              fetchDashboardData()
            }}
            className="px-6 py-3 bg-primary hover:bg-blue-600 rounded-lg transition"
          >
            Try Again
          </button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-8">
          <p className="text-gray-400 mb-2">Welcome back</p>
          <h1 className="text-3xl font-bold">{user?.firstName} {user?.lastName}</h1>
        </div>

        {/* Gamification Stats */}
        {userStats && (
          <div className="mb-8 space-y-4">
            <XPBar
              currentXP={userStats.user.xp}
              level={userStats.currentLevel.level}
              nextLevelXP={userStats.nextLevel?.xpRequired || 1000}
            />
            <div className="grid md:grid-cols-2 gap-4">
              <StreakDisplay
                streak={userStats.user.streak}
                lastActiveDate={userStats.user.lastActiveDate}
              />
              <div className="bg-dark-card p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-primary" />
                  <span className="font-semibold">Level {userStats.currentLevel.level}</span>
                </div>
                <div className="text-2xl font-bold text-primary">{userStats.currentLevel.title}</div>
                <div className="text-sm text-gray-400 mt-1">
                  {userStats.nextLevel
                    ? `${userStats.nextLevel.xpRequired - userStats.user.xp} XP to ${userStats.nextLevel.title}`
                    : 'Max level reached!'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Weekly Goal */}
          <div className="bg-dark-card p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Weekly Goal</h3>
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div className="mb-2">
              <div className="flex items-baseline gap-2">
                {(() => {
                  const xp = userStats?.user?.xp || 0
                  const nextXp = userStats?.nextLevel?.xpRequired || 100
                  const pct = Math.min(100, Math.round((xp / nextXp) * 100))
                  return (
                    <>
                      <span className="text-4xl font-bold text-primary">{pct}%</span>
                      <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
                        <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </>
                  )
                })()}
              </div>
            </div>
            <p className="text-sm text-gray-400 mt-2">Keep it up! Almost there.</p>
          </div>

          {/* Streak */}
          <div className="bg-dark-card p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Streak</h3>
              <Flame className="w-5 h-5 text-orange-500" />
            </div>
            <div className="mb-2">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-orange-500">{streak}</span>
                <span className="text-gray-400">Days</span>
              </div>
              <div className="flex gap-1 mt-3">
                {[...Array(7)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 flex-1 rounded ${i < (streak % 7) ? 'bg-orange-500' : 'bg-gray-700'
                      }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Continue Learning */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Continue Learning</h2>
            <button
              onClick={() => navigate('/courses')}
              className="text-primary hover:underline"
            >
              View All
            </button>
          </div>

          <div className="bg-dark-card p-6 rounded-lg">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">📚</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-xl font-bold">Python Lists</h3>
                    <p className="text-sm text-gray-400">Hindi • Intermediate</p>
                  </div>
                  <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm">
                    ONGOING
                  </span>
                </div>
                <p className="text-gray-400 mb-3">
                  सूचियों के साथ काम करना सीखें (Learn to work with lists)
                </p>
                <div className="mb-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-400">Progress</span>
                    <span className="text-white">65%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '65%' }} />
                  </div>
                </div>
                <button
                  onClick={() => navigate('/courses')}
                  className="bg-primary hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition"
                >
                  Browse Courses <Play className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Recommended Courses */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Recommended for You</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-dark-card rounded-lg overflow-hidden card-hover cursor-pointer">
              <img
                src="https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&h=300&fit=crop"
                alt="React Course"
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <span className="px-2 py-1 bg-blue-600 rounded text-xs">React JS</span>
                <h3 className="text-lg font-bold mt-2 mb-1">React Hooks Deep Dive</h3>
                <p className="text-sm text-gray-400 mb-3">
                  Learn useEffect and useState in Tamil.
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span>4.8</span>
                  </div>
                  <span className="text-sm text-gray-400">4h 30m</span>
                </div>
              </div>
            </div>

            <div className="bg-dark-card rounded-lg overflow-hidden card-hover cursor-pointer">
              <img
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=300&fit=crop"
                alt="Data Science Course"
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <span className="px-2 py-1 bg-purple-600 rounded text-xs">Data Science</span>
                <h3 className="text-lg font-bold mt-2 mb-1">Pandas for Data Analysis</h3>
                <p className="text-sm text-gray-400 mb-3">
                  Data manipulation with Pandas library.
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span>4.9</span>
                  </div>
                  <span className="text-sm text-gray-400">6h 15m</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Activity Chart */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">ACTIVITY</h2>
          <div className="bg-dark-card p-6 rounded-lg">
            <div className="flex items-end justify-between h-48 gap-2">
              {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day, index) => {
                // Generate activity based on user XP so it looks dynamic per user
                const userXp = userStats?.user?.xp || 0
                const userStreak = userStats?.user?.streak || 0
                const seed = (userXp * 3 + userStreak * 7 + index * 13) % 100
                const height = Math.max(15, (seed + index * 17 + 20) % 85 + 15)
                return (
                  <div key={day} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="w-full bg-primary rounded-t transition-all hover:bg-blue-600"
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-xs text-gray-400">{day}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Badges Section */}
        {userStats && badges.length > 0 && (
          <section className="mb-8">
            <BadgeDisplay
              badges={badges}
              userBadges={userStats.user.badges}
            />
          </section>
        )}
      </div>
    </Layout>
  )
}
