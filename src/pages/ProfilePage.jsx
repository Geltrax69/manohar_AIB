import { useState } from 'react'
import Layout from '../components/Layout'
import { useAuthStore } from '../store/authStore'
import { Camera, Mail, Globe, Award, TrendingUp } from 'lucide-react'
import { useToast } from '../components/Toast'
import api from '../utils/api'

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore()
  const toast = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || ''
  })

  const handleSave = async () => {
    try {
      setSaving(true)
      // TODO: Add backend endpoint for profile update
      await new Promise(resolve => setTimeout(resolve, 500))
      updateUser(formData)
      setIsEditing(false)
      toast.success('Profile updated successfully!')
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const achievements = [
    { icon: '🌟', title: 'Week 1 Completed', date: '2 days ago' },
    { icon: '🔥', title: '7 Day Streak', date: '1 week ago' },
    { icon: '🎓', title: 'Python Basics Certified', date: '2 weeks ago' },
    { icon: '🏆', title: 'Top 10 Leaderboard', date: '1 month ago' }
  ]

  const stats = [
    { label: 'Courses Completed', value: '3', icon: Award },
    { label: 'Total Learning Time', value: '24h', icon: TrendingUp },
    { label: 'Current Streak', value: '12 days', icon: '🔥' },
    { label: 'Points Earned', value: '1,650', icon: '⭐' }
  ]

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-dark-card rounded-lg p-8 mb-6">
          <div className="flex items-start gap-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center text-3xl font-bold">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center hover:bg-blue-600 transition">
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="px-4 py-2 bg-dark border border-gray-700 rounded-lg focus:outline-none focus:border-primary"
                      placeholder="First Name"
                    />
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="px-4 py-2 bg-dark border border-gray-700 rounded-lg focus:outline-none focus:border-primary"
                      placeholder="Last Name"
                    />
                  </div>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 bg-dark border border-gray-700 rounded-lg focus:outline-none focus:border-primary"
                    placeholder="Email"
                  />
                  <div className="flex gap-2">
                    <button 
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-primary hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold transition disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button 
                      onClick={() => setIsEditing(false)}
                      disabled={saving}
                      className="bg-dark hover:bg-gray-800 text-white px-6 py-2 rounded-lg font-semibold transition disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-2xl font-bold mb-2">
                    {user?.firstName} {user?.lastName}
                  </h1>
                  <div className="flex items-center gap-4 text-gray-400 mb-4">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm">{user?.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      <span className="text-sm">{user?.selectedLanguage || 'Hindi'}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="bg-dark hover:bg-gray-800 text-white px-6 py-2 rounded-lg font-semibold transition"
                  >
                    Edit Profile
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-dark-card p-4 rounded-lg">
              <div className="text-2xl mb-2">
                {typeof stat.icon === 'string' ? stat.icon : <stat.icon className="w-6 h-6 text-primary" />}
              </div>
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Achievements */}
        <div className="bg-dark-card rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Achievements</h2>
          <div className="space-y-3">
            {achievements.map((achievement, index) => (
              <div 
                key={index}
                className="flex items-center gap-4 p-3 bg-dark rounded-lg hover:bg-gray-800 transition"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center text-2xl">
                  {achievement.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{achievement.title}</h3>
                  <p className="text-sm text-gray-400">{achievement.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}
