import { Award } from 'lucide-react'

export default function BadgeDisplay({ badges, userBadges = [] }) {
  const earnedBadgeIds = userBadges.map(b => b.id)

  return (
    <div className="bg-dark-card p-6 rounded-lg">
      <div className="flex items-center gap-2 mb-4">
        <Award className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Badges</h3>
        <span className="text-sm text-gray-400">
          ({userBadges.length}/{badges.length})
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {badges.map((badge) => {
          const isEarned = earnedBadgeIds.includes(badge.id)
          
          return (
            <div
              key={badge.id}
              className={`p-4 rounded-lg border-2 transition ${
                isEarned
                  ? 'border-primary bg-primary/10'
                  : 'border-gray-700 opacity-50'
              }`}
              title={badge.description}
            >
              <div className="text-4xl mb-2 text-center">{badge.icon}</div>
              <div className="text-sm font-medium text-center">{badge.name}</div>
              {isEarned && (
                <div className="text-xs text-gray-400 text-center mt-1">
                  Earned!
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
