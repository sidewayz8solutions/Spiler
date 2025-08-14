import { create } from 'zustand'

export const useQueueStore = create((set, get) => ({
  queue: [],
  priorityQueue: [],
  isAutoDialing: false,
  dialDelay: 5,
  currentPosition: 0,
  
  setQueue: (queue) => set({ queue }),
  setPriorityQueue: (queue) => set({ priorityQueue: queue }),
  setAutoDialing: (isAutoDialing) => set({ isAutoDialing }),
  setDialDelay: (delay) => set({ dialDelay: delay }),
  
  addToQueue: (donors, priority = false) => set((state) => {
    if (priority) {
      return { priorityQueue: [...state.priorityQueue, ...donors] }
    }
    return { queue: [...state.queue, ...donors] }
  }),
  
  removeFromQueue: (donorId) => set((state) => ({
    queue: state.queue.filter(d => d.id !== donorId),
    priorityQueue: state.priorityQueue.filter(d => d.id !== donorId)
  })),
  
  getNextInQueue: () => {
    const { priorityQueue, queue, currentPosition } = get()
    
    // Priority queue first
    if (priorityQueue.length > 0) {
      return priorityQueue[0]
    }
    
    // Regular queue
    if (queue.length > currentPosition) {
      return queue[currentPosition]
    }
    
    return null
  },
  
  advanceQueue: () => set((state) => {
    // Remove first from priority if exists
    if (state.priorityQueue.length > 0) {
      return { priorityQueue: state.priorityQueue.slice(1) }
    }
    
    // Otherwise advance position
    return { currentPosition: state.currentPosition + 1 }
  }),
  
  resetQueue: () => set({
    queue: [],
    priorityQueue: [],
    currentPosition: 0,
    isAutoDialing: false
  }),
  
  getTotalQueueSize: () => {
    const { queue, priorityQueue, currentPosition } = get()
    return priorityQueue.length + Math.max(0, queue.length - currentPosition)
  }
}))