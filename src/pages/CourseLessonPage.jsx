import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../components/Layout'
import { ArrowLeft, Play, CheckCircle, Lock, ChevronRight, BookOpen, Code, FileText, Mic, Send, Bot, User, MessageSquare } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useToast } from '../components/Toast'

export default function CourseLessonPage() {
  const navigate = useNavigate()
  const { courseId } = useParams()
  const { user } = useAuthStore()
  const toast = useToast()

  const [currentLesson, setCurrentLesson] = useState(0)
  const [completedLessons, setCompletedLessons] = useState([0, 1])
  const [activeSidebarTab, setActiveSidebarTab] = useState('tutor') // 'content' or 'tutor'

  // AI Tutor State
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      text: user?.selectedLanguage === 'ta' ? 'வணக்கம்! நான் உங்கள் வீடியோ உதவியாளர். இந்த வீடியோவில் உங்களுக்கு ஏதாவது சந்தேகம் உள்ளதா?' :
        user?.selectedLanguage === 'te' ? 'నమస్కారం! నేను మీ వీడియో అసిస్టెంట్‌ని. ఈ వీడియోలో మీకు ఏదైనా సందేహం ఉందా?' :
          user?.selectedLanguage === 'hi' ? 'नमस्ते! मैं आपका वीडियो सहायक हूँ। क्या आपको इस वीडियो में कोई संदेह है?' :
            'Hello! I am your video assistant. Do you have any doubts about this video?',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const messagesEndRef = useRef(null)
  const recognitionRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false

      // Map user language to BCP-47 tag
      const langMap = { 'hi': 'hi-IN', 'ta': 'ta-IN', 'te': 'te-IN', 'en': 'en-IN' }
      recognition.lang = langMap[user?.selectedLanguage] || 'en-US'

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        setInput(prev => prev + ' ' + transcript)
        setIsRecording(false)
        toast.success('Audio transcribed successfully!')
      }

      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error)
        setIsRecording(false)
        if (event.error !== 'no-speech') {
          toast.error('Microphone error: ' + event.error)
        }
      }

      recognition.onend = () => {
        setIsRecording(false)
      }

      recognitionRef.current = recognition
    }
  }, [user?.selectedLanguage])

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop()
      setIsRecording(false)
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.start()
        setIsRecording(true)
        toast.info('🎤 Listening in your native language...', { duration: 3000 })
      } else {
        toast.error('Your browser does not support Speech Recognition. Please use Chrome.')
      }
    }
  }

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage = { id: Date.now(), type: 'user', text: input }
    setMessages(prev => [...prev, userMessage])
    const currentInput = input.toLowerCase()
    setInput('')
    setIsTyping(true)

    // Simulate AI response based on video context
    await new Promise(resolve => setTimeout(resolve, 1500))

    let aiResponseText = ''
    if (user?.selectedLanguage === 'ta') {
      aiResponseText = `"${currentLessonData.title}" பற்றிய நல்ல கேள்வி. Primary Data Type என்பது அடிப்படைக் தரவு வகைகளாகும், அதாவது எண்கள் (int, float) மற்றும் சரங்கள் (strings). வீடியோவில் 04:12 நிமிடத்தில் இது விளக்கப்பட்டுள்ளது! வேறு ஏதேனும் சந்தேகம் உள்ளதா?`
    } else if (user?.selectedLanguage === 'te') {
      aiResponseText = `"${currentLessonData.title}" గురించి మంచి ప్రశ్న. Primary Data Type అంటే ప్రాథమిక డేటా రకాలు, అనగా సంఖ్యలు (int, float) మరియు స్ట్రింగ్స్ (strings). వీడియోలో 04:12 నిమిషం దగ్గర ఇది వివరించబడింది! మీకు ఇంకేమైనా సందేహం ఉందా?`
    } else if (user?.selectedLanguage === 'hi') {
      aiResponseText = `"${currentLessonData.title}" के बारे में बढ़िया सवाल! प्राइमरी डेटा टाइप बेसिक वैल्यूज होते हैं, जैसे नंबर (int, float) और टेक्स्ट (strings)। वीडियो में 04:12 मिनट पर सर ने इसे क्लियर किया है। क्या आप एक उदाहरण देखना चाहते हैं?`
    } else {
      aiResponseText = `Great question regarding "${currentLessonData.title}". Primary Data Types are the basic built-in types like integers, floats, and strings. This is explained precisely at the 04:12 mark in the video. Want to see an example?`
    }

    setMessages(prev => [...prev, { id: Date.now() + 1, type: 'ai', text: aiResponseText }])
    setIsTyping(false)
  }

  const course = {
    id: courseId || '1',
    title: 'Python Basics (Hindi)',
    description: 'Learn variables, loops and functions explained in Hindi',
    instructor: 'Rahul Sharma',
    totalLessons: 24,
    duration: '6h 30m'
  }

  const lessons = [
    { id: 0, title: 'Introduction to Python', duration: '10:30', type: 'video', completed: true },
    { id: 1, title: 'Variables and Data Types', duration: '15:45', type: 'video', completed: true },
    { id: 2, title: 'Working with Strings', duration: '12:20', type: 'video', completed: false },
    { id: 3, title: 'Practice: Variables', duration: '8:00', type: 'practice', completed: false },
    { id: 4, title: 'Lists and Tuples', duration: '18:30', type: 'video', completed: false },
    { id: 5, title: 'Dictionaries', duration: '14:15', type: 'video', completed: false },
    { id: 6, title: 'Practice: Data Structures', duration: '10:00', type: 'practice', completed: false },
    { id: 7, title: 'Loops - For and While', duration: '16:40', type: 'video', completed: false },
    { id: 8, title: 'Conditional Statements', duration: '13:25', type: 'video', completed: false },
    { id: 9, title: 'Functions', duration: '20:10', type: 'video', completed: false },
    { id: 10, title: 'Quiz: Python Basics', duration: '15:00', type: 'quiz', completed: false }
  ]

  const currentLessonData = lessons[currentLesson]

  const handleLessonComplete = () => {
    if (!completedLessons.includes(currentLesson)) {
      setCompletedLessons([...completedLessons, currentLesson])
    }
    if (currentLesson < lessons.length - 1) {
      setCurrentLesson(currentLesson + 1)
    }
  }

  const getIcon = (type) => {
    switch (type) {
      case 'video': return <Play className="w-4 h-4" />
      case 'practice': return <Code className="w-4 h-4" />
      case 'quiz': return <FileText className="w-4 h-4" />
      default: return <BookOpen className="w-4 h-4" />
    }
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/courses')}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Courses
        </button>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Video Player */}
            <div className="bg-dark-card rounded-lg overflow-hidden mb-6">
              <div className="relative bg-black aspect-video flex items-center justify-center">
                {/* Placeholder for video player */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-600/20" />
                <button className="relative z-10 w-20 h-20 bg-primary rounded-full flex items-center justify-center hover:bg-blue-600 transition">
                  <Play className="w-10 h-10 ml-1" />
                </button>
                <div className="absolute bottom-4 left-4 bg-black/80 px-3 py-1 rounded text-sm">
                  {currentLessonData.duration}
                </div>
              </div>

              {/* Lesson Info */}
              <div className="p-6">
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                  <span>Lesson {currentLesson + 1} of {lessons.length}</span>
                  <span>•</span>
                  <span>{currentLessonData.duration}</span>
                </div>
                <h1 className="text-2xl font-bold mb-3">{currentLessonData.title}</h1>
                <p className="text-gray-400 mb-4">
                  इस पाठ में, हम Python में {currentLessonData.title.toLowerCase()} के बारे में सीखेंगे।
                  यह शुरुआती लोगों के लिए एक महत्वपूर्ण अवधारणा है।
                </p>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleLessonComplete}
                    className="bg-primary hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Mark as Complete
                  </button>
                  {currentLesson < lessons.length - 1 && (
                    <button
                      onClick={() => setCurrentLesson(currentLesson + 1)}
                      className="bg-dark hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition"
                    >
                      Next Lesson
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Lesson Description */}
            <div className="bg-dark-card rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">About this Lesson</h2>
              <div className="space-y-3 text-gray-400">
                <p>
                  In this lesson, you'll learn the fundamentals of {currentLessonData.title.toLowerCase()} in Python.
                  We'll cover practical examples and best practices.
                </p>
                <p>
                  इस पाठ में आप सीखेंगे:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Basic concepts and syntax</li>
                  <li>Practical examples with code</li>
                  <li>Common mistakes to avoid</li>
                  <li>Best practices and tips</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Sidebar - Tabs: Content vs AI Tutor */}
          <div className="lg:col-span-1 h-[600px] flex flex-col pt-12 lg:pt-0">
            <div className="bg-dark-card rounded-lg border border-gray-700 flex flex-col h-full sticky top-6 shadow-xl">

              {/* Tabs Header */}
              <div className="flex border-b border-gray-700">
                <button
                  onClick={() => setActiveSidebarTab('tutor')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition ${activeSidebarTab === 'tutor' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}
                >
                  <MessageSquare className="w-4 h-4" />
                  Ask AI Tutor
                </button>
                <button
                  onClick={() => setActiveSidebarTab('content')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition ${activeSidebarTab === 'content' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}
                >
                  <BookOpen className="w-4 h-4" />
                  Course Content
                </button>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-hidden relative">

                {/* AI Tutor Tab */}
                {activeSidebarTab === 'tutor' && (
                  <div className="absolute inset-0 flex flex-col">
                    <div className="flex-1 p-4 overflow-y-auto space-y-4">
                      {messages.map((message) => (
                        <div key={message.id} className={`flex gap-3 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.type === 'user' ? 'bg-primary' : 'bg-purple-600'}`}>
                            {message.type === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                          </div>
                          <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${message.type === 'user' ? 'bg-primary text-white rounded-tr-none' : 'bg-dark border border-gray-700 text-gray-200 rounded-tl-none'}`}>
                            <p>{message.text}</p>
                          </div>
                        </div>
                      ))}
                      {isTyping && (
                        <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                            <Bot className="w-4 h-4 text-white" />
                          </div>
                          <div className="bg-dark border border-gray-700 rounded-2xl rounded-tl-none px-4 py-3 flex gap-1">
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Chat Input */}
                    <div className="p-3 border-t border-gray-700 bg-dark-card mt-auto">
                      <div className="flex items-end gap-2 bg-dark border border-gray-700 rounded-xl p-1 focus-within:border-primary/50 transition-colors">
                        <textarea
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault()
                              handleSendMessage()
                            }
                          }}
                          placeholder="Type or speak a question..."
                          className="flex-1 bg-transparent border-none resize-none px-3 py-2.5 max-h-32 focus:outline-none text-sm leading-relaxed text-gray-200 placeholder-gray-500"
                          rows="1"
                        />
                        <div className="flex items-center gap-1 p-1">
                          <button
                            type="button"
                            onClick={toggleRecording}
                            className={`p-2 rounded-lg transition-all ${isRecording ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                            title="Voice input"
                          >
                            <Mic className={`w-5 h-5 ${isRecording ? 'animate-pulse' : ''}`} />
                          </button>
                          <button
                            type="button"
                            onClick={handleSendMessage}
                            disabled={!input.trim()}
                            className="p-2 bg-primary hover:bg-blue-600 disabled:opacity-50 disabled:hover:bg-primary text-white rounded-lg transition-all"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Course Content Tab */}
                {activeSidebarTab === 'content' && (
                  <div className="absolute inset-0 flex flex-col p-4 overflow-y-auto">
                    <div className="space-y-2 mb-4">
                      {lessons.map((lesson, index) => (
                        <button
                          key={lesson.id}
                          onClick={() => setCurrentLesson(index)}
                          disabled={index > 0 && !completedLessons.includes(index - 1)}
                          className={`w-full text-left p-3 rounded-lg transition ${currentLesson === index
                            ? 'bg-primary text-white'
                            : completedLessons.includes(index)
                              ? 'bg-dark hover:bg-gray-800 text-white'
                              : 'bg-dark text-gray-500 cursor-not-allowed'
                            }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-1">
                              {completedLessons.includes(index) ? (
                                <CheckCircle className="w-5 h-5 text-green-500" />
                              ) : index > 0 && !completedLessons.includes(index - 1) ? (
                                <Lock className="w-5 h-5" />
                              ) : (
                                getIcon(lesson.type)
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-semibold">
                                  {String(index + 1).padStart(2, '0')}
                                </span>
                                <span className={`text-xs px-2 py-0.5 rounded ${lesson.type === 'video' ? 'bg-blue-600' :
                                  lesson.type === 'practice' ? 'bg-green-600' :
                                    'bg-purple-600'
                                  }`}>
                                  {lesson.type}
                                </span>
                              </div>
                              <p className="text-sm font-medium truncate">{lesson.title}</p>
                              <p className="text-xs text-gray-400 mt-1">{lesson.duration}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Progress */}
                    <div className="mt-auto pt-4 border-t border-gray-700">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-400">Progress</span>
                        <span className="font-semibold">
                          {Math.round((completedLessons.length / lessons.length) * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${(completedLessons.length / lessons.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
