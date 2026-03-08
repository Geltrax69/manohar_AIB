import { X, CheckCircle, Info, AlertCircle } from 'lucide-react'

const notifications = [
  {
    id: 1,
    type: 'success',
    title: 'Course Completed!',
    message: 'You completed Python Basics',
    time: '2 hours ago',
    read: false
  },
  {
    id: 2,
    type: 'info',
    title: 'New Challenge Available',
    message: 'Smart Village App challenge is live',
    time: '5 hours ago',
    read: false
  },
  {
    id: 3,
    type: 'achievement',
    title: '7 Day Streak!',
    message: 'Keep up the great work',
    time: '1 day ago',
    read: true
  }
]

export default function NotificationPanel({ onClose }) {
  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />
      case 'achievement':
        return <span className="text-xl">🏆</span>
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
    }
  }

  return (
    <div className="absolute right-0 top-12 w-96 bg-dark-card border border-gray-700 rounded-lg shadow-2xl z-50">
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h3 className="font-semibold">Notifications</h3>
        <button onClick={onClose} className="p-1 hover:bg-dark rounded">
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {notifications.map((notif) => (
          <div 
            key={notif.id}
            className={`p-4 border-b border-gray-700 hover:bg-dark cursor-pointer ${
              !notif.read ? 'bg-primary/5' : ''
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                {getIcon(notif.type)}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm mb-1">{notif.title}</h4>
                <p className="text-sm text-gray-400 mb-1">{notif.message}</p>
                <span className="text-xs text-gray-500">{notif.time}</span>
              </div>
              {!notif.read && (
                <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2" />
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-3 border-t border-gray-700 text-center">
        <button className="text-sm text-primary hover:underline">
          Mark all as read
        </button>
      </div>
    </div>
  )
}
