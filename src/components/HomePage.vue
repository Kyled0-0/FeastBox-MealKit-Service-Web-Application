<template>
    <div class="container-fluid">
        <section id="slogan" class="mb-5">
            <div id="introbg-container">
                <img src="/src/assets/resources/img/intro-bg3.jpg">
            </div>
            <div id="inside-text-bg">
                <h2 class="fw-bold">"Unbox the Flavor, Savor the Feast!"</h2>
                <p class="lead">Discover Fresh Ingredients, Delicious Recipes, and Effortless Cooking Delivered Straight
                    to
                    Your Doorstep.</p>
                <router-link class="btn btn-custom fw-bold p-3" to="/meal-plan">Start the Feast</router-link>
            </div>
        </section>
    </div>

    <div class="container">
        <section id="howitworks-brief" class="content-section">
            <h2 class="text-center mb-5">How Feastbox Meal Kit Delivery Works</h2>
            <div class="row">
                <div class="col-md-4">
                    <div class="card">
                        <img src="/src/assets/resources/img/intro-icon1.png" width="100px" class="mx-auto mb-4">
                        <div class="card-body text-center">
                            <h5 class="card-title">Choose Your Meals</h5>
                            <p class="card-text lead">Browse our chef-curated recipes and select dishes that match your
                                taste and
                                dietary
                                preferences.
                            </p>

                        </div>
                    </div>
                </div>

                <div class="col-md-4">
                    <div class="card">
                        <img src="/src/assets/resources/img/intro-icon2.png" width="100px" class="mx-auto mb-4">
                        <div class="card-body text-center">
                            <h5 class="card-title">Receive Your Ingredients</h5>
                            <p class="card-text lead">We deliver fresh, pre-portioned ingredients straight to your door,
                                packed
                                to stay
                                cool and ready for easy meal prep.
                            </p>
                        </div>
                    </div>
                </div>

                <div class="col-md-4">
                    <div class="card">
                        <img src="/src/assets/resources/img/intro-icon3.png" width="100px" class="mx-auto mb-4">
                        <div class="card-body text-center">
                            <h5 class="card-title">Cook & Enjoy</h5>
                            <p class="card-text lead">Follow our simple, step-by-step recipe cards to cook delicious,
                                home-cooked
                                meals in
                                just 30-45 minutes.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section id="meals-view" class="content-section text-center">
            <div>
                <h2 class="fw-bold text-brand choose-label">CHOOSE FROM</h2>
                <p class="fw-semibold choose-count">50+ meal options</p>
            </div>
            <MealStrip :meals="featuredMeals" />
                <router-link class="btn btn-custom fw-semibold p-3 mt-3" to="/menu">Browse Our
                    Menu</router-link>
        </section>

        <section class="content-section text-center" id="advertisment">
            <div id="ad-container">
                <img src="/src/assets/resources/img/intro-ad.jpg">
            </div>
            <div id="inside-text-ad">
                <h2 class="fw-bold mb-2">Elevate Your Meals with Feastbox!</h2>
                <p id="ad-text">Discover global flavors right in your kitchen with Feastbox meal kits. Get
                    fresh, pre-portioned ingredients and easy-to-follow recipes, making gourmet cooking simple and fun.
                </p>
                <router-link to="/meal-plan"  class="btn btn-custom fw-bold p-2 mt-3">Get 20% Off</router-link>
                <p class="lead promo-text">Get 20% off your first box with code <span class="fw-semibold">FEAST20</span>. Start
                    your culinary adventure today!</p>
            </div>
        </section>
    </div>
</template>

<script setup>
import MealStrip from '@/components/MealStrip.vue'
import cheeseRavioli from '/src/assets/resources/img/cheese-ravioli.jpeg'
import phillyCheesesteak from '/src/assets/resources/img/philly-cheesesteak.jpeg'
import prawnRumpSteak from '/src/assets/resources/img/prawn-rump-steak.jpeg'
import roastLambTacos from '/src/assets/resources/img/roast-lamb-tacos.jpeg'
import shepherdPie from '/src/assets/resources/img/shephard-pie.jpeg'
import smokedSalmonSalad from '/src/assets/resources/img/smoked-salmon-salad.jpeg'
import spicyLambRice from '/src/assets/resources/img/spicy-lamb-rice.jpeg'
import steakAsada from '/src/assets/resources/img/steak-asada.jpeg'
import sweetChiliPorkNoodles from '/src/assets/resources/img/sweet-chili-pork-noodles.jpeg'

const featuredMeals = [
  { id: 'h01', image: cheeseRavioli, title: 'Four Cheese Raviolo with Eggplant Sauce' },
  { id: 'h02', image: phillyCheesesteak, title: 'Philly Cheese Steak with Roast Sweet Potato Fries and Salad' },
  { id: 'h03', image: prawnRumpSteak, title: "Prawn and Rump Steak Surf 'n' Turf with Pepper Garlic Sauce" },
  { id: 'h04', image: roastLambTacos, title: 'Mojo Verde Roast Lamb Tacos' },
  { id: 'h05', image: shepherdPie, title: "Lamb Shepherd's Pie with Sweet Potato Mash" },
  { id: 'h06', image: smokedSalmonSalad, title: 'Smoked Salmon Salad with Yoghurt Dressing' },
  { id: 'h07', image: spicyLambRice, title: 'Spicy Lamb Rice with Oyster Sauce and Choy Sum' },
  { id: 'h08', image: steakAsada, title: 'Steak Carne Asada with Salad and Tortillas' },
  { id: 'h09', image: sweetChiliPorkNoodles, title: 'Sweet Chili Pork Noodles' },
]
</script>

<style scoped>
.content-section {
    margin-bottom: 100px;
}

#introbg-container {
    transform: scale(1.02);
    filter: brightness(70%);
    position: relative;
    width: 100%;
    height: 600px;
    overflow: hidden;
}

#introbg-container img {
    width: 100%;
    height: 700px;
    object-fit: cover;
}

#inside-text-bg {
    position: absolute;
    top: 450px;
    left: 50%;
    color: white;
    transform: translate(-50%, -50%);
    text-align: center;
    width: 37%;
}

.card {
    border: none;
}



#advertisment {
    margin-bottom: 0;
    position: relative;
}

#ad-container {
    filter: brightness(85%);
    width: 100%;
    height: 500px;
    overflow: hidden;
}

#ad-container img {
    width: 100%;
    height: 500px;
    object-fit: cover;
}

#inside-text-ad {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 40%;
    background-color: white;
    padding: 50px;
}

#inside-text-ad h2 {
    color: var(--color-brand-orange);
}

.choose-label {
    margin-bottom: -10px;
}

.choose-count {
    font-size: 35px;
}
/*tablet*/
@media only screen and (max-width: 991.98px) {
    #inside-text-bg {
        width: 80%;
    }

    #inside-text-ad {
        width: 60%;
    }

    #ad-text {
        display: none;
    }
}

/*mobile*/
@media only screen and (max-width: 575.98px) {
    #inside-text-bg {
        width: 80%;
    }

    #inside-text-ad {
        width: 80%;
    }
}


</style>