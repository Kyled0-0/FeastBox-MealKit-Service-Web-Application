<template>
    <!-- Login Form -->
    <div class="login-container bg-white">
        <h5 class="text-center mb-3">Login</h5>
        <form>
            <div class="mb-3">
                <label for="loginEmail" class="form-label mb-1">Email address</label>
                <div class="input-group">
                    <input type="email" class="form-control" id="loginEmail" onchange="email_change_validation()"
                        required>
                </div>
                <p id="helpEmail" class="mt-1"></p>
            </div>
            <div class="mb-3">
                <label for="loginPassword" class="form-label mb-1">Password</label>
                <div class="input-group">
                    <input type="password" class="form-control input-lg" id="loginPassword"
                        onchange="password_change_validation()" required>
                </div>
                <p id="helpPassword" class="mt-1"></p>
            </div>
            <div class="mb-3 text-end">
                <a href="#" class="text-decoration-none">Forgot your password?</a>
            </div>
            <button type="submit" class="btn btn-custom w-100 fw-semibold">Log in</button>
        </form>

        <div class="text-center mt-4">
            <p>New to Feast Box? <a href="#" class="text-decoration-none">Sign Up Here</a></p>
        </div>
    </div>
</template>

<script>

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