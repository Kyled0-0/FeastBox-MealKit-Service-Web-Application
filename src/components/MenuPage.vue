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
                <button class="btn btn-transparent" type="button">
                  <i class="bi bi-search"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="menu">
      <h2>What are you craving</h2>
      <div class="row g-5">
        <div class="col-md-3" v-for="meal in paginated" :key="meal.id">
          <MealCard v-memo="[meal.id]" :meal="meal" />
        </div>
        <p v-if="results.length === 0" class="text-center">No meals found.</p>
      </div>

      <div v-if="totalPages > 1" class="d-flex justify-content-center align-items-center gap-3 mt-4">
        <button class="btn btn-outline-secondary" :disabled="page === 1" @click="prev">Prev</button>
        <span>{{ page }} / {{ totalPages }}</span>
        <button class="btn btn-outline-secondary" :disabled="page === totalPages" @click="next">Next</button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useSearch } from '@/composables/useSearch'
import { usePagination } from '@/composables/usePagination'
import MealCard from '@/components/MealCard.vue'
import beefWraps from '/src/assets/resources/img/beefwraps/beef-wraps.jpeg'
import haloumiSalads from '/src/assets/resources/img/haloumisalad/haloumi-salad.jpeg'
import musselRissoto from '/src/assets/resources/img/musselrisotto/mussel_risotto.jpeg'
import sesameSalmon from '/src/assets/resources/img/sesamesalmon/sesame_salmon.jpeg'
import lambPizza from '/src/assets/resources/img/lambpizza/lamb_pizza.jpeg'
import butterWings from '/src/assets/resources/img/butterchicken/butter_chicken.jpeg'
import noodleSoup from '/src/assets/resources/img/noodlesoup/noodle_soup.jpeg'
import chickenWings from '/src/assets/resources/img/chickenwings/chicken_wings.jpeg'

const meals = ref([
  { id: '01', title: 'Fast Peppered Beef Wraps', description: 'with Chimichurri Tomato and Aioli', image: beefWraps },
  { id: '02', title: 'Easy Veggie and Haloumi Salad', description: 'with Red Pesto Dressing', image: haloumiSalads },
  { id: '03', title: 'Mediterranean Mussel and Tomato Risotto', description: 'with Fresh Spinach and Parsley', image: musselRissoto },
  { id: '04', title: 'Sesame Soy-Glazed Salmon', description: 'with Broccoli, Pak Choy and Brown Rice', image: sesameSalmon },
  { id: '05', title: 'Lebanese-Style Lamb Pizza', description: 'with Spinach Salad and Mint Yoghurt', image: lambPizza },
  { id: '06', title: 'Easy Plant-Based Butter Chicken', description: 'with Cumin Rice and Quick Red Onion Pickle', image: butterWings },
  { id: '07', title: 'Chicken Dumpling-Noodle Soup', description: 'with Greens and Chilli Vinegar', image: noodleSoup },
  { id: '08', title: 'Sticky Chicken Wings', description: 'with Coconut Rice and Stir-Fried Vegetables', image: chickenWings },
])

const { query, results } = useSearch(meals, ['title', 'description'])
const { page, totalPages, paginated, next, prev } = usePagination(results, 9)
</script>

<style scoped>
.highlight {
  color: #4fcde9;
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

@media only screen and (max-width: 1000px) {
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
