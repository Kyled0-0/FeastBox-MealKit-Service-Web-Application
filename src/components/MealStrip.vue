<template>
  <div class="strip-wrapper">
    <button class="chevron chevron-left" aria-label="Scroll left" @click="scrollCards(-1)">
      <i class="bi bi-chevron-left" aria-hidden="true"></i>
    </button>

    <div class="strip" ref="stripRef" v-bind="bind" :class="{ dragging: isDragging }">
      <div
        v-for="meal in meals"
        :key="meal.id"
        class="strip-card"
        @click="$emit('select', meal)"
      >
        <img :src="meal.image" :alt="meal.title" class="strip-img">
        <div class="strip-label fw-bold">{{ meal.title }}</div>
      </div>
    </div>

    <button class="chevron chevron-right" aria-label="Scroll right" @click="scrollCards(1)">
      <i class="bi bi-chevron-right" aria-hidden="true"></i>
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useDragScroll } from '@/composables/useDragScroll'

defineProps({ meals: { type: Array, required: true } })
defineEmits(['select'])

const stripRef = ref(null)
const { isDragging, bind } = useDragScroll(stripRef)

function scrollCards(direction) {
  stripRef.value?.scrollBy({ left: direction * 330, behavior: 'smooth' })
}
</script>

<style scoped>
.strip-wrapper {
  position: relative;
}

.strip {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  gap: 4px;
  cursor: grab;
  user-select: none;
  scrollbar-width: none;
}

.strip::-webkit-scrollbar {
  display: none;
}

.strip.dragging {
  cursor: grabbing;
}

.strip-card {
  flex: 0 0 325px;
  height: 300px;
  position: relative;
  overflow: hidden;
  scroll-snap-align: start;
}

.strip-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  margin-top: 40px;
  transform: scale(1.4);
  pointer-events: none;
}

.strip-label {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  padding: 8px;
  font-size: 14px;
}

.chevron {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  background: rgba(255, 255, 255, 0.85);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.strip-wrapper:hover .chevron {
  opacity: 1;
}

.chevron-left {
  left: 8px;
}

.chevron-right {
  right: 8px;
}

@media (max-width: 767.98px) {
  .chevron {
    display: none;
  }
}
</style>
