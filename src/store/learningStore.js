import { create } from 'zustand'

export const useLearningStore = create((set) => ({
  currentCourse: null,
  progress: {},
  streak: 0,
  weeklyGoal: 75,
  
  setCourse: (course) => set({ currentCourse: course }),
  
  updateProgress: (lessonId, progressData) => set((state) => ({
    progress: {
      ...state.progress,
      [lessonId]: progressData
    }
  })),
  
  setStreak: (streak) => set({ streak }),
  
  setWeeklyGoal: (goal) => set({ weeklyGoal: goal }),
}))
