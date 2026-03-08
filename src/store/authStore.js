import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  selectedLanguage: localStorage.getItem('selectedLanguage') || null,
  
  login: (user, token) => {
    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('token', token)
    set({ user, token, isAuthenticated: true })
  },
  
  logout: () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    localStorage.removeItem('selectedLanguage')
    set({ user: null, token: null, isAuthenticated: false, selectedLanguage: null })
  },
  
  setLanguage: (language) => {
    localStorage.setItem('selectedLanguage', language)
    set({ selectedLanguage: language })
  },
  
  updateUser: (userData) => set((state) => {
    const updatedUser = { ...state.user, ...userData }
    localStorage.setItem('user', JSON.stringify(updatedUser))
    return { user: updatedUser }
  }),
}))
