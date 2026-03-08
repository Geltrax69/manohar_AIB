import { Flame, Calendar } from 'lucide-react'

export default function StreakDisplay({ streak, lastActiveDate }) {
  const today = new Date().toDateString()
  const lastActive = new Date(lastActiveDate).toDateString()
  const isActiveToday = today === lastActive

  return (
    <div className="bg-dark-card p-4 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-full ${
            streak > 0 ? 'bg-orange-500/20' : 'bg-gray-700'
          }`}>
            <Flame className={`w-6 h-6 ${
              streak > 0 ? 'text-orange-500' : 'text-gray-500'
            }`} />
          </div>
          <div>
            <div className="text-2xl font-bold">{streak} Days</div>
            <div className="text-sm text-gray-400">Current Streak</div>
          </div>
        </div>
        {isActiveToday && (
          <div className="flex items-center gap-2 text-green-500 text-sm">
            <Calendar className="w-4 h-4" />
            <span>Active today!</span>
          </div>
        )}
      </div>
      
      {streak > 0 && (
        <div className="mt-4 p-3 bg-dark rounded-lg">
          <div className="text-xs text-gray-400 mb-1">Keep it going!</div>
          <div className="text-sm">
            Come back tomorrow to maintain your streak 🔥
          </div>
        </div>
      )}
    </div>
  )
}
