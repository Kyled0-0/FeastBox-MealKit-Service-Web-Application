<template>
    <div class="container mt-5" id="plan">
        <h4 class="fw-bold">Choose the right <span style="color:#ff603d ;">Feast</span>Box meal kit for you</h4>
        <div class="mt-4">
            <div class="row">
                <!-- Meal Preferences Section -->
                <div class="col-md-6 px-4" id="meal-kind">
                    <p class="fw-bold mb-0">What meals excite your taste buds?</p>
                    <p style="text-align: justify;">Pick your favorite flavors for personalized recipe ideas, or go with Everyday Variety for a
                        delicious mix.
                        No matter what you choose, you’ll have access to all our mouth-watering recipes every week!</p>

                    <div class="btn-group-vertical w-100" role="group">
                        <input type="radio" class="btn-check" name="mealPreference" id="variety" value="Everyday Variety" v-model="planData.preference" checked>
                        <label class="btn btn-custom-plan text-start d-flex align-items-center" for="variety">
                            <img src="/src/assets/resources/img/variety.png" width="55px" class="me-2">
                            <div>
                                <strong>Everyday Variety</strong><br>
                                Inspiring recipes and quality ingredients from across our delicious menu
                            </div>

                        </label>

                        <input type="radio" class="btn-check" name="mealPreference" id="classics" value="Classic Comforts" v-model="planData.preference">
                        <label class="btn btn-custom-plan text-start d-flex align-items-center" for="classics">
                            <img src="/src/assets/resources/img/comfort.png" width="45px" class="me-3">
                            <div>
                                <strong>Classic Comforts</strong><br>
                                Timeless dishes that bring warmth and familiarity
                            </div>

                        </label>

                        <input type="radio" class="btn-check" name="mealPreference" id="lean&health" value="Lean & Healthy" v-model="planData.preference">
                        <label class="btn btn-custom-plan text-start d-flex align-items-center" for="lean&health">
                            <img src="/src/assets/resources/img/lean.png" width="45px" class="me-3">
                            <div>
                                <strong>Lean & Healthy</strong><br>
                                Balanced meals focused on health without sacrificing flavor. These recipes are low in
                                calories but high in satisfaction, perfect for those mindful of their nutrition.
                            </div>
                        </label>

                        <input type="radio" class="btn-check" name="mealPreference" id="vegetarian" value="Vegetarian Delight" v-model="planData.preference">
                        <label class="btn btn-custom-plan text-start d-flex align-items-center" for="vegetarian">
                            <img src="/src/assets/resources/img/vegetarian.png" width="40px" class="me-3">
                            <div>
                                <strong>Vegetarian Delight</strong><br>
                                Fresh, wholesome, and full of flavor, these plant-based meals showcase the best of
                                seasonal produce
                            </div>

                        </label>
                    </div>
                </div>

                <!-- Meal Plan Selection Section -->
                <div class="col-md-6 px-4" id="selection">
                    <h5>Servings per meal</h5>
                    <div class="btn-group" role="group">
                        <input type="radio" class="btn-check" name="peopleOptions" id="option2People" value="2" v-model.number="planData.serving" checked>
                        <label class="btn btn-custom-plan" for="option2People">2</label>

                        <input type="radio" class="btn-check" name="peopleOptions" id="option4People" value="4" v-model.number="planData.serving">
                        <label class="btn btn-custom-plan" for="option4People">4</label>
                    </div>

                    <h5 class="mt-4">Meals per week</h5>
                    <div class="btn-group" role="group">
                        <input type="radio" class="btn-check" name="mealsOptions" id="option2Meals" value="2" v-model.number="planData.mealPerWeek" checked>
                        <label class="btn btn-custom-plan" for="option2Meals">2</label>

                        <input type="radio" class="btn-check" name="mealsOptions" id="option3Meals" value="3" v-model.number="planData.mealPerWeek">
                        <label class="btn btn-custom-plan" for="option3Meals">3</label>

                        <input type="radio" class="btn-check" name="mealsOptions" id="option4Meals" value="4" v-model.number="planData.mealPerWeek">
                        <label class="btn btn-custom-plan" for="option4Meals">4</label>

                        <input type="radio" class="btn-check" name="mealsOptions" id="option5Meals" value="5" v-model.number="planData.mealPerWeek">
                        <label class="btn btn-custom-plan" for="option5Meals">5</label>

                        <input type="radio" class="btn-check" name="mealsOptions" id="option6Meals" value="6" v-model.number="planData.mealPerWeek">
                        <label class="btn btn-custom-plan" for="option6Meals">6</label>
                    </div>

                    <div class="pricing-info mt-4">
                        <div class="text-center">
                            <h6 class="text-muted fs-5"><span class="text-danger">$6.99</span> per serving</h6>
                            <p>{{ planData.mealPerWeek }} meals for {{ planData.serving }} people each week ({{ totalServings }} servings in total)</p>
                            <hr>
                        </div>


                        <table class="table">
                            <tbody>
                                <tr>
                                    <td>Box price</td>
                                    <td class="text-end">${{ totalPrice }}</td>
                                </tr>
                                <tr>
                                    <td>Shipping</td>
                                    <td class="text-end text-success">FREE</td>
                                </tr>
                                <tr>
                                    <td>Total amount</td>
                                    <td class="text-end"><strong>${{ totalPrice }}</strong></td>
                                </tr>
                            </tbody>
                        </table>

                        <button type="button" class="btn btn-custom2 w-100 fw-bold" @click.prevent="switchStep">Continue</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useMealForm } from '../stores/form';
import { useRouter } from 'vue-router';
import { computed } from 'vue';

const emit = defineEmits(['switchStep']);
const router = useRouter();
const MealForm = useMealForm();

const planData = MealForm.planData;
const totalServings = computed(() => MealForm.totalServings);
const totalPrice = computed(() => MealForm.totalPrice);

function switchStep() {
  emit('switchStep', 2); 
  router.push('/deliveryform');
}
</script>

<style scoped>

#plan h4 {
    text-align: center;
    margin-bottom: 40px;
}

#plan p:nth-child(2) {
    color: rgb(112, 111, 111);
    font-size: 15px;
}

.btn-custom-plan,
.pricing-info {
    border: 1px solid rgb(220, 220, 220);
}

.btn-custom-plan:hover {
    background-color: #def9ff;
    border: 1px solid rgb(220, 220, 220);
}

.table td,
.table th {
    border: none;
    padding: 5px;
}

#meal-kind .btn-custom-plan {
    margin-bottom: 20px;
    border-radius: 8px;
}

/*target checked radio*/
input[type="radio"]:checked+label {
    background-color: #def9ff;
    color: black;
    border: 2px solid #70d4ea;
}

#meal-kind label {
    font-size: 14px;
}

#meal-kind label strong {
    font-size: 16px;
}

#selection label {
    padding: 10px 30px;
}

.pricing-info {
    padding: 10px;
}

.btn-custom2 {
    background-color: #FFC907;
    border-radius: 30px;
    font-size: 17px;

}

.btn-custom2:hover {
    background-color: #ffdb5a;
}
</style>