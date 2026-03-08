import { useState } from 'react'
import { CheckCircle, XCircle, ArrowRight } from 'lucide-react'

const questions = [
  {
    id: 1,
    question: 'Have you written code before?',
    options: [
      { value: 'never', label: 'Never', points: 0 },
      { value: 'little', label: 'A little bit', points: 1 },
      { value: 'some', label: 'Yes, some projects', points: 2 },
      { value: 'experienced', label: 'Yes, I\'m experienced', points: 3 }
    ]
  },
  {
    id: 2,
    question: 'Which programming languages do you know?',
    options: [
      { value: 'none', label: 'None', points: 0 },
      { value: 'one', label: 'One language', points: 1 },
      { value: 'two-three', label: '2-3 languages', points: 2 },
      { value: 'many', label: 'Many languages', points: 3 }
    ]
  },
  {
    id: 3,
    question: 'Can you explain what a variable is?',
    options: [
      { value: 'no', label: 'No idea', points: 0 },
      { value: 'heard', label: 'Heard of it', points: 1 },
      { value: 'yes', label: 'Yes, I can explain', points: 2 },
      { value: 'expert', label: 'Yes, and I use them daily', points: 3 }
    ]
  },
  {
    id: 4,
    question: 'Have you built any projects?',
    options: [
      { value: 'no', label: 'No', points: 0 },
      { value: 'learning', label: 'Learning projects', points: 1 },
      { value: 'personal', label: 'Personal projects', points: 2 },
      { value: 'professional', label: 'Professional projects', points: 3 }
    ]
  },
  {
    id: 5,
    question: 'What is your goal?',
    options: [
      { value: 'learn', label: 'Learn to code', points: 0 },
      { value: 'job', label: 'Get a coding job', points: 1 },
      { value: 'improve', label: 'Improve my skills', points: 2 },
      { value: 'expert', label: 'Become an expert', points: 3 }
    ]
  }
]

export default function SkillAssessment({ onComplete }) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [selectedOption, setSelectedOption] = useState(null)

  const handleAnswer = (questionId, option) => {
    setSelectedOption(option)
    setAnswers(prev => ({ ...prev, [questionId]: option }))
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
      setSelectedOption(answers[questions[currentQuestion + 1].id] || null)
    } else {
      // Calculate level
      const totalPoints = Object.values(answers).reduce((sum, answer) => sum + answer.points, 0)
      const maxPoints = questions.length * 3
      const percentage = (totalPoints / maxPoints) * 100

      let level = 'beginner'
      let goal = answers[5]?.value || 'learn'

      if (percentage >= 70) {
        level = 'advanced'
      } else if (percentage >= 40) {
        level = 'intermediate'
      }

      onComplete({ level, goal, score: totalPoints })
    }
  }

  const question = questions[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>Question {currentQuestion + 1} of {questions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-dark rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-purple-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="bg-dark-card p-8 rounded-lg">
        <h2 className="text-2xl font-bold mb-6">{question.question}</h2>

        {/* Options */}
        <div className="space-y-3">
          {question.options.map((option) => (
            <button
              key={option.value}
              onClick={() => handleAnswer(question.id, option)}
              className={`w-full p-4 rounded-lg border-2 transition text-left ${
                selectedOption?.value === option.value
                  ? 'border-primary bg-primary/10'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-lg">{option.label}</span>
                {selectedOption?.value === option.value && (
                  <CheckCircle className="w-5 h-5 text-primary" />
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={handleNext}
          disabled={!selectedOption}
          className="mt-6 w-full bg-primary hover:bg-blue-600 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {currentQuestion < questions.length - 1 ? 'Next Question' : 'Complete Assessment'}
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
