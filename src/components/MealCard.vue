<template>
  <router-link :to="{ name: 'meal-page', params: { mealID: meal.id } }" class="card-link">
    <div class="card h-100">
      <img :src="meal.image" :alt="meal.title" class="card-img-top">
      <div class="card-body text-center">
        <p class="card-title fw-bold mb-0">{{ meal.title }}</p>
        <p class="card-text">{{ meal.description }}</p>
      </div>
    </div>
  </router-link>
</template>

<script setup>
defineProps({
  meal: { type: Object, required: true }
})
</script>

<style scoped>
.card {
  border: 1px solid rgb(242, 242, 242);
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.3s ease-in-out;
}

.card:hover {
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
}

.card-title {
  font-size: 17px;
}

.card-text {
  font-size: 15px;
}

.card-link {
  display: block;
  text-decoration: none;
}
</style>
