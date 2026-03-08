import { useEffect } from 'react'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'
import { create } from 'zustand'

// Toast store
export const useToastStore = create((set) => ({
  toasts: [],
  addToast: (toast) => set((state) => ({
    toasts: [...state.toasts, { ...toast, id: Date.now() }]
  })),
  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter(t => t.id !== id)
  }))
}))

// Toast hook
export const useToast = () => {
  const addToast = useToastStore((state) => state.addToast)

  return {
    success: (message, duration = 3000) => addToast({ type: 'success', message, duration }),
    error: (message, duration = 5000) => addToast({ type: 'error', message, duration }),
    warning: (message, duration = 4000) => addToast({ type: 'warning', message, duration }),
    info: (message, duration = 3000) => addToast({ type: 'info', message, duration })
  }
}

// Toast component
function ToastItem({ toast, onClose }) {
  useEffect(() => {
    if (toast.duration) {
      const timer = setTimeout(() => onClose(toast.id), toast.duration)
      return () => clearTimeout(timer)
    }
  }, [toast, onClose])

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    warning: <AlertCircle className="w-5 h-5 text-yellow-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />
  }

  const colors = {
    success: 'bg-green-500/10 border-green-500',
    error: 'bg-red-500/10 border-red-500',
    warning: 'bg-yellow-500/10 border-yellow-500',
    info: 'bg-blue-500/10 border-blue-500'
  }

  return (
    <div className={`${colors[toast.type]} border rounded-lg p-4 shadow-lg backdrop-blur-sm animate-slide-in`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {icons[toast.type]}
        </div>
        <p className="flex-1 text-sm text-white">{toast.message}</p>
        <button
          onClick={() => onClose(toast.id)}
          className="flex-shrink-0 text-gray-400 hover:text-white transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// Toast container
export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore()

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2 max-w-sm w-full pointer-events-none">
      <div className="space-y-2 pointer-events-auto">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={removeToast} />
        ))}
      </div>
    </div>
  )
}
