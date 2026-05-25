import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/components/HomePage.vue'),
    meta: { showNavbar: true }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/components/LoginPage.vue'),
    meta: { showNavbar: true }
  },
  {
    path: '/contact',
    name: 'contact',
    component: () => import('@/components/ContactPage.vue'),
    meta: { showNavbar: true }
  },
  {
    path: '/meal-page/:mealID',
    name: 'meal-page',
    component: () => import('@/components/MealPage.vue'),
    props: true,
    meta: { showNavbar: true }
  },
  {
    path: '/menu',
    name: 'menu',
    component: () => import('@/components/MenuPage.vue'),
    meta: { showNavbar: true }
  },
  {
    path: '/meal-plan',
    name: 'meal-plan',
    component: () => import('@/components/MealPlan.vue'),
    meta: { showNavbar: false },
    children: [
      { path: '', redirect: { name: 'planform' } },
      {
        path: 'planform',
        name: 'planform',
        component: () => import('@/components/PlanForm.vue'),
        meta: { step: 1 }
      },
      {
        path: 'deliveryform',
        name: 'deliveryform',
        component: () => import('@/components/DeliveryForm.vue'),
        meta: { step: 2 }
      },
      {
        path: 'paymentform',
        name: 'paymentform',
        component: () => import('@/components/PaymentForm.vue'),
        meta: { step: 3 }
      }
    ]
  },
  {
    path: '/how',
    name: 'howitworks',
    component: () => import('@/components/Howitworks.vue'),
    meta: { showNavbar: true }
  },
  {
    // User-facing path uses `/order-confirmation/:id` rather than `/orders/:id`
    // because there is no `/orders` list view (Task 11 spec: by-ID only) and
    // the user-friendly wording reads as a destination, not an API path.
    // Matches the 2026-05-24 design spec §6.6.
    path: '/order-confirmation/:id',
    name: 'order-confirmation',
    component: () => import('@/components/OrderConfirmation.vue'),
    props: true,
    meta: { showNavbar: true }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
