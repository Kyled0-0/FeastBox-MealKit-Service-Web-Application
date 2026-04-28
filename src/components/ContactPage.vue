<template>
    <div class="container-fluid px-0" id="contact-info">
        <div class="container" style="width: 70%;">
            <div class="row">
                <div class="col-md-7 contact-form">
                    <div class="py-4">
                        <h3>Contact Form</h3>
                        <form @submit.prevent="handleSubmit">
                            <div class="mb-3">
                                <input type="text" class="form-control" id="inputName" placeholder="Name"
                                    v-model="form.name" @input="validate('name', form)" required>
                                <p v-if="errors.name" class="text-danger fst-italic">{{ errors.name }}</p>
                            </div>
                            <div class="mb-3">
                                <input type="email" class="form-control" id="inputEmail" placeholder="Email Address"
                                    v-model="form.email" @input="validate('email', form)" required>
                                <p v-if="errors.email" class="text-danger fst-italic">{{ errors.email }}</p>
                            </div>
                            <div class="mb-3">
                                <input type="text" class="form-control" id="inputPhone" placeholder="Phone Number"
                                    v-model="form.phone" @input="validate('phone', form)" required>
                                <p v-if="errors.phone" class="text-danger fst-italic">{{ errors.phone }}</p>
                            </div>
                            <div class="mb-3">
                                <select class="form-select" id="inputTopic" name="topic"
                                    v-model="form.topic" @change="validate('topic', form)" required>
                                    <option value="0" selected disabled>Topics</option>
                                    <option value="1">About FeastBox</option>
                                    <option value="2">Recipes and Ingredients</option>
                                    <option value="3">Subscription</option>
                                    <option value="4">Delivery</option>
                                    <option value="5">Billing</option>
                                    <option value="6">Other</option>
                                </select>
                                <p v-if="errors.topic" class="text-danger fst-italic">{{ errors.topic }}</p>
                            </div>
                            <div class="mb-3">
                                <textarea class="form-control" rows="4" placeholder="Message" id="inputMsg"
                                    v-model="form.message" @input="validate('message', form)" required></textarea>
                                <p v-if="errors.message" class="text-danger fst-italic">{{ errors.message }}</p>
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

<script setup>
import { ref } from 'vue'
import { useFormValidation } from '@/composables/useFormValidation'
import { required, email, digits, notZero } from '@/composables/validators'

const form = ref({
  name: '',
  email: '',
  phone: '',
  topic: '0',
  message: ''
})

const { errors, validate, validateAll, isValid } = useFormValidation({
  name: [required()],
  email: [required(), email()],
  phone: [required(), digits(10, 'Phone must be exactly 10 digits')],
  topic: [notZero('Please select a topic')],
  message: [required('Message is required')]
})

function handleSubmit() {
  validateAll(form.value)
  if (isValid.value) {
    // Phase 2: send to API
  }
}
</script>

<style scoped>
#contact-info{

    margin-top: 100px;
}

#contact-info h3{
    color: var(--color-brand-yellow);
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
    background-color: var(--color-brand-yellow);
    border-radius: 20px;
}

#contact-info .btn-custom:hover{
    background-color: white;
}

#help{
    position: relative;
    margin-left: 140px;
    margin-top: -80px;
    width: 250px;
}

#advertisment {
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

.btn-custom2{
  background-color: var(--color-brand-yellow);
  border-radius: 30px;
  font-size: 17px;
}

.btn-custom2:hover{
  background-color: var(--color-brand-yellow-light);
}

.text-danger{
    font-size: 12px;
    margin-bottom: 0px;
}

/*tablet */
@media only screen and (max-width: 991.98px){
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
@media only screen and (max-width: 575.98px){
    #inside-text-ad {
        width: 80%;
    }

    #help{
        width:200px;
    }
}

</style>
