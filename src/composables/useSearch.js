// Contract: `items` must be a ref<Array> or computed<Array>
import { ref, computed, watch } from 'vue'

export function useSearch(items, fields) {
  const query = ref('')
  const debouncedQuery = ref('')

  watch(query, (val, _, onCleanup) => {
    const t = setTimeout(() => { debouncedQuery.value = val }, 300)
    onCleanup(() => clearTimeout(t))
  })

  const results = computed(() => {
    const q = debouncedQuery.value.trim().toLowerCase()
    if (!q) return items.value
    return items.value.filter(item =>
      fields.some(field => item[field]?.toLowerCase().includes(q))
    )
  })

  return { query, results }
}
