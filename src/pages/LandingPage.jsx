import { useNavigate } from 'react-router-dom'
import { Menu, ArrowRight, Bot, Code, Award } from 'lucide-react'

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-dark">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <Menu className="w-6 h-6 cursor-pointer" />
          <h1 className="text-xl font-bold">LinguaDev AI</h1>
        </div>
        <button 
          onClick={() => navigate('/login')}
          className="text-primary hover:underline"
        >
          Help
        </button>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <div className="mb-6">
            <img 
              src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=400&fit=crop" 
              alt="Code background"
              className="w-full h-64 object-cover rounded-lg opacity-60"
            />
          </div>
          
          <div className="flex gap-2 justify-center mb-6">
            <span className="px-3 py-1 bg-purple-600 rounded text-sm">Python</span>
            <span className="px-3 py-1 bg-purple-700 rounded text-sm">Java</span>
            <span className="px-3 py-1 bg-green-600 rounded text-sm">C++</span>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mb-4">
            <span className="text-primary">✨</span>
            <span>Native Language Support</span>
          </div>

          <h2 className="text-5xl font-bold mb-4">
            Learn to Code in <span className="gradient-text">Your Language</span>
          </h2>

          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Master modern tech stacks in Hindi, Tamil, Telugu, and more. Break the language barrier and start building today.
          </p>

          <button 
            onClick={() => navigate('/register')}
            className="bg-primary hover:bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold flex items-center gap-2 mx-auto transition"
          >
            Get Started Free <ArrowRight className="w-5 h-5" />
          </button>
          
          <p className="text-sm text-gray-500 mt-3">No credit card required</p>
        </div>

        {/* Why LinguaDev Section */}
        <section className="mt-20">
          <h3 className="text-3xl font-bold text-center mb-12">Why LinguaDev?</h3>
          <p className="text-center text-gray-400 mb-12">
            Empowering your journey with localized AI support.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-dark-card p-6 rounded-lg card-hover">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                <Bot className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold mb-2">AI Tutor</h4>
              <p className="text-gray-400">
                24/7 personalized assistance that understands your context.
              </p>
            </div>

            <div className="bg-dark-card p-6 rounded-lg card-hover">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                <Code className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold mb-2">Vernacular Code</h4>
              <p className="text-gray-400">
                Write logic in your native tongue, compile to standard syntax.
              </p>
            </div>

            <div className="bg-dark-card p-6 rounded-lg card-hover">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                <Award className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold mb-2">Certification</h4>
              <p className="text-gray-400">
                Earn industry-recognized certificates to boost your career.
              </p>
            </div>
          </div>
        </section>

        {/* Sign In Link */}
        <div className="text-center mt-16">
          <p className="text-gray-400">
            Already have an account?{' '}
            <button 
              onClick={() => navigate('/login')}
              className="text-primary hover:underline font-semibold"
            >
              Sign in
            </button>
          </p>
        </div>
      </main>
    </div>
  )
}
