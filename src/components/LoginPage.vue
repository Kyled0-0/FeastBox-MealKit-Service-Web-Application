<template>
    <!-- Login Form -->
    <div class="login-container bg-white">
        <h5 class="text-center mb-3">Login</h5>
        <form @submit.prevent="handleSubmit">
            <div class="mb-3">
                <label for="loginEmail" class="form-label mb-1">Email address</label>
                <div class="input-group">
                    <input type="email" class="form-control" id="loginEmail"
                        v-model="form.email" @input="validate('email', form)" required>
                </div>
                <p v-if="errors.email" class="text-danger fst-italic mt-1">{{ errors.email }}</p>
            </div>
            <div class="mb-3">
                <label for="loginPassword" class="form-label mb-1">Password</label>
                <div class="input-group">
                    <input type="password" class="form-control input-lg" id="loginPassword"
                        v-model="form.password" @input="validate('password', form)" required>
                </div>
                <p v-if="errors.password" class="text-danger fst-italic mt-1">{{ errors.password }}</p>
            </div>
            <div class="mb-3 text-end">
                <span class="text-decoration-none text-muted" style="font-size:0.9rem;">Forgot your password?</span>
            </div>
            <button type="submit" class="btn btn-custom w-100 fw-semibold">Log in</button>
        </form>

        <div class="text-center mt-4">
            <p>New to Feast Box? <span class="text-muted">Sign Up Here</span></p>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useFormValidation } from '@/composables/useFormValidation'
import { required, email } from '@/composables/validators'

const form = ref({ email: '', password: '' })

const { errors, validate, validateAll, isValid } = useFormValidation({
  email: [required(), email()],
  password: [required('Password is required')]
})

function handleSubmit() {
  validateAll(form.value)
  if (isValid.value) {
    // Phase 2: call useAuth().login()
  }
}
</script>

<style scoped>
.login-container {
    max-width: 550px;
    margin: 0 auto;
    margin-top: 100px;
    padding: 30px;
    border-radius: 8px;
    box-shadow: -0px 0px 20px rgba(0, 0, 0, 0.2);
}

a,
p {
    font-size: 12px;
}




</style>
