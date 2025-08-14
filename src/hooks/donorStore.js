import { create } from 'zustand'

export const useDonorStore = create((set, get) => ({
  donors: [],
  selectedDonors: [],
  filters: {
    status: null,
    minScore: null,
    search: ''
  },
  sortBy: 'score',
  
  setDonors: (donors) => set({ donors }),
  
  addDonor: (donor) => set((state) => ({
    donors: [...state.donors, donor]
  })),
  
  updateDonor: (id, updates) => set((state) => ({
    donors: state.donors.map(d => 
      d.id === id ? { ...d, ...updates } : d
    )
  })),
  
  deleteDonor: (id) => set((state) => ({
    donors: state.donors.filter(d => d.id !== id)
  })),
  
  selectDonor: (id) => set((state) => ({
    selectedDonors: [...state.selectedDonors, id]
  })),
  
  deselectDonor: (id) => set((state) => ({
    selectedDonors: state.selectedDonors.filter(did => did !== id)
  })),
  
  selectAll: () => set((state) => ({
    selectedDonors: state.donors.map(d => d.id)
  })),
  
  deselectAll: () => set({ selectedDonors: [] }),
  
  setFilters: (filters) => set({ filters }),
  
  setSortBy: (sortBy) => set({ sortBy }),
  
  getFilteredDonors: () => {
    const { donors, filters, sortBy } = get()
    
    let filtered = [...donors]
    
    // Apply filters
    if (filters.status) {
      filtered = filtered.filter(d => d.status === filters.status)
    }
    if (filters.minScore) {
      filtered = filtered.filter(d => d.score >= filters.minScore)
    }
    if (filters.search) {
      const search = filters.search.toLowerCase()
      filtered = filtered.filter(d => 
        d.full_name?.toLowerCase().includes(search) ||
        d.email?.toLowerCase().includes(search) ||
        d.phone?.includes(search)
      )
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return (b.score || 0) - (a.score || 0)
        case 'name':
          return (a.full_name || '').localeCompare(b.full_name || '')
        case 'amount':
          return (b.previous_donation_amount || 0) - (a.previous_donation_amount || 0)
        case 'recent':
          return new Date(b.last_contact_date || 0) - new Date(a.last_contact_date || 0)
        default:
          return 0
      }
    })
    
    return filtered
  }
}))