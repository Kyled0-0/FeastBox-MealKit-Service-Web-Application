<template>
  <div class="container-fluid mt-4 p-0 text-center">
    <nav>
      <router-link to="/">
        <img src="/src/assets/resources/img/logo1.png" width="100px" class="navbar-brand mb-3" alt="FeastBox logo">
      </router-link>
      
      <ol class="breadcrumb justify-content-center">
        <li v-for="(step, index) in steps" :key="index"
          :class="['breadcrumb-item', { 'active': currentStep === index + 1, 'completed': currentStep > index + 1 }]"
          @click="gotoStep(index + 1)">
          <span class="step-circle">{{ index + 1 }}</span>
          <span class="step-title">{{ step }}</span>
        </li>
      </ol>
      <div id="promo" class="pt-1 d-flex justify-content-center">
        <p>Remember to apply FEAST20 promo code to get 20% of your first meal box</p>
      </div>
    </nav>
  </div>

  <router-view ></router-view>
  


</template>


<script setup>
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const steps = ['Select a plan', 'Delivery details', 'Payment'];
const stepRoutes = { 1: 'planform', 2: 'deliveryform', 3: 'paymentform' };

const router = useRouter();
const route = useRoute();

const currentStep = computed(() => route.meta.step ?? 1);

function gotoStep(step) {
  const name = stepRoutes[step];
  if (name) router.push({ name });
}
</script>


<style scoped>

.breadcrumb {
  background-color: transparent;
  padding: 0;
  margin-bottom: 20px;
}

.breadcrumb-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  color: #6c757d;
  margin: 0 20px;
}

.breadcrumb-item.active,
.breadcrumb-item.completed {
  color: black;
}

.breadcrumb-item+.breadcrumb-item::before {
  content: '';
  background-color: #ffffff;
}

.step-circle {
  width: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  background-color: #e5e5e5;
  margin-bottom: 5px;
}

.breadcrumb-item.active .step-circle,
.breadcrumb-item.completed .step-circle {
  background-color: #70d4ea;
  color: #fff;
}

.step-title {
  font-size: 14px;
  text-align: center;
  font-weight: 500;
}

#promo {
  background-color: #70d4ea;
  font-size: 13px;
}

.container{
  width: 60%;
}

@media only screen and (max-width: 830px){
  .container{
  width: 100%;
  }
  .breadcrumb-item {
  margin: 0 10px;
}
}
</style>