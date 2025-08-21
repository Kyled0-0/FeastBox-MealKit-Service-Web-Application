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
                            <input type="text" class="form-control" v-model="deliveryData.firstName" @input="validate('firstName')"  required>
                            <p v-if="errors.firstName" class="text-danger fst-italic">{{ errors.firstName }}</p>
                        </div>
                        <div class="col">
                            <label for="lastName" class="form-label">Last name *</label>
                            <input type="text" class="form-control" v-model="deliveryData.lastName" @input="validate('lastName')"  required>
                            <p v-if="errors.lastName" class="text-danger fst-italic">{{ errors.lastName }}</p>
                        </div>
                    </div>
                    <div class="mb-3">
                        <label for="address" class="form-label">Address *</label>
                        <input type="text" class="form-control" v-model="deliveryData.address" @input="validate('address')"  required>
                        <p v-if="errors.address" class="text-danger fst-italic">{{ errors.address }}</p>
                    </div>
                    <div class="row mb-3">
                        <div class="col">
                            <label for="postcode" class="form-label">Postcode *</label>
                            <input type="text" class="form-control" v-model="deliveryData.postcode" @input="validate('postcode')"  required>
                            <p v-if="errors.postcode" class="text-danger fst-italic">{{ errors.postcode }}</p>
                        </div>
                        <div class="col">
                            <label for="suburb" class="form-label">Suburb *</label>
                            <input type="text" class="form-control" v-model="deliveryData.suburb" @input="validate('suburb')" required>
                            <p v-if="errors.suburb" class="text-danger fst-italic">{{ errors.suburb }}</p>
                        </div>
                    </div>
                    <div class="mb-3">
                        <label for="state" class="form-label">State *</label>
                        <select class="form-select" v-model="deliveryData.state" @change="validate('state')" required>
                            <option value="NSW">NSW</option>
                            <option value="VIC">VIC</option>
                            <option value="QLD">QLD</option>
                            <option value="WA">WA</option>
                            <option value="SA">SA</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label for="phone" class="form-label">Phone number *</label>
                        <input type="tel" class="form-control" v-model="deliveryData.phone" @input="validate('phone')"  required>
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
                            <option v-for="date in deliveryDates" :key="date" :value="date">{{ date }}</option>
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
                        <div style="font-size: 15px; text-align: justify;">
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
import { ref, onMounted, computed } from 'vue';
import { useMealForm } from '../stores/form';
import { useRouter } from 'vue-router';
import { defineEmits } from 'vue';

const MealForm = useMealForm();
const deliveryData = MealForm.deliveryData;
const emit = defineEmits(['switchStep']);
const router = useRouter();


const errors = ref({});


const validate = (field) => {
    const value = deliveryData[field];
    if (!value) {
        errors.value[field] = "This field can't be blank";
    } else if (field === 'phone' && value.length !== 10) {
        errors.value.phone = 'Invalid phone number';
    } else if (field === 'postcode' && value.length !== 4) {
        errors.value.postcode = 'Invalid postcode';
    } else {
        errors.value[field] = '';
    }
};

const deliveryDates = ref([]);
const generateDeliveryDates = () => {
   
    if (deliveryDates.value.length === 0) {
        const currentDate = new Date();
        const newDates = [];

        for (let i = 0; i < 7; i++) {
            const futureDate = new Date(currentDate);
            futureDate.setDate(currentDate.getDate() + i);
            newDates.push(futureDate.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' }));
        }

        deliveryDates.value = newDates;

        
        if (!deliveryData.deliveryDate) {
            MealForm.updateDelivery('deliveryDate', newDates[0]);
        }
    }
};
onMounted(generateDeliveryDates);


const deliveryDay = computed(() => {
    const date = new Date(deliveryData.deliveryDate);
    date.setDate(date.getDate() + 1);
    return date.toLocaleDateString('en-US', {weekday: 'long'});
});


const handleSubmit = () => {
    
    Object.keys(deliveryData).forEach(field => validate(field));

    if (Object.values(errors.value).every(error => !error)) {
        emit('switchStep', 3); 
        router.push('/paymentform'); 
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
    background-color: #def9ff;
    border: 1px solid rgb(220, 220, 220);
}

/* Radio button checked styling */
input[type="radio"]:checked+label {
    background-color: #def9ff;
    color: black;
    border: 2px solid #70d4ea;
}

.btn-custom2 {
    background-color: #FFC907;
    border-radius: 30px;
    font-size: 17px;
}

.btn-custom2:hover {
    background-color: #ffdb5a;
}

.text-danger{
    font-size: 12px;
    margin-bottom: 0px;
}

@media only screen and (max-width: 830px){
  #deliveryTime{
    margin-top: 30px;
  }
}
</style>
