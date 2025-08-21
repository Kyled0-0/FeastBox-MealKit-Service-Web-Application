import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../components/HomePage.vue';
import LoginPage from '../components/LoginPage.vue';
import ContactPage from '../components/ContactPage.vue';
import MealPage from '../components/MealPage.vue';
import MenuPage from '../components/MenuPage.vue';
import MealPlan from '../components/MealPlan.vue';
import Howitworks from '../components/Howitworks.vue';
import PlanForm from '../components/PlanForm.vue';
import DeliveryForm from '../components/DeliveryForm.vue';
import PaymentForm from '../components/PaymentForm.vue';

const routes = [
    {
        path: '/',
        name: 'home',
        component: HomePage,
        meta: { showNavbar: true }
    },
    {
        path: '/login',
        name: 'login',
        component: LoginPage,
        meta: { showNavbar: true }
    },
    {
        path: '/contact',
        name: 'contact',
        component: ContactPage,
        meta: { showNavbar: true }
    },
    {
        path: '/meal-page/:mealID',
        name: 'meal-page',
        component: MealPage,
        props: true,
        meta: { showNavbar: true }
    },
    {
        path: '/menu',
        name: 'menu',
        component: MenuPage,
        meta: { showNavbar: true }
    },
    {
        path: '/meal-plan',
        name: 'meal-plan',
        component: MealPlan,
        mata: {showNavbar: false},
        children:[
            {
                path: '/planform',
                name: 'planform',
                component: PlanForm
            },
            {
                path:'/deliveryform',
                name: 'deliveryform',
                component: DeliveryForm
            },
            {
                path:'/paymentform',
                name:'paymentform',
                component: PaymentForm
            }
        ]
    },
    {
        path: '/how',
        name: 'howitworks',
        component: Howitworks,
        meta: { showNavbar: true }
    },

];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
});

export default router;