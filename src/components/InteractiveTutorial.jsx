import { useState } from 'react'
import { CheckCircle, XCircle, Lightbulb, ArrowRight } from 'lucide-react'
import CodeEditor from './CodeEditor'
import CodeExecutor from './CodeExecutor'
import { useToast } from './Toast'

export default function InteractiveTutorial({ lesson, onComplete }) {
  const [currentExercise, setCurrentExercise] = useState(0)
  const [code, setCode] = useState(lesson.exercises[0]?.initialCode || '')
  const [showHint, setShowHint] = useState(false)
  const [showOutput, setShowOutput] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const toast = useToast()

  const exercise = lesson.exercises[currentExercise]

  const checkSolution = () => {
    // Simple check: compare trimmed code
    const userCode = code.trim()
    const solution = exercise.solution.trim()
    
    if (userCode === solution || userCode.includes(solution)) {
      setIsCorrect(true)
      toast.success('Correct! Well done! 🎉')
    } else {
      toast.error('Not quite right. Try again or use a hint!')
    }
  }

  const handleNext = () => {
    if (currentExercise < lesson.exercises.length - 1) {
      setCurrentExercise(prev => prev + 1)
      setCode(lesson.exercises[currentExercise + 1].initialCode)
      setIsCorrect(false)
      setShowHint(false)
      setShowOutput(false)
    } else {
      onComplete()
    }
  }

  const handleRun = async (codeToRun) => {
    setShowOutput(true)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Progress */}
      <div className="bg-dark-card p-4 rounded-lg">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>Exercise {currentExercise + 1} of {lesson.exercises.length}</span>
          <span>{Math.round(((currentExercise + 1) / lesson.exercises.length) * 100)}%</span>
        </div>
        <div className="h-2 bg-dark rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-purple-600 transition-all"
            style={{ width: `${((currentExercise + 1) / lesson.exercises.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="bg-dark-card p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4">{exercise.question}</h2>
        
        {/* Hints */}
        {exercise.hints && exercise.hints.length > 0 && (
          <div className="mb-4">
            <button
              onClick={() => setShowHint(!showHint)}
              className="flex items-center gap-2 text-yellow-500 hover:text-yellow-400 transition"
            >
              <Lightbulb className="w-4 h-4" />
              <span className="text-sm">{showHint ? 'Hide' : 'Show'} Hint</span>
            </button>
            {showHint && (
              <div className="mt-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <ul className="text-sm space-y-1">
                  {exercise.hints.map((hint, i) => (
                    <li key={i} className="text-yellow-200">• {hint}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Code Editor */}
      <CodeEditor
        value={code}
        onChange={setCode}
        language="python"
        onRun={handleRun}
        height="300px"
      />

      {/* Output */}
      {showOutput && (
        <CodeExecutor
          code={code}
          language="python"
          onClose={() => setShowOutput(false)}
        />
      )}

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={checkSolution}
          className="px-6 py-3 bg-primary hover:bg-blue-600 text-white rounded-lg font-semibold transition"
        >
          Check Solution
        </button>

        {isCorrect && (
          <button
            onClick={handleNext}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition flex items-center gap-2"
          >
            {currentExercise < lesson.exercises.length - 1 ? 'Next Exercise' : 'Complete Lesson'}
            <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Result */}
      {isCorrect && (
        <div className="bg-green-500/10 border border-green-500 p-4 rounded-lg flex items-start gap-3">
          <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-green-500 mb-1">Excellent work!</div>
            <div className="text-sm text-gray-300">
              You've successfully completed this exercise. Keep going!
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
