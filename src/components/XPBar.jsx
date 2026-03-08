import { Trophy, Zap } from 'lucide-react'

export default function XPBar({ currentXP, level, nextLevelXP }) {
  const progress = (currentXP / nextLevelXP) * 100

  return (
    <div className="bg-dark-card p-4 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <span className="font-semibold">Level {level}</span>
        </div>
        <div className="flex items-center gap-1 text-sm text-gray-400">
          <Zap className="w-4 h-4 text-yellow-500" />
          <span>{currentXP} / {nextLevelXP} XP</span>
        </div>
      </div>
      <div className="h-3 bg-dark rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-500"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </div>
  )
}
