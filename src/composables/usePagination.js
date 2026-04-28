// Contract: `items` must be a ref<Array> or computed<Array>
import { ref, computed, watch } from 'vue'

export function usePagination(items, pageSize = 9) {
  const page = ref(1)

  const totalPages = computed(() =>
    Math.max(1, Math.ceil(items.value.length / pageSize))
  )

  const paginated = computed(() => {
    const start = (page.value - 1) * pageSize
    return items.value.slice(start, start + pageSize)
  })

  watch(items, () => { page.value = 1 })

  function next() {
    if (page.value < totalPages.value) page.value++
  }

  function prev() {
    if (page.value > 1) page.value--
  }

  return { page, totalPages, paginated, next, prev }
}
