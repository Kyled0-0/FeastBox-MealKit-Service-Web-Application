<template>
    <div class="container mt-5">
        <div>
            <PaymentDemoBanner />
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
                                value="creditCard" checked>
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
                            @input="validate('cardName', paymentData)">
                        <p v-if="errors.cardName" class="text-danger fst-italic">{{ errors.cardName }}</p>
                    </div>
                    <div class="mb-3">
                        <label for="cardNumber" class="form-label">Card number</label>
                        <input type="text" class="form-control" id="cardNumber" inputmode="numeric" pattern="\d*" v-model="paymentData.cardNumber"
                            placeholder="0000 0000 0000 0000 (demo)" @input="validate('cardNumber', paymentData)">
                        <p v-if="errors.cardNumber" class="text-danger fst-italic">{{ errors.cardNumber }}</p>
                    </div>
                    <div class="row">
                        <div class="col-md-6">
                            <label for="expiryDate" class="form-label">Expiry date</label>
                            <input type="text" class="form-control" id="expiryDate" v-model="paymentData.expiryDate"
                                placeholder="MM/YY" @input="validate('expiryDate', paymentData)">
                            <p v-if="errors.expiryDate" class="text-danger fst-italic">{{ errors.expiryDate }}</p>
                        </div>
                        <div class="col-md-6">
                            <label for="cvc" class="form-label">CVC Number</label>
                            <input type="text" class="form-control" id="cvc" inputmode="numeric" pattern="\d*" v-model="paymentData.cvc" placeholder="000 (demo)"
                                @input="validate('cvc', paymentData)">
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
                                    <td class="text-end">{{ planData.mealPerWeek }} Meals per week</td>
                                </tr>
                                <tr>
                                    <td>Plan type:</td>
                                    <td class="text-end">{{ planData.serving }} person box</td>
                                </tr>
                                <tr>
                                    <td>Meal preferences:</td>
                                    <td class="text-end">{{ planData.preference }}</td>
                                </tr>
                                <tr>
                                    <td>First delivery:</td>
                                    <td class="text-end">{{ deliveryData.deliveryDate }}</td>
                                </tr>
                                <tr>
                                    <td class="border-0">Delivery slot:</td>
                                    <td class="text-end border-0">{{ deliveryData.deliverySlot }}
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
                                <td class="text-end">${{ totalPrice.toFixed(2) }}</td>
                            </tr>
                            <tr>
                                <td>Shipping</td>
                                <td class="text-end text-brand">FREE</td>
                            </tr>
                            <tr v-if="paymentData.voucher === 'FEAST20'">
                                <td>FEAST20</td>
                                <td class="text-end text-brand">20%</td>
                            </tr>
                            <tr>
                                <td class="border-0">Total amount</td>
                                <td class="text-end border-0"><span
                                        v-if="paymentData.voucher === 'FEAST20'"><span
                                            class="price-original">${{
                                                totalPrice.toFixed(2) }}</span> <strong>${{ totalPriceVoucher.toFixed(2)
                                            }}</strong></span><strong v-if="paymentData.voucher !== 'FEAST20'"> ${{
                                                totalPrice.toFixed(2) }}</strong>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="mb-0 mt-4">
                    <label for="voucher" class="form-label">Voucher</label>
                    <input type="text" class="form-control" id="voucher" v-model="paymentData.voucher"
                        @input="validate('voucher', paymentData)">
                    <p v-if="errors.voucher" class="text-danger fst-italic">{{ errors.voucher }}</p>
                </div>
                <div class="mt-2 mb-0">

                    <input type="checkbox" name="terms-conditions" id="terms-conditions" v-model="paymentData.terms"
                        @change="validate('terms', paymentData)">
                    I accept the <span class="text-brand">Terms and Conditions</span> of
                    FeastBox
                    <p class="text-danger fst-italic">{{ errors.terms }}</p>
                </div>

                <p v-if="submitError" class="text-danger fst-italic mt-2 mb-0" role="alert">{{ submitError }}</p>

                <button type="button" class="btn btn-custom2 w-100 fw-bold mt-0" :disabled="orderLoading"
                    @click.prevent="handleSubmit">
                    <span v-if="orderLoading" class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                    {{ orderLoading ? 'Placing order…' : 'Place order & choose meals' }}
                </button>
            </div>
        </div>
        </div>
        
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useMealForm } from '../stores/form'
import { useOrders } from '@/stores/orders'
import { useFormValidation } from '@/composables/useFormValidation'
import { required, digits, accepted } from '@/utils/validators'
import PaymentDemoBanner from '@/components/PaymentDemoBanner.vue'

const MealForm = useMealForm()
const { paymentData, totalPriceVoucher, planData, deliveryData, totalPrice, totalServings } = storeToRefs(MealForm)

const ordersStore = useOrders()
const { loading: orderLoading } = storeToRefs(ordersStore)

const submitError = ref(null)
const router = useRouter()

const validExpiry = (v) => {
  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(v)) return 'Invalid format MM/YY'
  const [month, year] = v.split('/').map(Number)
  const now = new Date()
  const currentYear = now.getFullYear() % 100
  const currentMonth = now.getMonth() + 1
  if (year < currentYear || (year === currentYear && month < currentMonth)) return 'Card has expired'
  return null
}

const { errors, validate, validateAll, isValid } = useFormValidation({
  cardName: [required()],
  cardNumber: [required(), digits(16, 'Card number must be 16 digits')],
  expiryDate: [required(), validExpiry],
  cvc: [required(), digits(3, 'CVC must be 3 digits')],
  terms: [accepted('Must accept to proceed')]
})

// HD-scope wiring: the wizard collects abstract servings (mealPerWeek × box
// size) without picking specific meals, so we send only { servings, voucher }
// and the server picks the box product + computes total from the DB price.
// Card fields are validated for shape only — Stripe replaces this in Task 12.
//
// Auth dependency: POST /orders requires a JWT access token. Until Task 9
// frontend auth integration ships, a 401 here means "log in first" — we
// redirect to /login. EXECUTION_LOG entry documents this gap for the demo.
const handleSubmit = async () => {
  submitError.value = null
  validateAll(paymentData.value)
  if (!isValid.value) return

  try {
    const voucher = paymentData.value.voucher === 'FEAST20' ? 'FEAST20' : undefined
    const order = await ordersStore.createOrder({
      servings: totalServings.value,
      voucher
    })
    router.push({ name: 'order-confirmation', params: { id: order.id } })
  } catch (e) {
    if (e?.status === 401) {
      submitError.value = 'Please log in to place an order.'
      router.push('/login')
      return
    }
    // 5xx/408 produce developer-facing strings ("Request failed with status
    // 500", "Request timed out") from api.js. Replace with a user-facing
    // message; 4xx keeps the server-supplied `error` field which is already
    // human-readable (Zod field errors etc.).
    if ((e?.status ?? 0) >= 500 || e?.status === 408) {
      submitError.value = 'Something went wrong on our end. Please try again in a moment.'
      return
    }
    submitError.value = e?.message ?? 'Could not place the order. Please try again.'
  }
}
</script>

<style scoped>
.table td,
.table th {
    padding: 5px;
}

h5 {
    margin-bottom: 8px;
}

.btn-custom2 {
    background-color: var(--color-brand-yellow);
    border-radius: 30px;
    font-size: 17px;
}

.btn-custom2:hover {
    background-color: var(--color-brand-yellow-light);
}

.price-original {
    text-decoration: line-through;
    text-decoration-color: var(--color-brand-orange);
}

.text-danger {
    font-size: 12px;
    margin-bottom: 0px;
}

@media only screen and (max-width: 991.98px) {
    #summary {
        margin-top: 50px;
    }
}
</style>