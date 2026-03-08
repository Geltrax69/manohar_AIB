import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Home, BookOpen, Code, MessageSquare, User, LogOut, Bell, Menu, Settings, Award } from 'lucide-react'
import { useState } from 'react'
import NotificationPanel from './NotificationPanel'

export default function Layout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  const navItems = [
    { icon: Home, label: 'Home', path: '/dashboard' },
    { icon: BookOpen, label: 'Courses', path: '/courses' },
    { icon: Code, label: 'Practice', path: '/practice' },
    { icon: MessageSquare, label: 'AI Tutor', path: '/tutor' },
    { icon: Award, label: 'Certifications', path: '/certifications' },
    { icon: User, label: 'Profile', path: '/profile' }
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  return (
    <div className="min-h-screen bg-dark">
      {/* Top Navigation */}
      <header className="bg-dark-card border-b border-gray-800 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Left Section - Logo & Menu */}
            <div className="flex items-center gap-4 min-w-0">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 hover:bg-dark rounded-lg transition flex-shrink-0"
                aria-label="Toggle menu"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">L</span>
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent hidden sm:block">
                  LinguaDev AI
                </h1>
              </div>
            </div>

            {/* Right Section - User Info & Actions */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* User Name - Hidden on mobile */}
              <div className="hidden lg:flex flex-col items-end mr-2">
                <span className="text-sm font-medium text-white">
                  {user?.firstName} {user?.lastName}
                </span>
                <span className="text-xs text-gray-400">
                  {user?.email}
                </span>
              </div>

              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2.5 hover:bg-dark rounded-lg relative transition group"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5 text-gray-400 group-hover:text-white transition" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                </button>
                {showNotifications && (
                  <NotificationPanel onClose={() => setShowNotifications(false)} />
                )}
              </div>

              {/* Profile Avatar */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="w-10 h-10 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center font-bold cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200 ring-2 ring-transparent hover:ring-primary/50"
                  aria-label="User menu"
                >
                  <span className="text-white text-sm">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </span>
                </button>

                {/* Profile Dropdown */}
                {showProfileMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowProfileMenu(false)}
                    />
                    <div className="absolute right-0 mt-3 w-56 bg-dark-card border border-gray-700 rounded-lg shadow-2xl z-50 overflow-hidden animate-slide-in">
                      {/* User Info in Dropdown */}
                      <div className="px-4 py-3 border-b border-gray-700 bg-dark/50">
                        <p className="text-sm font-medium text-white truncate">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {user?.email}
                        </p>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        <button
                          onClick={() => {
                            navigate('/profile')
                            setShowProfileMenu(false)
                          }}
                          className="w-full px-4 py-2.5 text-left hover:bg-dark flex items-center gap-3 text-gray-300 hover:text-white transition group"
                        >
                          <User className="w-4 h-4 text-gray-400 group-hover:text-primary transition" />
                          <span className="text-sm">My Profile</span>
                        </button>
                        <button
                          onClick={() => {
                            navigate('/settings')
                            setShowProfileMenu(false)
                          }}
                          className="w-full px-4 py-2.5 text-left hover:bg-dark flex items-center gap-3 text-gray-300 hover:text-white transition group"
                        >
                          <Settings className="w-4 h-4 text-gray-400 group-hover:text-primary transition" />
                          <span className="text-sm">Settings</span>
                        </button>
                      </div>

                      {/* Logout */}
                      <div className="border-t border-gray-700 py-2">
                        <button
                          onClick={() => {
                            handleLogout()
                            setShowProfileMenu(false)
                          }}
                          className="w-full px-4 py-2.5 text-left hover:bg-red-500/10 flex items-center gap-3 text-gray-300 hover:text-red-500 transition group"
                        >
                          <LogOut className="w-4 h-4 text-gray-400 group-hover:text-red-500 transition" />
                          <span className="text-sm">Logout</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation - Desktop */}
        <aside className={`${showMobileMenu ? 'block' : 'hidden'} md:block w-64 bg-dark-card border-r border-gray-800 min-h-[calc(100vh-73px)] fixed md:sticky top-[73px] left-0 z-40`}>
          <nav className="p-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path)
                  setShowMobileMenu(false)
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive(item.path)
                    ? 'bg-primary text-white'
                    : 'text-gray-400 hover:bg-dark hover:text-white'
                  }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-dark hover:text-red-500 transition mt-8"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 md:ml-0 pb-20 md:pb-6">
          {children}
        </main>
      </div>

      {/* Bottom Navigation - Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-dark-card border-t border-gray-800 z-50">
        <div className="flex items-center justify-around py-3">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition ${isActive(item.path)
                  ? 'text-primary'
                  : 'text-gray-400'
                }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
