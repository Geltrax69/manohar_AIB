import { useState, useEffect } from 'react'
import { Terminal, X, BookOpen, AlertTriangle, Zap, Cpu } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

// Global Pyodide instance cache
let pyodideInstance = null
let pyodideLoading = false

export default function CodeExecutor({ code, language, onClose, onSuccess, onError, lang: langProp }) {
  const { user } = useAuthStore()
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [complexity, setComplexity] = useState(null)

  // Use the language passed in from the parent (practiceLang), falling back to user's setting
  const lang = langProp || user?.selectedLanguage || 'en'

  const getLocalizedError = (errorMsg) => {
    if (!errorMsg) return null

    // NameError: name 'x' is not defined
    if (errorMsg.includes('NameError: name') && errorMsg.includes('is not defined')) {
      const match = errorMsg.match(/name '([^']+)' is not defined/)
      const varName = match ? match[1] : 'variable'

      const translations = {
        'hi': `भैया, आपने '${varName}' का इस्तेमाल किया है, लेकिन कंप्यूटर को बताया नहीं कि '${varName}' क्या है। पहले इसे कोई वैल्यू (value) दें!`,
        'ta': `நண்பா, நீங்கள் '${varName}'-ஐ பயன்படுத்துகிறீர்கள், ஆனால் '${varName}' என்றால் என்னவென்று கணினிக்கு சொல்லவில்லை. முதலில் ஒரு மதிப்பை (value) கொடுங்கள்!`,
        'te': `సోదరా, మీరు '${varName}' ని ఉపయోగించారు, కానీ '${varName}' ఏమిటో కంప్యూటర్‌కు చెప్పలేదు. ముందుగా దానికి ఒక విలువ (value) ఇవ్వండి!`,
        'en': `Hey there! You used '${varName}', but didn't tell the computer what '${varName}' is. Give it a value first!`
      }
      return translations[lang] || translations['en']
    }

    // SyntaxError: unexpected EOF while parsing
    if (errorMsg.includes('SyntaxError: unexpected EOF while parsing') || errorMsg.includes('SyntaxError: EOF while scanning triple-quoted string literal')) {
      const translations = {
        'hi': `अरे! लगता है आपने कोड को अधूरा छोड़ दिया है (शायद कोई ब्रैकेट या कोटेशन बंद करना भूल गए हैं)। कृपया कोड पूरा करें।`,
        'ta': `அடடா! நீங்கள் குறியீட்டை முழுமைப்படுத்தாமல் விட்டுவிட்டீர்கள் (ஒருவேளை அடைப்புக்குறியை மூட மறந்துவிட்டீர்களா?). தயவுசெய்து குறியீட்டை முழுமைப்படுத்துங்கள்.`,
        'te': `అయ్యో! మీరు కోడ్‌ను అసంపూర్ణంగా వదిలేశారు (బహుశా బ్రాకెట్‌ మూసివేయడం మర్చిపోయారా?). దయచేసి కోడ్‌ను పూర్తి చేయండి.`,
        'en': `Oops! It looks like you left the code incomplete (maybe forgot to close a bracket or quote?). Please complete the code.`
      }
      return translations[lang] || translations['en']
    }

    // IndentationError: expected an indented block
    if (errorMsg.includes('IndentationError')) {
      const translations = {
        'hi': `स्पेसिंग की गलती! Python में if, for या function के अंदर वाली लाइनों के पहले थोड़ा स्पेस (Tab) देना ज़रूरी है।`,
        'ta': `இடவெளி பிழை! Python-ல் if, for அல்லது function-க்கு உள்ளே வரும் வரிகளுக்கு முன்பு கொஞ்சம் இடவெளி (Tab) கொடுக்க வேண்டும்.`,
        'te': `స్పేసింగ్ పొరపాటు! Python లో if, for లేదా function లోపల ఉన్న లైన్ల ముందు కొంచెం స్పేస్ (Tab) ఇవ్వాలి.`,
        'en': `Spacing error! In Python, lines inside if, for, or functions need a little space (Tab) at the front.`
      }
      return translations[lang] || translations['en']
    }

    return null
  }

  useEffect(() => {
    executeCode()
  }, [code])

  const loadPyodide = async () => {
    if (pyodideInstance) {
      return pyodideInstance
    }

    if (pyodideLoading) {
      // Wait for existing load to complete
      while (pyodideLoading) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      return pyodideInstance
    }

    try {
      pyodideLoading = true
      pyodideInstance = await window.loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/'
      })
      pyodideLoading = false
      return pyodideInstance
    } catch (err) {
      pyodideLoading = false
      throw err
    }
  }

  const executeCode = async () => {
    setIsLoading(true)
    setOutput('')
    setError('')

    try {
      if (language === 'python') {
        await executePython(code)
      } else if (language === 'javascript') {
        executeJavaScript(code)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const executePython = async (code) => {
    try {
      // Load Pyodide (cached after first load)
      const pyodide = await loadPyodide()

      // Capture stdout
      let outputBuffer = ''
      pyodide.setStdout({
        batched: (text) => {
          outputBuffer += text + '\n'
        }
      })

      // Run code
      await pyodide.runPythonAsync(code)

      setOutput(outputBuffer || 'Code executed successfully (no output)')
      analyzeComplexity(code)
      onSuccess?.()
    } catch (err) {
      setError(err.message)
      setComplexity(null)
      onError?.()
    }
  }

  const executeJavaScript = (code) => {
    try {
      // Capture console.log
      const logs = []
      const originalLog = console.log
      console.log = (...args) => {
        logs.push(args.map(arg =>
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' '))
      }

      // Execute code
      eval(code)

      // Restore console.log
      console.log = originalLog

      setOutput(logs.join('\n') || 'Code executed successfully (no output)')
      analyzeComplexity(code)
      onSuccess?.()
    } catch (err) {
      setError(err.message)
      setComplexity(null)
      onError?.()
    }
  }

  const analyzeComplexity = (codeStr) => {
    // Simple heuristics to mimic AI analysis for the demo
    const hasNestedLoops = /for.*for|while.*while|for.*while|while.*for/s.test(codeStr)
    const hasSingleLoop = /for|while/s.test(codeStr)
    const hasRecursion = /def\s+(\w+).*\1\(/s.test(codeStr) || /function\s+(\w+).*\1\(/s.test(codeStr)

    if (hasNestedLoops) {
      setComplexity({ time: 'O(n²)', space: 'O(1)', status: 'Brute Force', color: 'text-orange-400 bg-orange-400/10 border-orange-400/30' })
    } else if (hasRecursion) {
      setComplexity({ time: 'O(2^n)', space: 'O(n)', status: 'Expensive', color: 'text-red-400 bg-red-400/10 border-red-400/30' })
    } else if (hasSingleLoop) {
      setComplexity({ time: 'O(n)', space: 'O(1)', status: 'Optimized', color: 'text-green-400 bg-green-400/10 border-green-400/30' })
    } else {
      setComplexity({ time: 'O(1)', space: 'O(1)', status: 'Highly Optimized', color: 'text-blue-400 bg-blue-400/10 border-blue-400/30' })
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Output area - fills all available space */}
      <div className="p-4 font-mono text-sm flex-1 overflow-auto custom-scrollbar">
        {isLoading ? (
          <div className="text-gray-400">
            <div className="flex items-center gap-2 mb-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span>Executing code...</span>
            </div>
            {!pyodideInstance && language === 'python' && (
              <div className="text-xs text-gray-500 mt-2">
                First run: Loading Python environment (this may take 5-10 seconds)...
              </div>
            )}
          </div>
        ) : error ? (
          <div className="flex flex-col gap-3">
            <div className="bg-red-950/40 border border-red-500/30 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-xs font-bold text-red-400 mb-2 uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4" />
                Standard English Error
              </div>
              <pre className="whitespace-pre-wrap text-red-200/90 text-[13px]">{error}</pre>
            </div>

            {getLocalizedError(error) && (
              <div className="bg-blue-950/40 border border-blue-500/50 p-4 rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.15)] relative overflow-hidden">
                <div className="absolute top-0 right-0 py-1 px-3 bg-blue-500/20 rounded-bl-lg text-[10px] font-bold text-blue-300 uppercase tracking-widest">
                  Vernacular Engine
                </div>
                <div className="text-sm font-bold text-blue-400 mb-2 flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  {user?.selectedLanguage === 'hi' ? 'हिंदी में समझें (Hindi Explanation)' :
                    user?.selectedLanguage === 'ta' ? 'தமிழ் விளக்கம் (Tamil Explanation)' :
                      user?.selectedLanguage === 'te' ? 'తెలుగు వివరణ (Telugu Explanation)' :
                        'Friendly Explanation'}
                </div>
                <p className="text-blue-100 text-[15px] leading-relaxed whitespace-pre-wrap">
                  {getLocalizedError(error)}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="text-green-400">
              <pre className="whitespace-pre-wrap">{output}</pre>
            </div>

            {complexity && (
              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="flex items-center gap-2 mb-3">
                  <Cpu className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">AI Complexity Analysis</span>
                </div>
                <div className="grid grid-cols-2 sm:flex sm:flex-row gap-3">
                  <div className="bg-dark/50 border border-gray-700/50 rounded-lg p-3 flex flex-col gap-1 items-center justify-center min-w-[120px]">
                    <span className="text-xs text-gray-500 font-medium">Time Complexity</span>
                    <span className="text-xl font-bold font-mono text-purple-400">{complexity.time}</span>
                  </div>
                  <div className="bg-dark/50 border border-gray-700/50 rounded-lg p-3 flex flex-col gap-1 items-center justify-center min-w-[120px]">
                    <span className="text-xs text-gray-500 font-medium">Space Complexity</span>
                    <span className="text-xl font-bold font-mono text-blue-400">{complexity.space}</span>
                  </div>
                  <div className={`sm:ml-auto border rounded-lg px-4 py-2 flex items-center justify-center gap-2 ${complexity.color}`}>
                    <Zap className="w-4 h-4" />
                    <span className="font-bold text-sm tracking-wide">{complexity.status}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
