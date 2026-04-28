// Contract: `containerRef` must be a ref<HTMLElement>
import { ref } from 'vue'

export function useDragScroll(containerRef) {
  const isDragging = ref(false)
  let isDown = false
  let startX = 0
  let startScrollLeft = 0
  let hasDragged = false

  function onMousedown(e) {
    isDown = true
    hasDragged = false
    startX = e.pageX
    startScrollLeft = containerRef.value?.scrollLeft ?? 0
  }

  function onMousemove(e) {
    if (!isDown) return
    isDragging.value = true
    hasDragged = true
    containerRef.value.scrollLeft = startScrollLeft - (e.pageX - startX)
  }

  function onMouseup() {
    isDown = false
    isDragging.value = false
  }

  // Capture phase click: block card clicks that were actually drags
  function onClickCapture(e) {
    if (hasDragged) {
      e.stopPropagation()
      hasDragged = false
    }
  }

  const bind = { onMousedown, onMousemove, onMouseup, onMouseleave: onMouseup, onClickCapture }

  return { isDragging, bind }
}
