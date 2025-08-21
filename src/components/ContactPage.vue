<template>
    <div class="container-fluid px-0" id="contact-info">
        <div class="container" style="width: 70%;">
            <div class="row">
                <div class="col-md-7 contact-form">
                    <div class="py-4">
                        <h3>Contact Form</h3>
                        <form>
                            <div class="mb-3">
                                <input type="text" class="form-control" id="inputName" placeholder="Name"
                                    onchange="addIcon('inputName','helpName')" required>
                                <div><i class="bi icon" id="helpName"></i></div>
                            </div>
                            <div class="mb-3">
                                <input type="email" class="form-control" id="inputEmail" placeholder="Email Address"
                                    onchange="addIcon('inputEmail','helpEmail')" required>
                                <div><i class="bi icon" id="helpEmail"></i></div>
                            </div>
                            <div class="mb-3">
                                <input type="text" class="form-control" id="inputPhone" placeholder="Phone Number"
                                    onchange="addIcon('inputPhone','helpPhone')" required>
                                <div><i class="bi icon" id="helpPhone"></i></div>
                            </div>
                            <div class="mb-3">
                                <select class="form-select" id="inputTopic" name="topic"
                                    onclick="addIcon('inputTopic','helpTopic')" required>
                                    <option value="0" selected disabled>Topics</option>
                                    <option value="1">About FeastBox</option>
                                    <option value="2">Recipes and Ingredients</option>
                                    <option value="3">Subscription</option>
                                    <option value="4">Delievery</option>
                                    <option value="5">Billing</option>
                                    <option value="6">Other</option>
                                </select>
                                <div><i class="bi icon" id="helpTopic"></i></div>
                            </div>
                            <div class="mb-3">
                                <textarea class="form-control" rows="4" placeholder="Message" id="inputMsg"
                                    onchange="addIcon('inputMsg','helpMsg')" required></textarea>
                                <div><i class="bi icon" id="helpMsg"></i></div>
                            </div>
                            <div class="text-end">
                                <button class="btn btn-custom2" type="submit">Send Message</button>
                            </div>
                        </form>
                    </div>
                </div>
                <div class="col-md-5">
                    <section id="contact" class="py-4">
                        <div>
                            <h3>Contact Us</h3>
                            <div>
                                <p>Have questions or need assistance? Feel free to reach out to us through the contact
                                    details
                                    below.
                                    Our friendly staff is here to help!</p>
                                <p>Email: info@feastbox.com</p>
                                <p>Phone: (123) 456-7890</p>
                                <img src="/src/assets/resources/img/help.png" id="help">
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    </div>

    <div class="container">
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
#contact-info{
    
    margin-top: 100px;
}

#contact-info h3{
    color: #FFC907;
}

#contact-info input{
    border-radius: 0px;
}

#contact-info select{
    border-radius: 0px;
}

#contact p{
    color: black;
}

#contact-info .btn-custom{
    background-color: #FFC907;
    border-radius: 20px;
}

#contact-info .btn-custom:hover{
    background-color: white;
}

.icon{
    position: absolute;
    text-align: end;
    margin-top: -30px;
    margin-left: 37%;
}

#help{
    position: relative;
    margin-left: 140px;
    margin-top: -80px;
    width: 250px;
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

.btn-custom2{
  background-color: #FFC907;
  border-radius: 30px;
  font-size: 17px;
}

.btn-custom2:hover{
  background-color: #ffdb5a;
}

/*tablet */
@media only screen and (max-width: 830px){
    .icon{
        margin-left: 35%;
    }

    #inside-text-ad {
        width: 60%;
    }

    #ad-text {
        display: none;
    }

    #help{
        margin-left: 0px;
        margin-top: -30px;
        width:200px;
    }
}

/*mobile */
@media only screen and (max-width: 450px){
    .icon{
        margin-left: 59%;
    }

    #inside-text-ad {
        width: 80%;
    }

    #help{
        width:200px;
    }
}

</style>