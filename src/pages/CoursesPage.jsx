import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { Star, Clock, Play, Search, Filter, X, Languages } from 'lucide-react'
import api from '../utils/api'
import { useAuthStore } from '../store/authStore'

export default function CoursesPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [courses, setCourses] = useState([])
  const [filteredCourses, setFilteredCourses] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState('all')
  const [selectedLevel, setSelectedLevel] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [showRecommended, setShowRecommended] = useState(true)
  const [loading, setLoading] = useState(true)

  // Get user's preferred language
  const getUserLanguage = () => {
    const langMap = {
      'hi': 'Hindi',
      'ta': 'Tamil',
      'te': 'Telugu',
      'kn': 'Kannada',
      'bn': 'Bengali',
      'en': 'English',
      'mr': 'Marathi',
      'ml': 'Malayalam'
    }
    return langMap[user?.selectedLanguage] || 'English'
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  useEffect(() => {
    filterCourses()
  }, [searchQuery, selectedLanguage, selectedLevel, courses, showRecommended])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const response = await api.get('/courses')
      setCourses(response.data)
      setFilteredCourses(response.data)
    } catch (error) {
      console.error('Failed to fetch courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterCourses = () => {
    let filtered = courses

    // Show recommended courses in user's language first
    if (showRecommended && user?.selectedLanguage) {
      const userLang = getUserLanguage()
      filtered = filtered.sort((a, b) => {
        if (a.language === userLang && b.language !== userLang) return -1
        if (a.language !== userLang && b.language === userLang) return 1
        return 0
      })
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Language filter
    if (selectedLanguage !== 'all') {
      filtered = filtered.filter(course => course.language === selectedLanguage)
    }

    // Level filter
    if (selectedLevel !== 'all') {
      filtered = filtered.filter(course => course.level === selectedLevel)
    }

    setFilteredCourses(filtered)
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedLanguage('all')
    setSelectedLevel('all')
  }

  const languages = ['all', ...new Set(courses.map(c => c.language))]
  const levels = ['all', 'beginner', 'intermediate', 'advanced']

  const activeFiltersCount = 
    (selectedLanguage !== 'all' ? 1 : 0) + 
    (selectedLevel !== 'all' ? 1 : 0)

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Explore Courses</h1>
              <p className="text-gray-400">Master programming in your native language</p>
            </div>
            {user?.selectedLanguage && (
              <div className="flex items-center gap-2 px-4 py-2 bg-primary/20 border border-primary rounded-lg">
                <Languages className="w-5 h-5 text-primary" />
                <span className="font-medium">Learning in {getUserLanguage()}</span>
              </div>
            )}
          </div>
          
          {/* Recommended Toggle */}
          {user?.selectedLanguage && (
            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={() => setShowRecommended(!showRecommended)}
                className={`px-4 py-2 rounded-lg transition ${
                  showRecommended 
                    ? 'bg-primary text-white' 
                    : 'bg-dark-card border border-gray-700 text-gray-400'
                }`}
              >
                Recommended for You
              </button>
              <span className="text-sm text-gray-400">
                {showRecommended ? `Showing ${getUserLanguage()} courses first` : 'Showing all courses'}
              </span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-400">Loading courses...</p>
            </div>
          </div>
        ) : (
          <div>
            {/* Search and Filters */}
            <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search courses by name, topic, or language..."
              className="w-full pl-12 pr-4 py-3 bg-dark-card border border-gray-700 rounded-lg focus:outline-none focus:border-primary transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-dark-card border border-gray-700 rounded-lg hover:border-primary transition"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2">
              {selectedLanguage !== 'all' && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/20 border border-primary rounded-lg text-sm">
                  <span>{selectedLanguage}</span>
                  <button onClick={() => setSelectedLanguage('all')}>
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              {selectedLevel !== 'all' && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/20 border border-primary rounded-lg text-sm capitalize">
                  <span>{selectedLevel}</span>
                  <button onClick={() => setSelectedLevel('all')}>
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="px-3 py-1.5 text-sm text-gray-400 hover:text-white transition"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="bg-dark-card border border-gray-700 rounded-lg p-6 animate-slide-in">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Language Filter */}
                <div>
                  <label className="block text-sm font-medium mb-3">Language</label>
                  <div className="space-y-2">
                    {languages.map(lang => (
                      <button
                        key={lang}
                        onClick={() => setSelectedLanguage(lang)}
                        className={`w-full text-left px-4 py-2 rounded-lg transition ${
                          selectedLanguage === lang
                            ? 'bg-primary text-white'
                            : 'bg-dark hover:bg-dark/50 text-gray-400'
                        }`}
                      >
                        {lang === 'all' ? 'All Languages' : lang}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Level Filter */}
                <div>
                  <label className="block text-sm font-medium mb-3">Difficulty Level</label>
                  <div className="space-y-2">
                    {levels.map(level => (
                      <button
                        key={level}
                        onClick={() => setSelectedLevel(level)}
                        className={`w-full text-left px-4 py-2 rounded-lg transition capitalize ${
                          selectedLevel === level
                            ? 'bg-primary text-white'
                            : 'bg-dark hover:bg-dark/50 text-gray-400'
                        }`}
                      >
                        {level === 'all' ? 'All Levels' : level}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-400">
          Showing {filteredCourses.length} of {courses.length} courses
        </div>

        {/* Courses Grid */}
        {filteredCourses.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <div 
                key={course.id}
                className="bg-dark-card rounded-lg overflow-hidden card-hover cursor-pointer group"
                onClick={() => navigate(`/course/${course.id}`)}
              >
                <div className="relative h-40 bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                  <div className="text-6xl opacity-20">📚</div>
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-1 bg-black/50 backdrop-blur-sm rounded text-xs font-semibold">
                      {course.category}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-1 bg-black/50 backdrop-blur-sm rounded text-xs font-semibold capitalize">
                      {course.level}
                    </span>
                  </div>
                </div>
                
                <div className="p-5">
                  <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition">{course.title}</h3>
                  <p className="text-sm text-gray-400 mb-4 line-clamp-2">{course.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span>{course.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{course.totalDuration}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                    <div>
                      <div className="text-xs text-gray-400">{course.language}</div>
                      <div className="text-sm font-medium">{course.lessons?.length || 0} Lessons</div>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/course/${course.id}`)
                      }}
                      className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition"
                    >
                      <Play className="w-4 h-4" />
                      Start
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-bold mb-2">No Courses Available</h3>
            <p className="text-gray-400 mb-4">Check back soon for new courses!</p>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold mb-2">No courses found</h3>
            <p className="text-gray-400 mb-4">Try adjusting your search or filters</p>
            <button
              onClick={clearFilters}
              className="px-6 py-2 bg-primary hover:bg-blue-600 rounded-lg transition"
            >
              Clear Filters
            </button>
          </div>
        )}
          </div>
        )}
      </div>
    </Layout>
  )
}
