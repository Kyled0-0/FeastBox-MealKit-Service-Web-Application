<template>
  <div class="container meal-wrapper" :aria-busy="loading">
    <div v-if="loading" class="d-flex justify-content-center py-5">
      <div class="spinner-border text-secondary" role="status">
        <span class="visually-hidden">Loading meal...</span>
      </div>
    </div>

    <div v-else-if="error && error.status === 404" class="text-center py-5">
      <p>Meal not found.</p>
      <router-link to="/menu" class="btn btn-link">Back to menu</router-link>
    </div>

    <div v-else-if="error" class="alert alert-danger" role="alert">
      <p class="mb-2">{{ error.message }}</p>
      <button type="button" class="btn btn-sm btn-outline-danger" @click="retry">
        Try again
      </button>
    </div>

    <template v-else-if="meal">
      <section id="description">
        <div class="row">
          <div class="col-lg-6 col-md-12 container">
            <div class="meal-container">
              <img :src="meal.imageUrl" class="img-fluid" :alt="meal.title">
            </div>
          </div>

          <div class="col-lg-6" id="meal-info">
            <h2>{{ meal.title }}</h2>
            <p>{{ meal.nameExtend }}</p>

            <div>
              <ul class="fw-bold my-4">
                <li v-for="(tag, index) in meal.tags" :key="index">
                  {{ tag }}
                </li>
              </ul>
            </div>
            <h5>From the <span>feast</span>box kitchen</h5>
            <p id="meal-intro">{{ meal.description }}</p>
            <router-link class="btn btn-custom fw-semibold" to="/meal-plan">Let's feast</router-link>
          </div>
        </div>
      </section>

      <section id="ingredients-nutri">
        <div class="row gx-5">
          <div v-if="meal.nutriFacts" class="col-lg-4 col-md-12" id="nutri">
            <p class="fw-semibold info-title">Nutritional facts</p>
            <ul>
              <li>Calories<span>{{ meal.nutriFacts.caloriesKcal }}</span></li>
              <hr>
              <li>Protein<span>{{ meal.nutriFacts.proteinG }}</span></li>
              <hr>
              <li>Carbs<span>{{ meal.nutriFacts.carbsG }}</span></li>
              <hr>
              <li>Fat<span>{{ meal.nutriFacts.fatG }}</span></li>
            </ul>
          </div>
          <div v-if="meal.ingredients?.length" class="col-lg-8 col-md-12" id="ingredient-div">
            <p class="fw-semibold info-title">Ingredients</p>
            <div id="ingredients">
              <div class="ingredient-container" v-for="(ingredient, index) in meal.ingredients"
                  :key="index">
                <div class="ingredient-img">
                  <img :src="ingredient.image" :alt="ingredient.name">
                </div>
                <p>{{ ingredient.name }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section v-if="meal.steps?.length" id="instructions">
        <div class="row">
          <p class="fw-semibold info-title">Step-by-step instructions</p>
          <div class="col-lg-4 col-md-6" v-for="(step, index) in meal.steps" :key="index">
            <div class="card">
              <img :src="step.image" class="card-img-top" :alt="step.title">
              <div class="card-body">
                <p class="card-title">{{ step.title }}</p>
                <!--
                  stepText is sanitised server-side by sanitiseMealSteps()
                  (DOMPurify policy: ALLOWED_TAGS=['span','strong'], no attrs)
                  before it ever lands in the DB. The carve-out in
                  CODE_REVIEW_CHECKLIST.md §1 for v-html holds ONLY because
                  every write goes through that sanitiser. Do not bypass.
                -->
                <p class="card-text" v-html="step.stepText"></p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import { watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useMeals } from '@/stores/meals'

const props = defineProps({
  mealID: { type: String, required: true }
})

const mealsStore = useMeals()
const { currentMeal: meal, loading, error } = storeToRefs(mealsStore)
const { fetchMeal } = mealsStore

// Vue Router reuses the component instance when only the param changes, so
// `/meal-page/A` -> `/meal-page/B` would otherwise show stale meal A. Using
// `immediate: true` replaces a separate onMounted + watch with a single
// source of truth for "load meal for current id".
watch(() => props.mealID, (id) => { if (id) fetchMeal(id) }, { immediate: true })

const retry = () => fetchMeal(props.mealID)
</script>

<style scoped>
.meal-wrapper {
    width: 80%;
}

section {
    margin-top: 70px;
}

.info-title {
    margin-left: 10px;
    font-size: 20px;
    color: var(--color-brand-orange);
}

.meal-container {
    overflow: hidden;
    width: 100%;
    height: 550px;
    border-radius: 8% 25% 18% 55%;
    position: relative;
}

.meal-container img {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100vw;
    height: 550px;
    object-fit: cover;
}

#description .row div:nth-child(2) p:first-of-type {
    color: rgb(137, 137, 137);
    font-size: 20px;
    margin-top: -10px;
}

#meal-info {
    margin-top: 70px;
}

#description ul,
#nutri ul {
    list-style-type: none;
    padding: 0;
    margin: 0;
}

#description li {
    display: inline;
    margin-right: 10px;
    font-size: 12px;
    background-color: rgb(246, 246, 246);
    padding: 5px;
    font-family: monospace;
    color: rgb(112, 111, 111);
}

#meal-intro {
    text-align: justify;
}

#nutri li {
    display: flex;
    justify-content: space-between;
    padding: 5px 0;
}

.ingredient-img {
    overflow: hidden;
    width: 110px;
    height: 110px;
    border-radius: 80px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.ingredient-img img {
    width: 120px;
    height: auto;
}

#ingredients {
    display: flex;
    flex-wrap: wrap;
    gap: 50px;
}

.ingredient-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    width: 110px;
    margin-bottom: 10px;
}

.ingredient-container p {
    margin-top: 5px;
    font-size: 14px;
    word-wrap: break-word;
    line-height: 1.2;
}

hr {
    margin-top: 0px;
    margin-bottom: 0px;
}

.card {
    border: none !important;
    margin: 10px auto;
}

.card-title{
    font-weight: bold;
}

:deep(.card-text span) {
    font-weight: bold;
}
/*tablet*/
@media only screen and (max-width: 991.98px) {

    .meal-container {
        width: 90vw;
        margin-left: -5vw;
        border-radius: 34% 45% 55% 66%;
    }

    #meal-info {
        margin-top: 0px;
    }

    #nutri {
        background-color: rgb(250, 250, 250);
        padding: 20px;
        border-radius: 20px;
    }

    #ingredient-div {
        margin-top: 10px;
        background-color: rgb(250, 250, 250);
        padding: 20px;
        border-radius: 20px;
    }
}

/*mobile*/
@media only screen and (max-width: 575.98px) {
    .meal-container {
        width: 100vw;
        margin-left: -55px;
        border-radius: 0;
    }
}
</style>
