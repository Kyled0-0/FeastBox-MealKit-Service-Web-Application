<template>
    <div class="container">
        <section id="search-banner">
            <div class="container py-3 text-white">
                <div class="row align-items-center">
                    <div class="col-lg-9" id="intro-text">
                        <div>
                            <h1>Gourmet meals <span style="color: #4fcde9;">delivered weekly.</span></h1>
                            <p class="fw-semibold">The feastbox team brings a variety of fresh, fully cooked meals to
                                your
                                table
                                every week.</p>
                        </div>
                        <div class="input-group mt-4 search-bar">
                            <input type="text" class="form-control" v-model="searchMeal" placeholder="Search">
                            <div class="input-group-append">
                                <button class="btn btn-transparent" type="button" @click="Search">
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
                <div class="col-md-3" v-for="meal in searchResults" :key="meal.id">
                    <router-link :to="{ name: 'meal-page', params: { mealID: meal.id } }">
                        <div class="card h-100">
                            <img :src="meal.image" class="card-img-top">
                            <div class="card-body text-center">
                                <p class="card-title fw-bold mb-0" >{{ meal.title }}</p>
                                <p class="card-text">{{ meal.description }}</p>
                            </div>
                        </div>
                    </router-link>
                </div>
                <p v-if="searchResults.length === 0" class="text-center">No meals found.</p>
            </div>
        </section>
    </div>
</template>

<script setup>
import {ref} from 'vue';

const searchMeal = ref('');

const meals = ref([
    {
        id:'01',
        title:'Fast Peppered Beef Wraps',
        description:'with Chimichurri Tomato and Aioli',
        image:'/src/assets/resources/img/beefwraps/beef-wraps.jpeg',
    },
    {
        id:'02',
        title:'Easy Veggie and Haloumi Salad',
        description:'with Red Pesto Dressing',
        image:'/src/assets/resources/img/haloumisalad/haloumi-salad.jpeg',
    },
    {
        id:'03',
        title:'Mediterranean Mussel and Tomato Risotto',
        description:'with Fresh Spinach and Parsley',
        image:'/src/assets/resources/img/musselrisotto/mussel_risotto.jpeg'
    },
    {
        id:'04',
        title:'Sesame Soy-Glazed Salmon',
        description:'with Broccoli, Pak Choy and Brown Rice',
        image:'/src/assets/resources/img/sesamesalmon/sesame_salmon.jpeg'
    },
    {
        id:'05',
        title:'Lebanese-Style Lamb Pizza',
        description:'with Spinach Salad and Mint Yoghurt',
        image:'/src/assets/resources/img/lambpizza/lamb_pizza.jpeg'
    },
    {
        id:'06',
        title:'Easy Plant-Based Butter Chicken',
        description:'with Cumin Rice and Quick Red Onion Pickle',
        image:'/src/assets/resources/img/butterchicken/butter_chicken.jpeg'
    },
    {
        id:'07',
        title:'Chicken Dumpling-Noodle Soup',
        description:'with Greens and Chilli Vinegar',
        image:'/src/assets/resources/img/noodlesoup/noodle_soup.jpeg'
    },
    {
        id:'08',
        title:'Sticky Chicken Wings',
        description:'with Coconut Rice and Stir-Fried Vegetables',
        image:'/src/assets/resources/img/chickenwings/chicken_wings.jpeg'
    }


]);


const searchResults = ref([...meals.value]); 


const Search = () => {
    const query = searchMeal.value.trim().toLowerCase();
    if (query === '') {
        searchResults.value = [...meals.value];
    } else {
        searchResults.value = meals.value.filter(meal => {
            return meal.title.toLowerCase().includes(query) ||
                   meal.description.toLowerCase().includes(query);
        });
    }
};
</script>

<style scoped>

.container{
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


.card {
    border: 1px solid rgb(242, 242, 242); /* Change the border color */
    box-shadow: 0 2px 2px 0 rgba(0,0,0,.05);
   transition: box-shadow 0.3s ease-in-out;  
}

.card:hover{
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2); /* Increased shadow on hover */
}

.card-title{
    font-size: 17px;
}

.card-text{
    font-size: 15px;
}

a{text-decoration: none;}

#menu h2{
    text-align: center;
    margin-bottom: 20px;
}

@media only screen and (max-width: 1000px){
    .container{
        width: 100%;
    }

    #search-banner {
    background: linear-gradient(0deg, rgba(1,1,1,1) 25%, rgba(0,212,255,0) 68%), url(/src/assets/resources/img/menu-banner2.jpg);
    background-size: 120% 102%;
    background-position:right;
    text-align: center;
    height: 60vh;
    display: flex;
    align-items: flex-end;
}
    #intro-text{
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