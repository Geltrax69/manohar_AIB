import { Editor } from '@monaco-editor/react'
import { Play, Copy, Download, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { useToast } from './Toast'

export default function CodeEditor({
  value,
  onChange,
  language = 'python',
  onRun,
  readOnly = false,
  height = '100%'
}) {
  const [isRunning, setIsRunning] = useState(false)
  const toast = useToast()

  const handleCopy = () => {
    navigator.clipboard.writeText(value)
    toast.success('Code copied to clipboard!')
  }

  const handleDownload = () => {
    const blob = new Blob([value], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `code.${language === 'python' ? 'py' : 'js'}`
    a.click()
    toast.success('Code downloaded!')
  }

  const handleReset = () => {
    if (confirm('Reset code to initial state?')) {
      onChange('')
      toast.info('Code reset')
    }
  }

  const handleRun = async () => {
    if (onRun) {
      setIsRunning(true)
      try {
        await onRun(value)
      } finally {
        setIsRunning(false)
      }
    }
  }

  return (
    <div className="border border-gray-700 rounded-lg overflow-hidden h-full flex flex-col">
      {/* Toolbar */}
      <div className="bg-dark-card border-b border-gray-700 px-4 py-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">
            {language === 'python' ? 'Python' : 'JavaScript'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {onRun && (
            <button
              onClick={handleRun}
              disabled={isRunning || !value.trim()}
              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="w-4 h-4" />
              {isRunning ? 'Running...' : 'Run'}
            </button>
          )}
          <button
            onClick={handleCopy}
            className="p-1.5 hover:bg-dark rounded transition"
            title="Copy code"
          >
            <Copy className="w-4 h-4 text-gray-400" />
          </button>
          <button
            onClick={handleDownload}
            className="p-1.5 hover:bg-dark rounded transition"
            title="Download code"
          >
            <Download className="w-4 h-4 text-gray-400" />
          </button>
          {!readOnly && (
            <button
              onClick={handleReset}
              className="p-1.5 hover:bg-dark rounded transition"
              title="Reset code"
            >
              <RotateCcw className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 min-h-0">
        <Editor
          height={height}
          language={language}
          value={value}
          onChange={onChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: true,
            scrollBeyondLastLine: false,
            readOnly: readOnly,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on'
          }}
        />
      </div>
    </div>
  )
}
