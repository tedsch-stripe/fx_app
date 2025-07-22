import { onMounted, onUnmounted } from 'vue'
import { useFxStore } from '@/store/fxStore'

export function useUrlState() {
  const store = useFxStore()

  // Load state from URL on initialization
  const loadFromUrl = () => {
    const params = new URLSearchParams(window.location.search)
    store.loadFromUrl(params)
  }

  // Handle browser back/forward navigation
  const handlePopState = () => {
    const params = new URLSearchParams(window.location.search)
    store.loadFromUrl(params)
  }

  onMounted(() => {
    // Load initial state from URL
    loadFromUrl()

    // Listen for browser navigation
    window.addEventListener('popstate', handlePopState)
  })

  onUnmounted(() => {
    // Clean up
    window.removeEventListener('popstate', handlePopState)
  })

  return {
    loadFromUrl,
  }
}
