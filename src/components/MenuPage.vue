<template>
  <div class="container">
    <section id="search-banner">
      <div class="container py-3 text-white">
        <div class="row align-items-center">
          <div class="col-lg-9" id="intro-text">
            <div>
              <h1>Gourmet meals <span class="highlight">delivered weekly.</span></h1>
              <p class="fw-semibold">The feastbox team brings a variety of fresh, fully cooked meals to
                your table every week.</p>
            </div>
            <div class="input-group mt-4 search-bar">
              <input type="text" class="form-control" v-model="query" placeholder="Search">
              <div class="input-group-append">
                <button class="btn btn-transparent" type="button" aria-label="Search">
                  <i class="bi bi-search" aria-hidden="true"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="menu" :aria-busy="loading">
      <h2>What are you craving</h2>

      <div v-if="loading" class="d-flex justify-content-center py-5">
        <div class="spinner-border text-secondary" role="status">
          <span class="visually-hidden">Loading meals...</span>
        </div>
      </div>

      <div v-else-if="error" class="alert alert-danger" role="alert">
        <p class="mb-2">{{ error.message }}</p>
        <button type="button" class="btn btn-sm btn-outline-danger" @click="retry">
          Try again
        </button>
      </div>

      <template v-else>
        <p v-if="results.length === 0" class="text-center">No meals found.</p>

        <div v-else class="row g-5">
          <div class="col-md-3" v-for="meal in paginated" :key="meal.id">
            <MealCard v-memo="[meal.id]" :meal="meal" />
          </div>
        </div>

        <div v-if="totalPages > 1" class="d-flex justify-content-center align-items-center gap-3 mt-4">
          <button class="btn btn-outline-secondary" :disabled="page === 1" @click="prev">Prev</button>
          <span>{{ page }} / {{ totalPages }}</span>
          <button class="btn btn-outline-secondary" :disabled="page === totalPages" @click="next">Next</button>
        </div>
      </template>
    </section>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useMeals } from '@/stores/meals'
import { useSearch } from '@/composables/useSearch'
import { usePagination } from '@/composables/usePagination'
import MealCard from '@/components/MealCard.vue'

const mealsStore = useMeals()
const { meals, loading, error } = storeToRefs(mealsStore)
const { fetchMeals } = mealsStore

// Search fields MUST match what MealCard renders. Cards show title only;
// searching nameExtend/description would create the "I typed something real
// and got no match" UX bug because the matched substring is invisible on
// the card. Expand this list only in lockstep with a visible card field.
const { query, results } = useSearch(meals, ['title'])
const { page, totalPages, paginated, next, prev } = usePagination(results, 9)

// Wrapper closure so @click does not leak its MouseEvent into the action
// (no-op today, latent footgun if fetchMeals ever grows an optional first
// arg). Mirrors the retry helper in MealPage.vue.
const retry = () => fetchMeals()

onMounted(fetchMeals)
</script>

<style scoped>
.highlight {
  color: var(--color-brand-blue-highlight);
}

.container {
  width: 80%;
}

section {
  margin-top: 130px;
}

#intro-text {
  padding: 0;
  margin: 50px 0px 80px 0px;
}

#intro-text p {
  font-size: 15px;
  color: rgb(170, 170, 170);
}

#search-banner {
  border-radius: 10px;
  background: linear-gradient(90deg, rgba(1,1,1,1) 40%, rgba(0,212,255,0) 82%), url(/src/assets/resources/img/menu-banner1.jpeg);
  background-size: 100% 120%;
  background-position: right;
  background-repeat: no-repeat;
  filter: brightness(1.1);
}

.search-bar {
  background-color: white;
  border-radius: 50px;
  padding: 5px;
  max-width: 300px;
}

.search-bar .form-control {
  border: none;
  box-shadow: none;
}

.search-bar .btn {
  background-color: transparent;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 15px;
}

.search-bar .btn i {
  font-size: 1.2rem;
  color: #000;
}

#menu h2 {
  text-align: center;
  margin-bottom: 20px;
}

@media only screen and (max-width: 991.98px) {
  .container {
    width: 100%;
  }

  #search-banner {
    background: linear-gradient(0deg, rgba(1,1,1,1) 25%, rgba(0,212,255,0) 68%), url(/src/assets/resources/img/menu-banner2.jpg);
    background-size: 120% 102%;
    background-position: right;
    text-align: center;
    height: 60vh;
    display: flex;
    align-items: flex-end;
  }

  #intro-text {
    width: 100%;
    text-align: center;
    padding-bottom: 0;
    margin-bottom: 30px;
  }

  .search-bar {
    background-color: white;
    padding: 5px;
    margin: 0 auto;
    max-width: 40%;
  }
}
</style>
