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
                <h2 class="fw-bold" style="color:#ff603d; margin-bottom:-10px;">CHOOSE FROM</h2>
                <p class="fw-semibold" style="font-size: 35px;">50+ meal options</p>
            </div>
            <div class="scrollable-image">
                <div class="meal">
                    <img src="/src/assets/resources/img/cheese-ravioli.jpeg" class="img-fluid">
                    <div class="meal-text fw-bold">Four Cheese Raviolo<br>with Eggplant Sauce</div>
                </div>
                <div class="meal">
                    <img src="/src/assets/resources/img/philly-cheesesteak.jpeg" class="img-fluid">
                    <div class="meal-text fw-bold">Philly Cheese Steak with Roast<br>Sweet Potato Fries and Salad
                    </div>
                </div>
                <div class="meal">
                    <img src="/src/assets/resources/img/prawn-rump-steak.jpeg" class="img-fluid">
                    <div class="meal-text fw-bold">Prawn and Rump Steak Surf 'n' Turf<br>with Pepper Garlic Sauce
                    </div>
                </div>
                <div class="meal">
                    <img src="/src/assets/resources/img/roast-lamb-tacos.jpeg" class="img-fluid">
                    <div class="meal-text fw-bold">Mojo Verde Roast Lamb Tacos</div>
                </div>
                <div class="meal">
                    <img src="/src/assets/resources/img/shephard-pie.jpeg" class="img-fluid">
                    <div class="meal-text fw-bold">Lamb Shepherd's Pie with<br>Sweet Potato Mash</div>
                </div>
                <div class="meal">
                    <img src="/src/assets/resources/img/smoked-salmon-salad.jpeg" class="img-fluid">
                    <div class="meal-text fw-bold">Smoked Salmon Salad with<br>Yoghurt Dressing</div>
                </div>
                <div class="meal">
                    <img src="/src/assets/resources/img/spicy-lamb-rice.jpeg" class="img-fluid">
                    <div class="meal-text fw-bold">Spicy Lamb Rice with<br>Oyster Sauce and Choy Sum</div>
                </div>
                <div class="meal">
                    <img src="/src/assets/resources/img/steak-asada.jpeg" class="img-fluid">
                    <div class="meal-text fw-bold">Steak Carne Asada with<br>Salad and Tortillas</div>
                </div>
                <div class="meal">
                    <img src="/src/assets/resources/img/sweet-chili-pork-noodles.jpeg" class="img-fluid">
                    <div class="meal-text fw-bold">Sweet Chili Pork Noodles</div>
                </div>
            </div>
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
                <p class="lead" style="font-size: 14px;">Get 20% off your first box with code <span class="fw-semibold">FEAST20</span>. Start
                    your culinary adventure today!</p>
            </div>
        </section>
    </div>
</template>

<script>

</script>

<style scoped>
.content-section {
    margin-bottom: 100px;
}

#introbg-container {
    scale: 1.02;
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


.scrollable-image {
    overflow-x: auto;
    white-space: nowrap;
}

.meal {
    display: inline-block;
    width: 325px;
    height: 300px;
    position: relative;
    overflow: hidden;
    margin-right: 4px;
}

.meal img {
    margin-top: 40px;
    scale: 1.4;
}

.meal-text {
    position: absolute;
    height: 100px;
    width: 100%;
    bottom: 0;
    padding-top: 20px;
    background: rgba(0, 0, 0, 0.6);
    color: white;
    text-align: center;
    font-size: 17px;
}

#advertisment{
    margin-bottom: 0px;
}

#ad-container {
    filter: brightness(85%);
    position: relative;
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
    left: 50%;
    margin-top: -255px;
    transform: translate(-50%, -50%);
    width: 40%;
    background-color: white;
    padding: 50px;
}

#inside-text-ad h2 {
    color: #ff603d;
}
/*tablet*/
@media only screen and (max-width: 830px) {
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
@media only screen and (max-width: 450px) {
    #inside-text-bg {
        width: 80%;
    }

    #inside-text-ad {
        width: 80%;
    }
}


</style>