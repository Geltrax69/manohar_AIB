import { useState } from 'react'
import Layout from '../components/Layout'
import { Play, Settings, MoreVertical, Lightbulb, Download, Share2 } from 'lucide-react'

export default function PracticePage() {
  const [code, setCode] = useState(`def calculate_sum(numbers):
    # Initialize total
    total = 0
    for n in numbers:
        total += n
    return total

# Test the function
nums = [1, 2, 3, 4, 5]
print(calculate_sum(nums))`)
  
  const [output, setOutput] = useState('')
  const [activeTab, setActiveTab] = useState('suggestions')
  const [showOptimization, setShowOptimization] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [fontSize, setFontSize] = useState(14)
  const [theme, setTheme] = useState('dark')

  const handleRun = () => {
    // Simulate code execution
    setOutput('15')
    setShowOptimization(true)
  }

  const applyFix = () => {
    setCode(`def calculate_sum(numbers):
    # Using built-in sum() function
    return sum(numbers)

# Test the function
nums = [1, 2, 3, 4, 5]
print(calculate_sum(nums))`)
    setShowOptimization(false)
  }

  const downloadCode = () => {
    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'main.py'
    a.click()
  }

  const shareCode = () => {
    navigator.clipboard.writeText(code)
    alert('Code copied to clipboard!')
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Practice: Python Basics</h1>
            <p className="text-gray-400">Sum of Numbers</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-dark-card rounded-lg transition"
            >
              <Settings className="w-5 h-5" />
            </button>
            <div className="relative">
              <button 
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 hover:bg-dark-card rounded-lg transition"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-dark-card border border-gray-700 rounded-lg shadow-lg z-10">
                  <button 
                    onClick={downloadCode}
                    className="w-full px-4 py-2 text-left hover:bg-dark flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download Code
                  </button>
                  <button 
                    onClick={shareCode}
                    className="w-full px-4 py-2 text-left hover:bg-dark flex items-center gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    Share Code
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="bg-dark-card rounded-lg p-4 mb-6">
            <h3 className="font-semibold mb-4">Editor Settings</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Font Size</label>
                <input
                  type="range"
                  min="12"
                  max="20"
                  value={fontSize}
                  onChange={(e) => setFontSize(e.target.value)}
                  className="w-full"
                />
                <span className="text-sm">{fontSize}px</span>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Theme</label>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="w-full px-3 py-2 bg-dark border border-gray-700 rounded-lg focus:outline-none focus:border-primary"
                >
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Code Editor */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Editor Panel */}
          <div className="bg-dark-card rounded-lg overflow-hidden">
            <div className="flex items-center gap-4 px-4 py-3 border-b border-gray-700">
              <button className="text-primary font-semibold border-b-2 border-primary pb-1">
                main.py
              </button>
              <button className="text-gray-400 hover:text-white">
                readme.md
              </button>
            </div>
            
            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 w-12 bg-dark flex flex-col items-center py-4 text-gray-500 text-sm">
                {code.split('\n').map((_, i) => (
                  <div key={i} className="leading-6">{i + 1}</div>
                ))}
              </div>
              
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-96 bg-dark text-white font-mono p-4 pl-16 focus:outline-none resize-none"
                style={{ fontSize: `${fontSize}px` }}
                spellCheck={false}
              />
            </div>

            <div className="p-4 border-t border-gray-700 flex justify-end">
              <button 
                onClick={handleRun}
                className="bg-primary hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition"
              >
                <Play className="w-4 h-4" />
                Run
              </button>
            </div>
          </div>

          {/* Output & Suggestions Panel */}
          <div className="bg-dark-card rounded-lg overflow-hidden flex flex-col">
            <div className="flex items-center gap-4 px-4 py-3 border-b border-gray-700">
              <button 
                onClick={() => setActiveTab('output')}
                className={`font-semibold pb-1 ${
                  activeTab === 'output' 
                    ? 'text-primary border-b-2 border-primary' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Output
              </button>
              <button 
                onClick={() => setActiveTab('suggestions')}
                className={`font-semibold pb-1 flex items-center gap-2 ${
                  activeTab === 'suggestions' 
                    ? 'text-primary border-b-2 border-primary' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Lightbulb className="w-4 h-4" />
                AI Suggestions
              </button>
            </div>

            <div className="flex-1 p-4">
              {activeTab === 'output' ? (
                <div className="font-mono text-sm">
                  {output ? (
                    <div className="text-green-400">{output}</div>
                  ) : (
                    <div className="text-gray-500">Run your code to see output...</div>
                  )}
                </div>
              ) : (
                <div>
                  {showOptimization && (
                    <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-4 mb-4">
                      <div className="flex items-start gap-3">
                        <Lightbulb className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold">Optimization Tip</h3>
                            <span className="text-xs px-2 py-1 bg-blue-500/20 rounded">
                              PERFORMANCE
                            </span>
                          </div>
                          <p className="text-sm text-gray-300 mb-3">
                            Try using the built-in <code className="bg-dark px-2 py-1 rounded">sum()</code> function here. 
                            It's more "Pythonic" and implemented in C, making it faster than a loop.
                          </p>
                          <div className="flex gap-2">
                            <button 
                              onClick={applyFix}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm font-semibold transition"
                            >
                              ✓ Apply Fix
                            </button>
                            <button 
                              onClick={() => setShowOptimization(false)}
                              className="bg-dark hover:bg-gray-800 text-white px-4 py-2 rounded text-sm transition"
                            >
                              Dismiss
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-start gap-2 text-sm">
                      <span className="text-green-500">✓</span>
                      <span className="text-gray-300">Correct syntax</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <span className="text-green-500">✓</span>
                      <span className="text-gray-300">Good variable naming</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <span className="text-green-500">✓</span>
                      <span className="text-gray-300">Proper indentation</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
