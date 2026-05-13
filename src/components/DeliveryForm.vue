<template>
    <div class="container mt-5">
        <h4 class="fw-bold mt-5">Select delivery day and enter your address</h4>
        <div class="row">
            <!-- Delivery Information -->
            <div class="col-md-6 px-4">
                <h5>Delivery information</h5>
                <form>
                    <div class="row mb-3">
                        <div class="col">
                            <label for="firstName" class="form-label">First name *</label>
                            <input type="text" class="form-control" v-model="deliveryData.firstName" @input="validate('firstName', deliveryData)"  required>
                            <p v-if="errors.firstName" class="text-danger fst-italic">{{ errors.firstName }}</p>
                        </div>
                        <div class="col">
                            <label for="lastName" class="form-label">Last name *</label>
                            <input type="text" class="form-control" v-model="deliveryData.lastName" @input="validate('lastName', deliveryData)"  required>
                            <p v-if="errors.lastName" class="text-danger fst-italic">{{ errors.lastName }}</p>
                        </div>
                    </div>
                    <div class="mb-3">
                        <label for="address" class="form-label">Address *</label>
                        <input type="text" class="form-control" v-model="deliveryData.address" @input="validate('address', deliveryData)"  required>
                        <p v-if="errors.address" class="text-danger fst-italic">{{ errors.address }}</p>
                    </div>
                    <div class="row mb-3">
                        <div class="col">
                            <label for="postcode" class="form-label">Postcode *</label>
                            <input type="text" class="form-control" inputmode="numeric" pattern="\d*" v-model="deliveryData.postcode" @input="validate('postcode', deliveryData)" required>
                            <p v-if="errors.postcode" class="text-danger fst-italic">{{ errors.postcode }}</p>
                        </div>
                        <div class="col">
                            <label for="suburb" class="form-label">Suburb *</label>
                            <input type="text" class="form-control" v-model="deliveryData.suburb" @input="validate('suburb', deliveryData)" required>
                            <p v-if="errors.suburb" class="text-danger fst-italic">{{ errors.suburb }}</p>
                        </div>
                    </div>
                    <div class="mb-3">
                        <label for="state" class="form-label">State *</label>
                        <select class="form-select" v-model="deliveryData.state" @change="validate('state', deliveryData)" required>
                            <option value="NSW">NSW</option>
                            <option value="VIC">VIC</option>
                            <option value="QLD">QLD</option>
                            <option value="WA">WA</option>
                            <option value="SA">SA</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label for="phone" class="form-label">Phone number *</label>
                        <input type="tel" class="form-control" inputmode="numeric" pattern="\d*" v-model="deliveryData.phone" @input="validate('phone', deliveryData)" required>
                        <p v-if="errors.phone" class="text-danger fst-italic">{{ errors.phone }}</p>
                    </div>
                    <div class="mb-3">
                        <label for="deliveryInstructions" class="form-label">Where can the package be left when it arrives?</label>
                        <select class="form-select" v-model="deliveryData.deliveryOption">
                            <option value="Leave it at front door">Leave it at front door</option>
                            <option value="Leave it at back door">Leave it at back door</option>
                            <option value="Leave it with receptionist">Leave it with receptionist</option>
                            <option value="Leave it in a safe place">Leave it in a safe place</option>
                        </select>
                    </div>
                </form>
            </div>

            <!-- Delivery Time Setup -->
            <div class="col-md-6 px-4" id="deliveryTime">
                <h5>Set up your delivery time</h5>
                <form>
                    <div class="mb-3">
                        <label for="deliveryDate" class="form-label">Choose your first delivery date</label>
                        <select class="form-select" v-model="deliveryData.deliveryDate">
                            <option v-for="date in deliveryDates" :key="date.label" :value="date.label">{{ date.label }}</option>
                        </select>
                    </div>

                    <label for="deliverySlot" class="form-label">Select a delivery slot</label>
                    <div class="mb-3 d-grid gap-2">
                        <input type="radio" class="btn-check" name="deliverySlot" id="timeslot1" v-model="deliveryData.deliverySlot" value="12:00 AM - 07:00 AM">
                        <label class="btn btn-custom-plan text-start" for="timeslot1">12:00 AM - 07:00 AM</label>

                        <input type="radio" class="btn-check" name="deliverySlot" id="timeslot2" v-model="deliveryData.deliverySlot" value="07:00 AM - 6:30 PM">
                        <label class="btn btn-custom-plan text-start" for="timeslot2">07:00 AM - 6:30 PM</label>
                    </div>

                    <div class="d-flex justify-content-start align-items-center">
                        <img src="/src/assets/resources/img/calendar.png" width="50px" class="me-3" alt="Calendar Icon">
                        <div class="delivery-note">
                            <p class="mb-0"><strong>You will get your meal box every {{ deliveryDay }} {{deliveryData.deliverySlot}}.</strong> You can always change your delivery day and time slot for future orders.</p>
                        </div>
                    </div>

                    <button type="button" class="btn btn-custom2 w-100 fw-bold mt-3" @click.prevent="handleSubmit">Next</button>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useMealForm } from '../stores/form'
import { useFormValidation } from '@/composables/useFormValidation'
import { required, digits } from '@/utils/validators'

const MealForm = useMealForm()
const { deliveryData } = storeToRefs(MealForm)
const { updateDelivery } = MealForm
const router = useRouter();

const { errors, validate, validateAll, isValid } = useFormValidation({
  firstName: [required()],
  lastName: [required()],
  address: [required()],
  postcode: [required(), digits(4, 'Postcode must be 4 digits')],
  suburb: [required()],
  state: [required()],
  phone: [required(), digits(10, 'Phone must be exactly 10 digits')]
});

const deliveryDates = ref([]);
const generateDeliveryDates = () => {
   
    if (deliveryDates.value.length === 0) {
        const currentDate = new Date();
        const newDates = [];

        for (let i = 0; i < 7; i++) {
            const futureDate = new Date(currentDate);
            futureDate.setDate(currentDate.getDate() + i);
            newDates.push({
                label: futureDate.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' }),
                weekday: futureDate.toLocaleDateString('en-US', { weekday: 'long' }),
            });
        }

        deliveryDates.value = newDates;

        if (!deliveryData.value.deliveryDate) {
            updateDelivery('deliveryDate', newDates[0].label);
        }
    }
};
onMounted(generateDeliveryDates);


const deliveryDay = computed(() => {
    const match = deliveryDates.value.find(d => d.label === deliveryData.value.deliveryDate);
    return match?.weekday ?? '';
});


const handleSubmit = () => {
  validateAll(deliveryData.value)
  if (isValid.value) {
    router.push({ name: 'paymentform' })
  }
};
</script>


<style scoped>
h4 {
    text-align: center;
    margin-bottom: 40px;
}

h5 {
    margin-bottom: 15px;
}

.btn-custom-plan {
    border: 1px solid rgb(220, 220, 220);
}

.btn-custom-plan:hover {
    background-color: var(--color-brand-blue-tint);
    border: 1px solid rgb(220, 220, 220);
}

/* Radio button checked styling */
input[type="radio"]:checked+label {
    background-color: var(--color-brand-blue-tint);
    color: black;
    border: 2px solid var(--color-brand-blue);
}

.btn-custom2 {
    background-color: var(--color-brand-yellow);
    border-radius: 30px;
    font-size: 17px;
}

.btn-custom2:hover {
    background-color: var(--color-brand-yellow-light);
}

.delivery-note {
    font-size: 15px;
    text-align: justify;
}

.text-danger{
    font-size: 12px;
    margin-bottom: 0px;
}

@media only screen and (max-width: 991.98px){
  #deliveryTime{
    margin-top: 30px;
  }
}
</style>
