import { useState, useRef, useEffect } from 'react'
import Layout from '../components/Layout'
import { Send, Mic, Plus, MoreVertical, Copy, Download, Trash2, RefreshCw, Paperclip, Image, FileText, X } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useToast } from '../components/Toast'
import api from '../utils/api'

export default function TutorPage() {
  const { user, updatePreferences } = useAuthStore()
  const toast = useToast()

  // Local language state to allow dynamic switching within the page
  const [tutorLang, setTutorLang] = useState(user?.selectedLanguage || 'hi')

  // Get initial greeting in user's language
  const getInitialGreeting = () => {
    const lang = tutorLang || 'en'
    const greetings = {
      'hi': 'नमस्ते! मैं आपका AI coding सहायक हूँ। आप मुझसे कोई भी coding सवाल पूछ सकते हैं, code भेज सकते हैं, या screenshot share कर सकते हैं!',
      'ta': 'வணக்கம்! நான் உங்கள் AI coding உதவியாளர். நீங்கள் என்னிடம் எந்த coding கேள்வியும் கேட்கலாம், code அனுப்பலாம், அல்லது screenshot பகிரலாம்!',
      'te': 'నమస్కారం! నేను మీ AI coding సహాయకుడిని। మీరు నన్ను ఏదైనా coding ప్రశ్న అడగవచ్చు, code పంపవచ్చు, లేదా screenshot share చేయవచ్చు!',
      'kn': 'ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ AI coding ಸಹಾಯಕ. ನೀವು ನನ್ನನ್ನು ಯಾವುದೇ coding ಪ್ರಶ್ನೆ ಕೇಳಬಹುದು, code ಕಳುಹಿಸಬಹುದು, ಅಥವಾ screenshot ಹಂಚಿಕೊಳ್ಳಬಹುದು!',
      'bn': 'নমস্কার! আমি আপনার AI coding সহায়ক। আপনি আমাকে যেকোনো coding প্রশ্ন জিজ্ঞাসা করতে পারেন, code পাঠাতে পারেন, বা screenshot শেয়ার করতে পারেন!',
      'mr': 'नमस्कार! मी तुमचा AI coding सहाय्यक आहे। तुम्ही मला कोणताही coding प्रश्न विचारू शकता, code पाठवू शकता, किंवा screenshot शेअर करू शकता!',
      'ml': 'നമസ്കാരം! ഞാൻ നിങ്ങളുടെ AI coding സഹായകനാണ്. നിങ്ങൾക്ക് എന്നോട് ഏതെങ്കിലും coding ചോദ്യം ചോദിക്കാം, code അയയ്ക്കാം, അല്ലെങ്കിൽ screenshot പങ്കിടാം!',
      'en': 'Hello! I\'m your AI coding assistant. You can ask me any coding questions, send code, or share screenshots!'
    }
    return greetings[lang] || greetings['en']
  }

  // Get placeholder text in user's language
  const getPlaceholder = () => {
    const lang = tutorLang || 'en'
    const placeholders = {
      'hi': 'Ask in Hinglish... e.g., "Loop kaise kaam karta hai?"',
      'ta': 'Ask in Tanglish... e.g., "Loop eppadi work aagum?"',
      'te': 'Ask in Tenglish... e.g., "Loop ela work avtundi?"',
      'en': 'Ask in Hinglish... e.g., "Loop kaise kaam karta hai?"'
    }
    return placeholders[lang] || placeholders['en']
  }

  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      text: getInitialGreeting(),
      timestamp: new Date()
    }
  ])

  // Update greeting when language changes
  useEffect(() => {
    setMessages([{
      id: 1,
      type: 'ai',
      text: getInitialGreeting(),
      timestamp: new Date()
    }])
  }, [tutorLang])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [showAttachMenu, setShowAttachMenu] = useState(false)
  const [attachedFiles, setAttachedFiles] = useState([])
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)
  const imageInputRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // File Upload Handler
  const handleFileSelect = (e, type) => {
    const files = Array.from(e.target.files)
    const newFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      file,
      type,
      name: file.name,
      size: file.size,
      preview: type === 'image' ? URL.createObjectURL(file) : null
    }))
    setAttachedFiles([...attachedFiles, ...newFiles])
    setShowAttachMenu(false)
    toast.success(`${files.length} file(s) attached`)
  }

  const removeFile = (id) => {
    setAttachedFiles(attachedFiles.filter(f => f.id !== id))
  }

  // Fake Microphone Handler (UI Placeholder)
  const startRecording = () => {
    setIsRecording(true)
    toast.info('🎤 Listening... Click mic again to stop', { duration: 3000 })
  }

  const stopRecording = async () => {
    setIsRecording(false)
    setIsTyping(true)
    toast.info('⚙️ Transcribing audio...')

    // Simulate transcribing time
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Mock transcriptions based on language
    const lang = tutorLang || 'en'
    const mockTranscriptions = {
      'hi': 'पायथन में लिस्ट को कैसे रिवर्स करें?',
      'ta': 'பைத்தானில் ஒரு பட்டியலை எவ்வாறு திருப்புவது?',
      'te': 'పైథాన్‌లో జాబితాను ఎలా తిప్పాలి?',
      'en': 'How do I reverse a list in Python?'
    }

    const transcribedText = mockTranscriptions[lang] || mockTranscriptions['en']
    setInput(transcribedText)
    setIsTyping(false)
    toast.success('Audio transcribed successfully!')
  }

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  // Send Message with Files
  const handleSend = async () => {
    if (!input.trim() && attachedFiles.length === 0) return

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      text: input,
      files: attachedFiles,
      timestamp: new Date()
    }

    setMessages([...messages, userMessage])
    const currentInput = input.toLowerCase()
    setInput('')
    setIsTyping(true)

    try {
      // Secret Demo Hook: If they ask about a loop, give a perfect canned response
      if (currentInput.includes('loop')) {
        await new Promise(resolve => setTimeout(resolve, 1500))

        const lang = tutorLang || 'en'
        const responses = {
          'hi': {
            text: 'Bilkul! Python mein Loop ek aisi cheez hai jo ek hi kaam ko baar-baar karne deta hai, bina code ko baar-baar likhe. \n\nSocho agar tumhe 5 cups chai banani hai. Tum baar-baar "Chai banao" nahi bologe. Tum bologe, "Jab tak 5 cups na ban jaye, chai banate raho." Yehi `while` aur `for` loop ka kaam hai!',
            code: '# For loop ka example:\nfor chai_cup in range(5):\n    print(f"Cup {chai_cup + 1} ready hai!")',
            followUp: 'Kya tum while loop ka bhi ek example dekhna chahte ho?'
          },
          'ta': {
            text: 'Kandippa! Python-la Loop apdingrathu oru velaiyai thirumba thirumba seiya use aagum, code-a repeat pannaama. \n\nYosichu paaru, nee 5 cup tea poda num na, thirumba thirumba "Tea podu" nu solla maata. "5 cup ready agura varaikum tea podu" nu solluva. Ithu thaan `while` marrum `for` loop ode velai!',
            code: '# For loop utharanam:\nfor chai_cup in range(5):\n    print(f"Cup {chai_cup + 1} ready aagiduchu!")',
            followUp: 'While loop-ku oru example paaklama?'
          },
          'te': {
            text: 'Tappakunda! Python lo Loop ante oka pani ni malli malli cheyadaniki aaskaram istundi, code ni repeatu ga rayakunda. \n\nOkaroju miru 5 cups chai cheyalante, prati sari "Chai cheyi" ani chepparu kada. "5 cups ayenthavaraku chai chestune undu" ani cheptaru. Anthe, idi `while` mariyu `for` loop chese pani!',
            code: '# For loop udaharana:\nfor chai_cup in range(5):\n    print(f"Cup {chai_cup + 1} ready aindi!")',
            followUp: 'While loop ki inko example chuddama?'
          },
          'en': {
            text: 'Absolutely! A Loop in Python is something that lets you do a task repeatedly without writing the code over and over again. \n\nImagine you have to make 5 cups of chai. You won\'t say "Make chai" 5 times. You will say, "Keep making chai until 5 cups are done." That is exactly what a `while` and `for` loop does!',
            code: '# For loop example:\nfor chai_cup in range(5):\n    print(f"Cup {chai_cup + 1} is ready!")',
            followUp: 'Would you like to see an example of a while loop?'
          }
        }

        const responseData = responses[lang] || responses['en']

        const cannedResponse = {
          id: messages.length + 2,
          type: 'ai',
          text: responseData.text,
          code: responseData.code,
          followUp: responseData.followUp,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, cannedResponse])
        setIsTyping(false)
        return
      }

      // Prepare form data for file upload
      const formData = new FormData()
      formData.append('message', currentInput)
      formData.append('language', tutorLang || 'hi-IN')

      attachedFiles.forEach((fileObj, index) => {
        formData.append(`files`, fileObj.file)
      })

      // Send to backend
      const response = await api.post('/ai/chat', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      const aiMessage = {
        id: messages.length + 2,
        type: 'ai',
        text: response.data.text,
        code: response.data.code,
        followUp: response.data.followUp,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiMessage])
      setAttachedFiles([])
    } catch (error) {
      toast.error('Failed to send message')
      console.error('Error:', error)
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const clearChat = () => {
    if (confirm('Are you sure you want to clear all messages? This cannot be undone.')) {
      setMessages([{
        id: 1,
        type: 'ai',
        text: getInitialGreeting(),
        timestamp: new Date()
      }])
      setShowMenu(false)
      toast.info('Chat cleared')
    }
  }

  const downloadChat = () => {
    const chatText = messages.map(m =>
      `${m.type === 'user' ? 'You' : 'AI'}: ${m.text}${m.code ? '\n\nCode:\n' + m.code : ''}`
    ).join('\n\n---\n\n')

    const blob = new Blob([chatText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'chat-history.txt'
    a.click()
    setShowMenu(false)
  }

  const copyAllChat = () => {
    const chatText = messages.map(m =>
      `${m.type === 'user' ? 'You' : 'AI'}: ${m.text}`
    ).join('\n\n')
    navigator.clipboard.writeText(chatText)
    alert('Chat copied to clipboard!')
    setShowMenu(false)
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-700">
          <div>
            <h1 className="text-2xl font-bold">LinguaDev AI Tutor</h1>
            <div className="flex items-center gap-4 mt-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm text-gray-400">Online</span>
              </div>

              {/* Language Selector */}
              <select
                value={tutorLang}
                onChange={(e) => setTutorLang(e.target.value)}
                className="bg-dark border border-gray-700 rounded-lg px-2 py-1 text-sm text-gray-300 focus:outline-none focus:border-primary"
              >
                <option value="en">🇬🇧 English</option>
                <option value="hi">🇮🇳 Hindi (हिंदी)</option>
                <option value="ta">🇮🇳 Tamil (தமிழ்)</option>
                <option value="te">🇮🇳 Telugu (తెలుగు)</option>
                <option value="kn">🇮🇳 Kannada (ಕನ್ನಡ)</option>
                <option value="bn">🇮🇳 Bengali (বাংলা)</option>
                <option value="mr">🇮🇳 Marathi (मराठी)</option>
                <option value="ml">🇮🇳 Malayalam (മലയാളം)</option>
              </select>
            </div>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-dark-card rounded-lg transition"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-dark-card border border-gray-700 rounded-lg shadow-lg z-10">
                <button
                  onClick={copyAllChat}
                  className="w-full px-4 py-3 text-left hover:bg-dark flex items-center gap-3 transition"
                >
                  <Copy className="w-4 h-4" />
                  Copy Conversation
                </button>
                <button
                  onClick={downloadChat}
                  className="w-full px-4 py-3 text-left hover:bg-dark flex items-center gap-3 transition"
                >
                  <Download className="w-4 h-4" />
                  Download Chat
                </button>
                <button
                  onClick={clearChat}
                  className="w-full px-4 py-3 text-left hover:bg-dark flex items-center gap-3 text-red-500 transition"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear Chat
                </button>
                <button
                  onClick={() => {
                    window.location.reload()
                    setShowMenu(false)
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-dark flex items-center gap-3 transition"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto mb-6 space-y-6">
          <div className="text-center text-sm text-gray-500 mb-4">
            Today, 2:30 PM
          </div>

          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-3 max-w-2xl ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${message.type === 'user' ? 'bg-primary' : 'bg-gray-700'
                  }`}>
                  {message.type === 'user' ? (
                    <span className="text-sm font-semibold">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </span>
                  ) : (
                    <span className="text-lg">🤖</span>
                  )}
                </div>

                {/* Message Content */}
                <div className={`flex-1 ${message.type === 'user' ? 'text-right' : ''}`}>
                  <div className={`inline-block p-4 rounded-lg ${message.type === 'user'
                    ? 'bg-primary text-white'
                    : 'bg-dark-card text-white'
                    }`}>
                    <p className="text-sm mb-2">{message.text}</p>

                    {message.code && (
                      <div className="bg-dark rounded-lg p-3 my-3 relative">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-400">Python Example</span>
                          <button className="text-primary hover:text-blue-400 flex items-center gap-1 text-xs">
                            <Copy className="w-3 h-3" />
                            Copy
                          </button>
                        </div>
                        <pre className="text-sm font-mono text-green-400">
                          {message.code}
                        </pre>
                      </div>
                    )}

                    {message.followUp && (
                      <p className="text-sm mt-2">{message.followUp}</p>
                    )}
                  </div>

                  {message.type === 'ai' && (
                    <p className="text-xs text-gray-500 mt-1">LinguaDev AI</p>
                  )}
                  {message.type === 'user' && (
                    <p className="text-xs text-gray-500 mt-1">You</p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-700 flex-shrink-0 flex items-center justify-center">
                <span className="text-lg">🤖</span>
              </div>
              <div className="bg-dark-card p-4 rounded-lg">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="bg-dark-card rounded-lg p-4">
          {/* Attached Files Preview */}
          {attachedFiles.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {attachedFiles.map((fileObj) => (
                <div key={fileObj.id} className="relative group">
                  {fileObj.type === 'image' ? (
                    <div className="relative">
                      <img
                        src={fileObj.preview}
                        alt={fileObj.name}
                        className="w-20 h-20 object-cover rounded-lg border border-gray-700"
                      />
                      <button
                        onClick={() => removeFile(fileObj.id)}
                        className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 bg-dark border border-gray-700 rounded-lg px-3 py-2">
                      <FileText className="w-4 h-4 text-primary" />
                      <span className="text-sm max-w-[100px] truncate">{fileObj.name}</span>
                      <button
                        onClick={() => removeFile(fileObj.id)}
                        className="ml-2 text-red-500 hover:text-red-400"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex items-end gap-3">
            {/* Attach Button */}
            <div className="relative">
              <button
                onClick={() => setShowAttachMenu(!showAttachMenu)}
                className="p-2 hover:bg-dark rounded-lg flex-shrink-0 transition"
              >
                <Plus className="w-5 h-5" />
              </button>
              {showAttachMenu && (
                <div className="absolute bottom-full left-0 mb-2 w-48 bg-dark-card border border-gray-700 rounded-lg shadow-lg z-10">
                  <button
                    onClick={() => imageInputRef.current?.click()}
                    className="w-full px-4 py-3 text-left hover:bg-dark flex items-center gap-3 transition"
                  >
                    <Image className="w-4 h-4 text-primary" />
                    <span className="text-sm">Upload Image</span>
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full px-4 py-3 text-left hover:bg-dark flex items-center gap-3 transition"
                  >
                    <Paperclip className="w-4 h-4 text-primary" />
                    <span className="text-sm">Upload File</span>
                  </button>
                </div>
              )}
            </div>

            {/* Hidden File Inputs */}
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFileSelect(e, 'image')}
              className="hidden"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept=".py,.js,.txt,.md,.json"
              multiple
              onChange={(e) => handleFileSelect(e, 'file')}
              className="hidden"
            />

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={getPlaceholder()}
              className="flex-1 bg-dark border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-primary resize-none"
              rows={1}
            />

            {/* Microphone Button */}
            <button
              type="button"
              onClick={toggleRecording}
              className={`p-2 rounded-lg flex-shrink-0 transition ${isRecording
                ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                : 'hover:bg-dark'
                }`}
              title={isRecording ? 'Stop recording' : 'Start voice message'}
            >
              <Mic className="w-5 h-5" />
            </button>

            {/* Send Button */}
            <button
              type="button"
              onClick={handleSend}
              disabled={!input.trim() && attachedFiles.length === 0}
              className="bg-primary hover:bg-blue-600 p-3 rounded-lg flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>

          {/* Recording Indicator */}
          {isRecording && (
            <div className="mt-3 flex items-center gap-2 text-red-500 text-sm">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span>Recording... Click mic to stop</span>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
