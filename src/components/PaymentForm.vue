<template>
    <div class="container mt-5" >
        <div class="text-success my-5" id="successMessage" v-show="MealForm.successPayment">
            <h4><i class="bi bi-check-circle-fill"></i>Purchase successfully</h4>
        </div>
        <div v-show="!MealForm.successPayment">
            <h2 class="text-center mb-4">Checkout and payment</h2>
        <div class="row">
            <!-- Payment method -->
            <div class="col-md-6 px-4">
                <h5>Select payment method</h5>
                <form>
                    <!-- Credit Card Option -->
                    <div class="form-check">
                        <label class="form-check-label" for="creditCard">
                            Credit Card
                        </label>
                        <div class="d-flex justify-content-start mt-2">
                            <input class="form-check-input" type="radio" name="paymentMethod" id="creditCard"
                                v-model="paymentMethod" value="creditCard" checked>
                            <div class="ms-2">
                                <img src="/src/assets/resources/img/mastercard.png" width="40px" class="me-2">
                                <img src="/src/assets/resources/img/visa.png" width="40px">
                            </div>


                        </div>
                    </div>

                </form>

                <!-- Payment Details -->
                <h5 class="mt-4">Enter payment details</h5>
                <form>
                    <div class="mb-3">
                        <label for="cardName" class="form-label">Name on card</label>
                        <input type="text" class="form-control" id="cardName" v-model="paymentData.cardName"
                            @input="validate('cardName')">
                        <p v-if="errors.cardName" class="text-danger fst-italic">{{ errors.cardName }}</p>
                    </div>
                    <div class="mb-3">
                        <label for="cardNumber" class="form-label">Card number</label>
                        <input type="text" class="form-control" id="cardNumber" v-model="paymentData.cardNumber"
                            placeholder="1234 1234 1234 1234" @input="validate('cardNumber')">
                        <p v-if="errors.cardNumber" class="text-danger fst-italic">{{ errors.cardNumber }}</p>
                    </div>
                    <div class="row">
                        <div class="col-md-6">
                            <label for="expiryDate" class="form-label">Expiry date</label>
                            <input type="text" class="form-control" id="expiryDate" v-model="paymentData.expiryDate"
                                placeholder="MM/YY" @input="validate('expiryDate')">
                            <p v-if="errors.expiryDate" class="text-danger fst-italic">{{ errors.expiryDate }}</p>
                        </div>
                        <div class="col-md-6">
                            <label for="cvc" class="form-label">CVC Number</label>
                            <input type="text" class="form-control" id="cvc" v-model="paymentData.cvc" placeholder="CVC"
                                @input="validate('cvc')">
                            <p v-if="errors.cvc" class="text-danger fst-italic">{{ errors.cvc }}</p>
                        </div>
                    </div>
                </form>
            </div>

            <!-- Plan summary and order summary -->
            <div class="col-md-6 px-4" id="summary">
                <div>
                    <h5>Plan summary</h5>
                    <div class="plan-summary mt-2">
                        <table class="table">
                            <tbody>
                                <tr>
                                    <td>Plan: </td>
                                    <td class="text-end">{{ MealForm.planData.mealPerWeek }} Meals per week</td>
                                </tr>
                                <tr>
                                    <td>Plan type:</td>
                                    <td class="text-end">{{ MealForm.planData.serving }} person box</td>
                                </tr>
                                <tr>
                                    <td>Meal preferences:</td>
                                    <td class="text-end">{{ MealForm.planData.preference }}</td>
                                </tr>
                                <tr>
                                    <td>First delivery:</td>
                                    <td class="text-end">{{ MealForm.deliveryData.deliveryDate }}</td>
                                </tr>
                                <tr>
                                    <td style="border: none;">Delivery slot:</td>
                                    <td class="text-end" style="border: none;">{{ MealForm.deliveryData.deliverySlot }}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <h5 class="mt-5">Order summary</h5>
                <div class="order-summary mt-2">
                    <table class="table">
                        <tbody>
                            <tr>
                                <td>Box price</td>
                                <td class="text-end">${{ MealForm.totalPrice }}</td>
                            </tr>
                            <tr>
                                <td>Shipping</td>
                                <td class="text-end" style="color:#ff603d">FREE</td>
                            </tr>
                            <tr v-if="paymentData.voucher === 'FEAST20'">
                                <td>FEAST20</td>
                                <td class="text-end" style="color:#ff603d">20%</td>
                            </tr>
                            <tr>
                                <td style="border: none;">Total amount</td>
                                <td class="text-end" style="border: none;"><span
                                        v-if="paymentData.voucher === 'FEAST20'"><span
                                            style="text-decoration: line-through; text-decoration-color: #ff603d;">${{
                                                MealForm.totalPrice }}</span> <strong>${{ totalPriceVoucher
                                            }}</strong></span><strong v-if="paymentData.voucher !== 'FEAST20'"> ${{
                                                MealForm.totalPrice }}</strong>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="mb-0 mt-4">
                    <label for="voucher" class="form-label">Voucher</label>
                    <input type="text" class="form-control" id="voucher" v-model="paymentData.voucher"
                        @input="validate('voucher')">
                    <p v-if="errors.voucher" class="text-danger fst-italic">{{ errors.voucher }}</p>
                </div>
                <div class="mt-2 mb-0">

                    <input type="checkbox" name="terms&conditions" id="terms&cons" v-model="paymentData.terms"
                        @click="validate('terms')">
                    I accept the <span style="color: #ff603d;">Terms and Conditions</span> of
                    FeastBox
                    <p class="text-danger fst-italic">{{ errors.terms }}</p>
                </div>

                <button type="button" class="btn btn-custom2 w-100 fw-bold mt-0" @click.prevent="handleSubmit">Place
                    order &
                    choose meals</button>
            </div>
        </div>
        </div>
        
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useMealForm } from '../stores/form';
import { useRouter } from 'vue-router';

const MealForm = useMealForm();
const paymentData = MealForm.paymentData; 
const router = useRouter();
const emit = defineEmits(['successPayment']);

const totalPriceVoucher = computed(() => MealForm.totalPriceVoucher);

const errors = ref({});

const validate = (field) => {
    const value = paymentData[field];
    if (field === 'terms' && !value) {
        errors.value.terms = 'Must accept to proceed'
    } else if (!value && field !== 'voucher') {
        errors.value[field] = "This field can't be blank";
    } else if (field === 'cardNumber' && value.length !== 16) {
        errors.value.cardNumber = 'Invalid card number';
    } else if (field === 'expiryDate') {
        
        const format = /^(0[1-9]|1[0-2])\/\d{2}$/;

        if (!format.test(value)) {
            errors.value.expiryDate = 'Invalid format MM/YY';
            return;
        }
        const [month, year] = value.split('/').map(Number);
        const currentYear = new Date().getFullYear() % 100; 
        const currentMonth = new Date().getMonth() + 1; 

        if (year < currentYear || (year === currentYear && month < currentMonth)) {
            errors.value.expiryDate = 'Card has expired';
        } else {
            errors.value.expiryDate = ''; 
        }

    } else if (field === 'cvc' && value.length !== 3) {
        errors.value.cvc = 'Invalid CVC number';
    } else if (field === 'voucher' && value !== '' && value !== 'FEAST20') {
        
        errors.value.voucher = 'Invalid voucher code';
    } else {
        errors.value[field] = ''; 
    }
};

const handleSubmit = () => {
    
    Object.keys(paymentData).forEach(field => validate(field));

    if (Object.values(errors.value).every(error => !error)) {
        MealForm.updatePaymentStatus(true);
        setTimeout(() => {
            router.push('/menu'); 
        }, 2000);
        
    }
};
</script>

<style scoped>
#successMessage {
    text-align: center;
}

.table td,
.table th {
    padding: 5px;
}

h5 {
    margin-bottom: 8px;
}

.btn-custom2 {
    background-color: #FFC907;
    border-radius: 30px;
    font-size: 17px;

}

.btn-custom2:hover {
    background-color: #ffdb5a;
}

.text-danger {
    font-size: 12px;
    margin-bottom: 0px;
}

@media only screen and (max-width: 830px) {
    #summary {
        margin-top: 50px;
    }
}
</style>