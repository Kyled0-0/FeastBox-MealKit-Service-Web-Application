<template>
    <div class="container-fluid how-it-works-bg">
    <div class="container-bg">
        <div class="row align-items-center">
            <div class="col-lg-6 order-lg-2">
                <div id="carousel_img" class="carousel slide carousel-fade" data-bs-ride="carousel" data-interval="5000">
                    <div class="carousel-inner">
                        <div class="carousel-item">
                            <img src="/src/assets/resources/img/carousel-img1.jpg" class="d-block w-100" alt="...">
                        </div>
                        <div class="carousel-item active">
                            <img src="/src/assets/resources/img/carousel-img2.jpg" class="d-block w-100" alt="...">
                        </div>
                        <div class="carousel-item">
                            <img src="/src/assets/resources/img/carousel-img3.jpg" class="d-block w-100" alt="...">
                        </div>
                        <div class="carousel-item">
                            <img src="/src/assets/resources/img/carousel-img4.jpg" class="d-block w-100" alt="...">
                        </div>
                    </div>
                    <button class="carousel-control-prev" type="button" data-bs-target="#carousel_img"
                        data-bs-slide="prev">
                        <span class="visually-hidden">Previous</span>
                    </button>
                    <button class="carousel-control-next" type="button" data-bs-target="#carousel_img"
                        data-bs-slide="next">
                        <span class="visually-hidden">Next</span>
                    </button>
                </div>
            </div>

            <div class="col-lg-6 text-white" id="bg-text">
                <h1 class="display-6">Deliciously curated meals, prepared by our <span class="highlight">culinary
                        team</span></h1>
                <p class="lead mt-4">Feastbox delivers fresh, chef-crafted dishes to your doorstep every week – ready to
                    cook and enjoy!</p>
            </div>
        </div>
    </div>
</div>


    <section class="container mt-5" id="how-it-works-section">
        <h2 class="text-center mb-5">How <span style="color:#ff603d">Feastbox</span> Meal Kit Delivery Works</h2>
        <div class="row align-items-center mb-5">
            <div class="col-lg-6 px-5">
                <h2>01 | Choose your meals</h2>
                <p>Browse our chef-curated recipes and select dishes that match your taste and dietary preferences.</p>
            </div>
            <div class="col-lg-6 px-5">
                <img src="/src/assets/resources/img/howitworks_choose.jpg" class="img-fluid"
                    alt="Set your preferences image">
            </div>
        </div>

        <div class="row align-items-center mb-5">
            <div class="col-lg-6 px-5 order-lg-2">
                <h2>02 | Receive Your Ingredients</h2>
                <p>We deliver fresh, pre-portioned ingredients straight to your door, packed to stay cool and ready for
                    easy meal prep.</p>
            </div>
            <div class="col-lg-6 px-5 order-lg-1">
                <img src="/src/assets/resources/img/howitworks_receive.jpg" class="img-fluid"
                    alt="Choose your meals image">
            </div>
        </div>

        <div class="row align-items-center mb-5">
            <div class="col-lg-6 px-5">
                <h2>03 | Cook & Enjoy</h2>
                <p>Follow our simple, step-by-step recipe cards to cook delicious, home-cooked meals in just 30-45
                    minutes.</p>
            </div>
            <div class="col-lg-6 px-5">
                <img src="/src/assets/resources/img/chorizo-chilli-loaded-fries.jpeg" class="img-fluid"
                    alt="Set your preferences image">
            </div>
        </div>
    </section>

    <section class="container" id="preference-section">
        <h2 class="text-center mb-5">Our meal preferences</h2>
        <div class="row">
            <div class="col-lg-3 col-md-6 mb-4" id="variety">
                <div class="card h-100 card-blue">
                    <div class="img-container">
                        <img src="/src/assets/resources/img/img_variety.jpg" class="card-img-top">
                    </div>

                    <div class="card-body text-center">
                        <h5 class="card-title">Everyday variety</h5>
                        <p class="card-text lead">Inspiring recipes and quality ingredients from across our delicious
                            menu
                        </p>

                    </div>
                </div>
            </div>

            <div class="col-lg-3 col-md-6 mb-4" id="comfort">
                <div class="card h-100 card-orange">
                    <div class="img-container card-img-top">
                        <img src="/src/assets/resources/img/img_comfort.jpg" >
                    </div>

                    <div class="card-body text-center">
                        <h5 class="card-title">Classic Comforts</h5>
                        <p class="card-text lead">Timeless dishes that bring warmth and familiraity</p>
                    </div>
                </div>
            </div>

            <div class="col-lg-3 col-md-6 mb-4" id="healthy">
                <div class="card h-100 card-blue">
                    <div class="img-container">
                        <img src="/src/assets/resources/img/img_healthy.jpg" class="card-img-top">
                    </div>

                    <div class="card-body text-center">
                        <h5 class="card-title">Lean & Healthy</h5>
                        <p class="card-text lead">Balanced meals focused on health without sacrificing flavor. These
                            recipes are low in calories but high in satisfaction.
                        </p>
                    </div>
                </div>
            </div>

            <div class="col-lg-3 col-md-6 mb-4" id="vegetarian">
                <div class="card h-100 card-orange">
                    <div class="img-container">
                        <img src="/src/assets/resources/img/img_vegetarian.jpg" class="card-img-top">
                    </div>

                    <div class="card-body text-center">
                        <h5 class="card-title">Vegetartian Delight</h5>
                        <p class="card-text lead">Fresh, wholesome, and full of flavor, these plant-based meals showcase
                            the best of seasonal produce
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section class="content-section text-center container" id="advertisment">
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



</template>

<script setup></script>

<style scoped>
.container-bg{
    width: 90%;
    margin: 0 auto;
}

#how-it-works-section {
    width: 70%;
}

section {
    margin-top: 100px;
}

.how-it-works-bg {
    background-color: #191414;
    padding-top: 50px;
}

.text-white {
    color: white !important;
}

.highlight {
    color: #70d4ea;
    font-weight: bold;
}

.img-fluid {
    max-width: 100%;
    height: auto;
}

.carousel-item {
    transition: transform 4s ease, opacity 2s ease;
}

.card-text {
    font-size: 17px;
}

.card {
    border: none;
}

.card-blue{
    background-color: #c5f4ff;
}

.card-orange{
    background-color: #ffd9d0;
}

.img-container {
    height: 200px;
    overflow: hidden;
    border-radius: 5px 5px 0 0;
}

.img-container img{
    width: 100%;
}

#variety img{
    scale: 1.35;
}

#vegetarian img{
    margin-top: -15px;
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

    #inside-text-ad {
        width: 60%;
    }

    #ad-text {
        display: none;
    }

    .container-bg{
        width: 100vw;
        margin-left: -12px;
    }

    .container-bg #bg-text{
        width: 70%;
        margin: 0 auto;
        text-align: center;
    }
}

/*mobile*/
@media only screen and (max-width: 450px) {
    #how-it-works-section {
    width: 100%;
    }   

    #inside-text-ad {
        width: 80%;
    }

    .container-bg #bg-text{
        width: 90%;
    }
}
</style>