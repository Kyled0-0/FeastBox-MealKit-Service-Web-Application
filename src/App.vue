<template>
  <div id="app" class="d-flex flex-column min-vh-100">
    <nav class="navbar navbar-expand-xl navbar-light bg-light fixed-top"  v-if="$route.meta.showNavbar">
      <button class="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#navContent"
        aria-controls="navContent">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="container">
        <router-link to="/">
          <img src="/src/assets/resources/img/logo3.png" width="80px" class="navbar-brand" id="logo-nav">
        </router-link>
        <div id="collapse-logo">
          <router-link to="/"><img src="/src/assets/resources/img/logo1.png" width="80px" style="display: none;"
              id="collapse-logo" class="navbar-brand"></router-link>
        </div>
        <div class="offcanvas offcanvas-start" data-bs-backdrop="static" tabindex="-1" id="navContent"
          aria-labelledby="navContentLabel">
          <div class="offcanvas-header">
            <h5 class="offcanvas-title fs-2" id="navContentLabel"><span style="color: #ff603d;">feast</span>box</h5>
            <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
          </div>

          <div class="offcanvas-body">
            <div style="display: none;" id="offCanvasButton">
              <p>Already a member? <router-link to="/login" id="login-offcanvas">Login</router-link></p>
              <router-link class="btn btn-custom fw-semibold" to="/meal-plan">Choose Meal Plan</router-link>
              <hr>
            </div>
            <ul class="navbar-nav flex-grow-1 pe-3">
              <li class="nav-item mx-3">
                <router-link class="nav-link" to="/menu">View Menu</router-link>
              </li>
              <li class="nav-item mx-3">
                <router-link class="nav-link" to="/how">How it works</router-link>
              </li>
              <li class="nav-item mx-3">
                <router-link class="nav-link" to="/contact">Contact Us</router-link>
              </li>
            </ul>
            <div class="d-flex" id="navButton">
              <router-link class="btn" to="/login" style="border: none;">Login</router-link>
              <router-link class="btn btn-custom fw-semibold" to="/meal-plan">Choose Meal Plan</router-link>
            </div>
          </div>


        </div>
      </div>
    </nav>

    <div style="flex-grow: 1;">
      <router-view></router-view>
    </div>

    <!--
    
    -->
    <div class="container-fluid p-0 m-0">
      <footer>
        <div class="container">
          <div class="row">
            <!--logo-->
            <div class="col-lg-3 col-sm-12 logo">
              <h3><span style="color: #ff603d;">feast</span>box</h3>
            </div>

            <!--links-->

            <div class="col-lg-6 col-md-8 d-flex flex-wrap links">
              <div class="col-6">
                <router-link class="lead" to="/how">How it works</router-link><br>
                <a href="#" class="lead">Why FeastBox</a><br>
                <a href="#" class="lead">FAQs</a><br>
                <a href="#" class="lead">Blog</a><br>
              </div>
              <div class="col-3">
                <router-link class="lead" to="/contact">Contact Us</router-link><br>
                <a href="#" class="lead">Partnerships</a><br>
                <a href="#" class="lead">Affiliate Program</a><br>
              </div>
            </div>



            <!--app and social-->
            <div class="col-lg-3 col-md-4">
              <div class="download_buttons">
                <a href="#"><img src="./assets/resources/img/appstore.png" class="mb-3" width="100px"></a>
                <a href="#"><img src="./assets/resources/img/ggplay.png" width="100px"></a>
              </div>
              <div>
                <p class="lead" style="margin-bottom: 0px;">Follow us</p>
                <div id="social-icons-div">
                  <a href="#" class="social-icons"><i class="bi bi-linkedin"></i></a>
                  <a href="#" class="social-icons"><i class="bi bi-facebook"></i></a>
                  <a href="#" class="social-icons"><i class="bi bi-instagram"></i></a>
                  <a href="#" class="social-icons"><i class="bi bi-twitter"></i></a>
                </div>

              </div>
            </div>

          </div>

          <div class="row" id="footer-bottom">
            <div class="col-lg-6">
              <a href="#" class="lead">Terms & Conditions</a>
              <a href="#" class="lead">Privacy Policy</a>
              <a href="#" class="lead">info@feastbox.com</a>
            </div>
            <div class="col-lg-6 d-flex justify-content-end">
              <p class="mb-0">&copy; Copyright 2024 FeastBox</p>
            </div>
          </div>
        </div>


      </footer>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute();

</script>

<style></style>