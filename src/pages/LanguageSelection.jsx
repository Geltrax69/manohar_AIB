import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { ArrowLeft, ArrowRight, Search } from 'lucide-react'
import api from '../utils/api'

const languages = [
  { id: 'hi', name: 'HINDI', native: 'हिंदी', image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400&h=300&fit=crop', color: 'from-orange-500 to-red-500' },
  { id: 'ta', name: 'TAMIL', native: 'தமிழ்', image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400&h=300&fit=crop', color: 'from-blue-500 to-cyan-500' },
  { id: 'te', name: 'TELUGU', native: 'తెలుగు', image: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=400&h=300&fit=crop', color: 'from-red-600 to-pink-600' },
  { id: 'kn', name: 'KANNADA', native: 'ಕನ್ನಡ', image: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=400&h=300&fit=crop', color: 'from-yellow-600 to-orange-600' },
  { id: 'bn', name: 'BENGALI', native: 'বাংলা', image: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=400&h=300&fit=crop', color: 'from-green-500 to-emerald-500' },
  { id: 'en', name: 'INTERNATIONAL', native: 'English', image: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=400&h=300&fit=crop', color: 'from-gray-600 to-gray-800' },
  { id: 'mr', name: 'MARATHI', native: 'मराठी', image: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=400&h=300&fit=crop', color: 'from-orange-600 to-yellow-600' },
  { id: 'ml', name: 'MALAYALAM', native: 'മലയാളം', image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400&h=300&fit=crop', color: 'from-green-600 to-teal-600' },
]

export default function LanguageSelection() {
  const navigate = useNavigate()
  const { setLanguage, updateUser } = useAuthStore()
  const [selectedLang, setSelectedLang] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredLanguages = languages.filter(lang =>
    lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lang.native.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleContinue = async () => {
    if (selectedLang) {
      try {
        // Update backend first
        await api.put('/user/language', { language: selectedLang })
        
        // Then update local state
        setLanguage(selectedLang)
        updateUser({ selectedLanguage: selectedLang })
        navigate('/dashboard')
      } catch (error) {
        console.error('Failed to update language:', error)
        // Still navigate but show warning
        setLanguage(selectedLang)
        updateUser({ selectedLanguage: selectedLang })
        navigate('/dashboard')
      }
    }
  }

  return (
    <div className="min-h-screen bg-dark px-6 py-8">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <h1 className="text-4xl font-bold mb-4">Select Language</h1>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Which language do you prefer?</h2>
          <p className="text-gray-400">
            Choose your preferred regional language for coding tutorials and AI assistance.
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for a language"
            className="w-full pl-12 pr-4 py-3 bg-dark-card border border-gray-700 rounded-lg focus:outline-none focus:border-primary"
          />
        </div>

        {/* Language Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {filteredLanguages.map((lang) => (
            <button
              key={lang.id}
              onClick={() => setSelectedLang(lang.id)}
              className={`relative h-40 rounded-lg overflow-hidden transition ${
                selectedLang === lang.id ? 'ring-4 ring-primary' : ''
              }`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${lang.color} opacity-80`} />
              <img 
                src={lang.image} 
                alt={lang.name}
                className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
              />
              <div className="relative h-full flex flex-col items-center justify-center p-4">
                <p className="text-xs font-semibold mb-1">{lang.name}</p>
                <p className="text-2xl font-bold">{lang.native}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          disabled={!selectedLang}
          className="w-full bg-primary hover:bg-blue-600 text-white py-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
