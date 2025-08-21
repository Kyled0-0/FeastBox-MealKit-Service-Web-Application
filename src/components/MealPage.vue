<template>
    <div class="container" style="width: 80%;" v-if="meal_display">
        <section id="description">
            <div class="row">
                <div class="col-lg-6 col-md-12 container">
                    <div class="meal-container">
                        <img :src="meal_display.imageUrl" class="img-fluid">
                    </div>

                </div>

                <div class="col-lg-6" id="meal-info">
                    <h2>{{ meal_display.name }}</h2>
                    <p>{{ meal_display.nameExtend }}</p>

                    <div>
                        <ul class="fw-bold my-4">
                            <li v-for="(tag, index) in meal_display.tags" :key="index">
                                {{ tag }}
                            </li>
                        </ul>
                    </div>
                    <h5>From the <span>feast</span>box kitchen</h5>
                    <p id="meal-intro">{{ meal_display.description }}</p>
                    <router-link class="btn btn-custom fw-semibold" to="/meal-plan">Let's feast</router-link>
                </div>
            </div>
        </section>

        <section id="ingredients-nutri">
            <div class="row gx-5">
                <div class="col-lg-4 col-md-12" id="nutri">
                    <p class="fw-semibold info-title">Nutritonal facts</p>
                    <ul>
                        <li>Calories<span>{{ meal_display.nutriFacts[0] }}</span></li>
                        <hr>
                        <li>Protein<span>{{ meal_display.nutriFacts[1] }}</span></li>
                        <hr>
                        <li>Carbs<span>{{ meal_display.nutriFacts[2] }}</span></li>
                        <hr>
                        <li>Fat<span>{{ meal_display.nutriFacts[3] }}</span></li>
                    </ul>
                </div>
                <div class="col-lg-8 col-md-12" id="ingredient-div">
                    <p class="fw-semibold info-title">Ingredients</p>
                    <div id="ingredients">
                        <div class="ingredient-container" v-for="(ingredient, index) in meal_display.ingredients"
                            :key="index">
                            <div class="ingredient-img">
                                <img :src="ingredient.ingreImg" :alt="ingredient.ingreName">
                            </div>
                            <p>{{ ingredient.ingreName }}</p>
                        </div>
                    </div>

                </div>
            </div>
        </section>

        <section id="instructions">
            <div class="row">
                <p class="fw-semibold info-title">Step-by-step instructions</p>
                <div class="col-lg-4 col-md-6" v-for="(step, index) in meal_display.steps" :key="index">
                    <div class="card">
                        <img :src="step.stepImg" class="card-img-top" :alt="step.stepTitle">
                        <div class="card-body">
                            <p class="card-title">{{ step.stepTitle }}</p>
                            <p class="card-text" v-html="step.stepText"></p>
                            
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>


</template>

<script setup>
import { defineProps, computed } from 'vue';

const props = defineProps({
    mealID: String
});




//arrays of meals
const meals = [
    {
        id: '01',
        name: 'Fast Peppered Beef Wraps',
        imageUrl: '/src/assets/resources/img/beefwraps/beef-wraps.jpeg',
        nameExtend: 'with Chimichurri Tomato and Aioli',
        tags: ['FAST', 'MEAT', 'FAMILY_FRIENDLY', 'DAIRY-FREE', 'OPTIONAL SPICE', '>40G PROTEIN'],
        description: "These wraps are a perfect blend of tender, juicy steak strips layered with fresh,crisp spinach and vibrant tomatoes, all topped with a chimichrri sauce. Perfect for a quick lunch or a light dinner, these wraps are as nutritious as they are delicious, making them an ideal choice for those seeking a balanced and tasty meal. Enjoy the richness of quality steak combined with the freshness of garden veggies in every wrap!",
        nutriFacts: ['820', '41.1', '44.7', '52'],
        ingredients: [
            {
                ingreImg: '/src/assets/resources/img/beefwraps/aioli-mayo.jpg',
                ingreName: '50g aioli mayonnaise'
            },
            {
                ingreImg: '/src/assets/resources/img/beefwraps/beef-stirfry.jpg',
                ingreName: 'beef stir-fry'
            },
            {
                ingreImg: '/src/assets/resources/img/beefwraps/oregano.jpeg',
                ingreName: '2g dried oregano'
            },
            {
                ingreImg: '/src/assets/resources/img/beefwraps/parsley.jpg',
                ingreName: 'parsley'
            },
            {
                ingreImg: '/src/assets/resources/img/beefwraps/red-onion.jpeg',
                ingreName: '1 red onion',
            },
            {
                ingreImg: '/src/assets/resources/img/beefwraps/seasoning.jpeg',
                ingreName: '10g pepper and garlic seasoning'
            },
            {
                ingreImg: '/src/assets/resources/img/beefwraps/spinach.jpeg',
                ingreName: '50g baby spinach leaves'
            },
            {
                ingreImg: '/src/assets/resources/img/beefwraps/tomato.jpg',
                ingreName: '1 tomato'
            },
            {
                ingreImg: '/src/assets/resources/img/beefwraps/tortilla.jpeg',
                ingreName: '6 flour tortillas'
            }
        ],
        steps: [
            {
                stepImg: '/src/assets/resources/img/beefwraps/step1.jpeg',
                stepTitle: '1. Prep ingredients',
                stepText: 'Finely chop the <span>onion</span> and <span>parsley</span>, including the parsley stems.'
            },
            {
                stepImg: '/src/assets/resources/img/beefwraps/step2.jpeg',
                stepTitle: '2. Make chimichurri',
                stepText: 'Put <span>1½ tsp dried oregano*, 1 tbs red wine vinegar</span> and <span>1 tbs extra virgin olive oil</span> in a large bowl. Add the <span>onion</span> and <span>parsley</span> and season with <span>salt and pepper</span>.'
            },
            {
                stepImg: '/src/assets/resources/img/beefwraps/step3.jpeg',
                stepTitle: '3. Prep tomato',
                stepText: 'Cut the <span>tomato</span> into thin wedges, add to the chimichurri and stir to combine.</p>'
            },
            {
                stepImg: '/src/assets/resources/img/beefwraps/step4.jpeg',
                stepTitle: '4. Cook Beef',
                stepText: 'Separate the <span>beef stir-fry</span>. Heat <span>20g butter</span> in a large frypan over medium-high heat. Stir-fry the beef for 1-2 mins until browned (beef stir-fry is best with fast cooking; get the pan hot and stick to the short cooking time). Add <span>3 tsp pepper and garlic seasoning</span> (reduce the seasoning for a milder pepper kick) and cook, stirring, for 1 min or until fragrant. Remove from the pan.</p>'
            },
            {
                stepImg: '/src/assets/resources/img/beefwraps/step5.jpeg',
                stepTitle: '5. Warm tortillas',
                stepText: 'Heat <span>a drizzle of olive oil</span> in the same pan over high heat. Warm the <span>tortillas</span>, in batches, for 30 secs each side or until heated through and golden.'
            },
            {
                stepImg: '/src/assets/resources/img/beefwraps/step6.jpeg',
                stepTitle: '6. Get ready to serve',
                stepText: 'Spread the <span>tortillas</span> with the <span>aioli</span> and divide among plates. Fill with the <span>spinach, beef</span> and <span>chimichurri tomato</span> to serve.</p>'
            }
        ],
    },
    {
        id: '02',
        name: 'Easy Veggie and Haloumi Salad',
        imageUrl: '/src/assets/resources/img/haloumisalad/haloumi-salad.jpeg',
        nameExtend: 'with Red Pesto Dressing',
        tags: ['VEGETARIAN', 'NO ADDED GLUTEN', 'FAMILY-FRIENDLY', '3+ VEG SERVES'],
        description: "Welcome to a burst of flavors with this Easy Veggie and Haloumi Salad! Grilled to perfection, the Haloumi adds a savory touch to the fresh, colorful veggies, all beautifully complemented by a rich red pesto dressing. This dish is not just a meal—it's a celebration of wholesome, delicious eating! Enjoy!",
        nutriFacts: ['750', '27.9', '40.4', '51.3'],
        ingredients: [
            {
                ingreImg: '/src/assets/resources/img/haloumisalad/sweet-potato.jpg',
                ingreName: '2 small sweet potatoes'
            },
            {
                ingreImg: '/src/assets/resources/img/haloumisalad/cauliflower.jpg',
                ingreName: '250g cauliflower'
            },
            {
                ingreImg: '/src/assets/resources/img/haloumisalad/capsicum.jpeg',
                ingreName: '1 capsicum'
            },
            {
                ingreImg: '/src/assets/resources/img/haloumisalad/red-onion.jpeg',
                ingreName: '1 red onion'
            },
            {
                ingreImg: '/src/assets/resources/img/haloumisalad/smoke-bbq.jpeg',
                ingreName: '5g smokey barbecue seasoning',
            },
            {
                ingreImg: '/src/assets/resources/img/haloumisalad/red-pesto.jpeg',
                ingreName: '50g red pesto'
            },
            {
                ingreImg: '/src/assets/resources/img/haloumisalad/haloumi.jpg',
                ingreName: '180g haloumi'
            },
            {
                ingreImg: '/src/assets/resources/img/haloumisalad/salad-leaves.jpeg',
                ingreName: '50g mixed salad leaves'
            }
        ],
        steps: [
            {
                stepImg: '/src/assets/resources/img/haloumisalad/step1.jpeg',
                stepTitle: '1. Prep vegetables',
                stepText: 'Preheat the oven to 200C, fan-forced. Line a large oven tray with baking paper. Cut the <span>unpeeled sweet potatoes</span> into 1.5cm chunks. Coarsely chop the <span>cauliflower</span> stem, then cut the head into small florets. Thinly slice the <span>capsicum</span>. Cut the <span>onion</span> into thin wedges.'
            },
            {
                stepImg: '/src/assets/resources/img/haloumisalad/step2.jpeg',
                stepTitle: '2. Roast vegetables',
                stepText: 'Put the <span>sweet potato, cauliflower, capsicum</span> and <span>onion</span> on the lined tray. Drizzle with <span>1 tbs olive oil</span> and scatter with the <span>barbecue seasoning</span>, then toss to coat. Roast for 20-25 mins until golden and tender.'
            },
            {
                stepImg: '/src/assets/resources/img/haloumisalad/step3.jpeg',
                stepTitle: '3. Make dressing',
                stepText: 'Meanwhile, combine the <span>red pesto, 2 tsp extra virgin olive oil</span> and <span>2 tsp red wine vinegar</span> in a large bowl and season with <span>salt and pepper</span>.'
            },
            {
                stepImg: '/src/assets/resources/img/haloumisalad/step4.jpeg',
                stepTitle: '4. Prep haloumi',
                stepText: 'Slice the <span>haloumi</span> and dry on paper towel.'
            },
            {
                stepImg: '/src/assets/resources/img/haloumisalad/step5.jpeg',
                stepTitle: '5. Cook haloumi',
                stepText: 'Heat <span>2 tsp olive oil</span> in a medium frypan over medium-high heat. Cook the <span>haloumi</span> for 2 mins each side or until golden. Remove from the pan.'
            },
            {
                stepImg: '/src/assets/resources/img/haloumisalad/step6.jpeg',
                stepTitle: '6. Get ready to serve',
                stepText: 'Add the <span>roasted vegetables</span> and <span>salad leaves</span> to the dressing and toss to combine. Divide the <span>salad</span> and <span>haloumi</span> among bowls to serve.'
            }
        ],
    },
    {
        id: '03',
        name: 'Mediterranean Mussel and Tomato Risotto',
        imageUrl: '/src/assets/resources/img/musselrisotto/mussel_risotto.jpeg',
        nameExtend: 'with Fresh Spinach and Parsley',
        tags: ['NO ADDED GLUTEN', 'SEAFOOD'],
        description: "The Mediterranean Mussel and Tomato Risotto is a flavorful blend of fresh mussels, tangy tomatoes, and creamy risotto. Enhanced by spinach and parsley, it delivers a taste of the Mediterranean that's both rich and refreshing. Perfect for a seafood lover's meal!",
        nutriFacts: ['540', '23.4', '69', '17.5'],
        ingredients: [
            {
                ingreImg: '/src/assets/resources/img/musselrisotto/arborio_rice.jpeg',
                ingreName: '150g arborio rice'
            },
            {
                ingreImg: '/src/assets/resources/img/musselrisotto/garlic.jpg',
                ingreName: '2 garlic cloves'
            },
            {
                ingreImg: '/src/assets/resources/img/musselrisotto/italian_seasoning.jpeg',
                ingreName: '10g italian seasoning'
            },
            {
                ingreImg: '/src/assets/resources/img/musselrisotto/mussel.jpeg',
                ingreName: '2 x 500g Austrlian blue mussels'
            },
            {
                ingreImg: '/src/assets/resources/img/musselrisotto/onion.jpeg',
                ingreName: '1 onion',
            },
            {
                ingreImg: '/src/assets/resources/img/musselrisotto/parsley.jpg',
                ingreName: 'parsley'
            },
            {
                ingreImg: '/src/assets/resources/img/musselrisotto/spinach.jpeg',
                ingreName: '50g baby spinach leaves'
            },
            {
                ingreImg: '/src/assets/resources/img/musselrisotto/stock.jpg',
                ingreName: '2 chicken-style stock cubes'
            },
            {
                ingreImg: '/src/assets/resources/img/musselrisotto/tomato.jpg',
                ingreName: '2 tomatoes'
            },
            {
                ingreImg: '/src/assets/resources/img/musselrisotto/tumeric.jpeg',
                ingreName: '5g ground tumeric'
            },
        ],
        steps: [
            {
                stepImg: '/src/assets/resources/img/musselrisotto/step1.jpeg',
                stepTitle: '1. Prep ingredients',
                stepText: 'Thinly slice the <span>onion</span>. Coarsely chop the <span>tomatoes</span>. Pick the <span>parsley</span> leaves and finely chop the stems. Crush or finely chop the <span>garlic</span>.'
            },
            {
                stepImg: '/src/assets/resources/img/musselrisotto/step2.jpeg',
                stepTitle: '2. Prep mussels and stock',
                stepText: 'Strain <span>125ml (½ cup) mussel liquid</span> into a jug, discarding any remaining liquid. Rinse the <span>mussels (see cooking tip)</span>. Put the strained mussel liquid in a small saucepan over medium-high heat. Crumble in the <span>stock cubes</span>, add <span>500ml (2 cups) boiling water</span> and stir to dissolve. Bring to a simmer, then reduce the heat to low.'
            },
            {
                stepImg: '/src/assets/resources/img/musselrisotto/step3.jpeg',
                stepTitle: '3. Cook onion mixture',
                stepText: 'Meanwhile, heat <span>1 tbs olive oil</span> in a medium deep frypan over high heat. Cook the <span>onion, tomato, parsley</span> stems and <span>garli</span>, stirring regularly, for 3 mins or until the onion is softened.'
            },
            {
                stepImg: '/src/assets/resources/img/musselrisotto/step4.jpeg',
                stepTitle: '4. Cook risotto',
                stepText: 'Add the <span>rice, Italian seasoning</span> and <span>¼ tsp turmeric*</span> to the onion mixture and cook, stirring, for 1-2 mins until the grains are well coated. Add the <span>hot stock</span>, reduce the heat to low and cook, covered, for 17 mins or until most of the liquid is absorbed and the rice is almost tender.'
            },
            {
                stepImg: '/src/assets/resources/img/musselrisotto/step5.jpeg',
                stepTitle: '5. Add spinach and butter',
                stepText: 'Add the <span>spinach, 10g butter</span> and<span>½ tsp red wine vinegar</span> to the risotto and stir to combine.'
            },
            {
                stepImg: '/src/assets/resources/img/musselrisotto/step6.jpeg',
                stepTitle: '6. Heat mussels and serve',
                stepText: 'Push the <span>mussels</span>, closed-end down, into the risotto. Cook, covered, for a further 3 mins or until the mussels are hot. Remove the pan from the heat. Taste the risotto, then season with <span>salt and pepper</span>. Scatter the <span>risotto</span> with the <span>parsley leaves</span> and serve at the table.'
            }
        ],
    },
    {
        id: '04',
        name: 'Sesame Soy-Glazed Salmon',
        imageUrl: '/src/assets/resources/img/sesamesalmon/sesame_salmon.jpeg',
        nameExtend: 'with Broccoli, Pak Choy and Brown Rice',
        tags: ['NO ADDED GLUTEN', 'FISH','FAMILY-FRIENDLY','DAIRY FREE','NUTRITIOUS','3+ VEG SERVES'],
        description: "This meal features Sesame Soy-Glazed Salmon, perfectly paired with a vibrant mix of fresh broccoli, pak choy, and carrots, served over a bed of hearty brown rice. The savory glaze adds a rich, flavorful touch to the tender salmon, making it a wholesome and delicious option for any time of day.",
        nutriFacts: ['735', '39.3', '63.8', '34.2'],
        ingredients: [
            {
                ingreImg: '/src/assets/resources/img/sesamesalmon/brown_rice.jpeg',
                ingreName: '125g brown rice'
            },
            {
                ingreImg: '/src/assets/resources/img/sesamesalmon/brocoli.jpg',
                ingreName: '1 head brocoli'
            },
            {
                ingreImg: '/src/assets/resources/img/sesamesalmon/carrot.jpg',
                ingreName: '1 carrot'
            },
            {
                ingreImg: '/src/assets/resources/img/sesamesalmon/pak_choy.jpg',
                ingreName: '1 pak choy'
            },
            {
                ingreImg: '/src/assets/resources/img/sesamesalmon/salmon.jpg',
                ingreName: '2 Tasmanian salmon fillets',
            },
            {
                ingreImg: '/src/assets/resources/img/sesamesalmon/sesame_oil.jpg',
                ingreName: '10ml sesame oil'
            },
            {
                ingreImg: '/src/assets/resources/img/sesamesalmon/sesame.jpeg',
                ingreName: '5g toasted sesame seeds'
            }
        ],
        steps: [
            {
                stepImg: '/src/assets/resources/img/sesamesalmon/step1.jpeg',
                stepTitle: '1. Cook rice',
                stepText: 'Fill a medium saucepan three-quarters full with water and bring to the boil. Add the <span>rice</span> and cook for 25-27 mins until tender. Drain.'
            },
            {
                stepImg: '/src/assets/resources/img/sesamesalmon/step2.jpeg',
                stepTitle: '2. Prep vegetables',
                stepText: 'Halve the <span>carrot</span> lengthwise and thinly slice on an angle. Coarsely chop the <span>broccoli</span> stem, then cut the head into small florets. Coarsely chop the <span>pak choy</span>, keeping the stems and leaves separate.'
            },
            {
                stepImg: '/src/assets/resources/img/sesamesalmon/step3.jpeg',
                stepTitle: '3. Prep salmon',
                stepText: 'Cut the <span>salmon</span> into 3cm cubes. (If preferred, remove the skin before cutting into cubes by making an incision between flesh and skin with a sharp knife. Grip skin tightly and slice in a downward motion, pushing the blade into the skin.)'
            },
            {
                stepImg: '/src/assets/resources/img/sesamesalmon/step4.jpeg',
                stepTitle: '4. Make sesame-soy sauce',
                stepText: 'Whisk the <span>sesame seeds, sesame oil, 1 tbs soy sauce, 3 tsp white vinegar, 1 tbs water</span> and <span>1 tbs honey</span> in a bowl until combined.'
            },
            {
                stepImg: '/src/assets/resources/img/sesamesalmon/step5.jpeg',
                stepTitle: '5. Stir-fry vegetables',
                stepText: 'Heat <span>2 tsp extra virgin olive oil</span> in a large deep frypan over high heat. Stir-fry the <span>carrot, broccoli</span> and <span>pak choy</span> stems for 2 mins. Add <span>1 tbs water</span> and cook, stirring, for 1 min or until just starting to soften. Add the <span>pak choy leaves</span> and stir-fry for a further 1 min or until the vegetables are just tender.'
            },
            {
                stepImg: '/src/assets/resources/img/sesamesalmon/step6.jpeg',
                stepTitle: '6. Cook salmon',
                stepText: 'Meanwhile, heat <span>2 tsp extra virgin olive oil</span> in a medium frypan over medium-high heat. Cook the <span>salmon</span> for 1-2 mins each side until golden. Add the <span>sesame-soy sauce</span> and cook, stirring, for 2 mins or until the sauce is reduced. Divide the <span>rice, salmon</span> and <span>vegetables</span> among bowls. Drizzle with the <span>sesame-soy sauce</span> to serve.'
            }
        ],
    },
    {
        id: '05',
        name: 'Lebanese-Style Lamb Pizza',
        imageUrl: '/src/assets/resources/img/lambpizza/lamb_pizza.jpeg',
        nameExtend: 'with Spinach Salad and Mint Yoghurt',
        tags: ['MEAT','FAMILY-FRIENDLY'],
        description: "This dish is a Lebanese-Style Lamb Pizza, featuring a crispy base topped with seasoned ground lamb, fresh mint leaves, and dollops of creamy mint yogurt. It’s paired with a refreshing spinach salad, making it a perfect blend of rich flavors and light, refreshing sides.",
        nutriFacts: ['710', '38.7', '64.7', '31.9'],
        ingredients: [
            {
                ingreImg: '/src/assets/resources/img/lambpizza/cucumber.jpg',
                ingreName: '1 Lebanese cucumber'
            },
            {
                ingreImg: '/src/assets/resources/img/lambpizza/cumin_spice.jpeg',
                ingreName: '5g cumin and coriander spice blend'
            },
            {
                ingreImg: '/src/assets/resources/img/lambpizza/currants.jpeg',
                ingreName: '20g dried currants'
            },
            {
                ingreImg: '/src/assets/resources/img/lambpizza/lamb_mince.jpg',
                ingreName: 'lamb mince'
            },
            {
                ingreImg: '/src/assets/resources/img/lambpizza/lemon.jpg',
                ingreName: '1 lemon',
            },
            {
                ingreImg: '/src/assets/resources/img/lambpizza/mint.jpeg',
                ingreName: 'mint'
            },
            {
                ingreImg: '/src/assets/resources/img/lambpizza/onion.jpeg',
                ingreName: '1 onion'
            },
            {
                ingreImg: '/src/assets/resources/img/lambpizza/pita_bread.jpg',
                ingreName: '4 pita breads'
            },
            {
                ingreImg: '/src/assets/resources/img/lambpizza/spinach.jpeg',
                ingreName: '50g baby spinach leaves'
            },
            {
                ingreImg: '/src/assets/resources/img/lambpizza/yoghurt.jpeg',
                ingreName: '100g natural yoghurt'
            }
        ],
        steps: [
            {
                stepImg: '/src/assets/resources/img/lambpizza/step1.jpeg',
                stepTitle: '1. Prep onion and lemon',
                stepText: 'Preheat the oven to 200C, fan-forced. Finely chop the <span>onion</span>. Finely grate <span>½ tsp lemon zest</span>, then juice <span>half the lemon</span>. Cut the <span>remaining lemon</span> into wedges.'
            },
            {
                stepImg: '/src/assets/resources/img/lambpizza/step2.jpeg',
                stepTitle: '2. Cook mince mixture',
                stepText: 'Heat <span>2 tsp olive oil</span> in a medium frypan over medium-high heat. Cook the <span>onion, lamb mince, currants</span> and <span>2 tsp cumin and coriander spice blend*</span>, breaking up the lumps with a spoon, for 5-6 mins until well browned. Season with <span>salt and pepper</span>.'
            },
            {
                stepImg: '/src/assets/resources/img/lambpizza/step3.jpeg',
                stepTitle: '3. Season yoghurt',
                stepText: 'While the mince is cooking, put <span>half the yoghurt</span> in a bowl. Season with <span>salt and pepper</span> and stir to combine.'
            },
            {
                stepImg: '/src/assets/resources/img/lambpizza/step4.jpeg',
                stepTitle: '4. Assemble and bake pizzas',
                stepText: 'Line 2 oven trays with baking paper. Put <span>2 pita*</span> on the lined trays. Spread with the <span>seasoned yoghurt</span>, then scatter over the <span>mince mixture</span>. Bake for 8-10 mins until golden.'
            },
            {
                stepImg: '/src/assets/resources/img/lambpizza/step5.jpeg',
                stepTitle: '5. Make mint yoghurt',
                stepText: 'Meanwhile, reserve <span>a few whole mint leaves</span>, then finely chop the <span>remaining mint leaves</span>, discarding the stems. Put the <span>chopped mint, lemon zest, remaining yoghurt</span> and <span>1 tbs water</span> in a bowl. Season with <span>salt and pepper</span> and stir to combine.'
            },
            {
                stepImg: '/src/assets/resources/img/lambpizza/step6.jpeg',
                stepTitle: '6. Toss salad and serve',
                stepText: 'Combine <span>2 tsp lemon juice*</span> and <span>1 tbs extra virgin olive oil</span> in a large bowl and season with <span>salt and pepper</span>. Coarsely chop the <span>cucumber</span>, add to the dressing with the <span>spinach</span> and toss to combine. Drizzle the pizzas with <span>mint yoghurt</span> and <span>1 tsp honey</span>, then scatter with the <span>reserved mint leaves</span>. Serve the <span>pizzas</span> at the table with the <span>salad</span> and <span>lemon wedges</span>.'
            }
        ],
    },
    {
        id: '06',
        name: 'Easy Plant-Based Butter Chicken',
        imageUrl: '/src/assets/resources/img/butterchicken/butter_chicken.jpeg',
        nameExtend: 'with Cumin Rice and Quick Red Onion Pickle',
        tags: ['VEGAN','NO ADDED GLUTEN','FAST','FAMILY-FRIENDLY','DAIRY FREE','3+ VEG SERVES'],
        description: "This meal is an Easy Plant-Based Butter Chicken, featuring a rich, creamy tomato sauce over tender plant-based protein. It's served on a bed of fragrant cumin rice and topped with a quick red onion pickle, adding a tangy contrast to the warm, savory flavors. A delicious and satisfying plant-based twist on a classic dish.",
        nutriFacts: ['680', '31.7', '82.4', '30'],
        ingredients: [
            {
                ingreImg: '/src/assets/resources/img/butterchicken/basmati_rice.jpeg',
                ingreName: '150g basmati rice'
            },
            {
                ingreImg: '/src/assets/resources/img/butterchicken/carrot.jpg',
                ingreName: '1 carrot'
            },
            {
                ingreImg: '/src/assets/resources/img/butterchicken/chicken.jpeg',
                ingreName: '200g plant-based chicken-style strips'
            },
            {
                ingreImg: '/src/assets/resources/img/butterchicken/coconut_milk.jpg',
                ingreName: '200ml coconut milk'
            },
            {
                ingreImg: '/src/assets/resources/img/butterchicken/cumin_seed.jpeg',
                ingreName: '5g cumin seeds',
            },
            {
                ingreImg: '/src/assets/resources/img/butterchicken/indian_butter.jpeg',
                ingreName: '50g Indian butter curry paste'
            },
            {
                ingreImg: '/src/assets/resources/img/butterchicken/onion.jpeg',
                ingreName: '1 red onion'
            },
            {
                ingreImg: '/src/assets/resources/img/butterchicken/puree.jpeg',
                ingreName: '210 tomato puree'
            },
            {
                ingreImg: '/src/assets/resources/img/butterchicken/spinach.jpg',
                ingreName: '100g baby spinach leaves'
            }
        ],
        steps: [
            {
                stepImg: '/src/assets/resources/img/butterchicken/step1.jpeg',
                stepTitle: '1. Pickle onion',
                stepText: 'Thinly slice the <span>onion</span> into rings. Combine <span>1 tsp sugar, 2 tsp white wine vinegar</span> and <span>a pinch of salt</span> in a large bowl. Add the onion and toss well to combine. Set aside to pickle, tossing occasionally, until needed.'
            },
            {
                stepImg: '/src/assets/resources/img/butterchicken/step2.jpeg',
                stepTitle: '2. Toast cumin seeds',
                stepText: 'Meanwhile, rinse the <span>rice</span> until the water runs clear. Melt <span>10g plant-based butter</span> in a small saucepan over medium-high heat. Add <span>half the cumin seeds*</span> and cook, stirring, for 30 secs or until fragrant.'
            },
            {
                stepImg: '/src/assets/resources/img/butterchicken/step3.jpeg',
                stepTitle: '3. Cook rice',
                stepText: 'Add the <span>rice</span> and <span>250ml (1 cup) water</span> to the cumin seeds, cover and bring to the boil. Reduce the heat to low and cook for 12 mins or until tender and the water is absorbed. Turn off the heat and stand, covered, for at least 5 mins.'
            },
            {
                stepImg: '/src/assets/resources/img/butterchicken/step4.jpeg',
                stepTitle: '4. Start curry',
                stepText: 'While the rice is cooking, halve the <span>carrot</span> lengthwise and thinly slice on an angle. Melt <span>10g plant-based butter</span> in a medium deep frypan over medium-high heat. Cook the <span>chicken-style strips</span> and <span>carrot</span>, stirring occasionally, for 3-4 mins until golden and heated through. Add the <span>curry paste</span> and cook, stirring, for 1 min or until fragrant and evenly coated.'
            },
            {
                stepImg: '/src/assets/resources/img/butterchicken/step5.jpeg',
                stepTitle: '5. Finish curry',
                stepText: 'Stir the <span>tomato puree</span> and <span>coconut milk</span> into the curry, season with <span>salt and pepper</span> and bring to a simmer. Cook, stirring occasionally, for 8 mins. Add the <span>spinach</span> to the curry and cook, stirring, for a further 1 min or until the sauce is slightly thickened and the vegetables are tender.'
            },
            {
                stepImg: '/src/assets/resources/img/butterchicken/step6.jpeg',
                stepTitle: '6. Get ready to serve',
                stepText: 'Fluff the <span>rice</span> with a fork. Divide the <span>rice, curry</span> and <span>pickled onion</span> among bowls. Drizzle over the pickling liquid to serve.'
            }
        ],
    },
    {
        id: '07',
        name: 'Chicken Dumpling-Noodle Soup',
        imageUrl: '/src/assets/resources/img/noodlesoup/noodle_soup.jpeg',
        nameExtend: 'with Greens and Chilli Vinegar',
        tags: ['SPICY','POULTRY','DAIRY FREE'],
        description: "This Chicken Dumpling-Noodle Soup is a comforting and flavorful dish, featuring tender chicken dumplings, hearty noodles, and fresh greens. The soup is complemented by a tangy kick of chili vinegar, adding a perfect balance of warmth and spice to this delicious, nourishing bowl.",
        nutriFacts: ['665', '26.2', '90.2', '19.5'],
        ingredients: [
            {
                ingreImg: '/src/assets/resources/img/noodlesoup/chili_flakes.jpeg',
                ingreName: '2g chili flakes'
            },
            {
                ingreImg: '/src/assets/resources/img/noodlesoup/dumplings.jpeg',
                ingreName: '300g honey soy chicken dumplings'
            },
            {
                ingreImg: '/src/assets/resources/img/noodlesoup/garlic.jpg',
                ingreName: '1 garlic clove'
            },
            {
                ingreImg: '/src/assets/resources/img/noodlesoup/ginger.jpg',
                ingreName: 'ginger'
            },
            {
                ingreImg: '/src/assets/resources/img/noodlesoup/noodles.jpeg',
                ingreName: '150 egg noodles',
            },
            {
                ingreImg: '/src/assets/resources/img/noodlesoup/pak_choy.jpg',
                ingreName: '1 pak choy'
            },
            {
                ingreImg: '/src/assets/resources/img/noodlesoup/sesame_oil.jpg',
                ingreName: '10ml sesame oil'
            },
            {
                ingreImg: '/src/assets/resources/img/noodlesoup/spring_onion.jpg',
                ingreName: '1 spring onion'
            },
            {
                ingreImg: '/src/assets/resources/img/noodlesoup/stock_cubes.jpg',
                ingreName: '2 x 2 chicken-style stock cubes'
            }
        ],
        steps: [
            {
                stepImg: '/src/assets/resources/img/noodlesoup/step1.jpeg',
                stepTitle: '1. Prep ingredients',
                stepText: 'Crush or finely chop the <span>garlic</span>. Peel and finely grate the <span>ginger</span>. Thinly slice the <span>spring onion</span> on an angle. Coarsely chop the <span>pak choy</span>, keeping the stems and leaves separate.'
            },
            {
                stepImg: '/src/assets/resources/img/noodlesoup/step2.jpeg',
                stepTitle: '2. Prep stock',
                stepText: 'Bring <span>1.5L (6 cups) water</span> to the boil in a medium saucepan. Crumble in <span>3 stock cubes*</span> and stir to dissolve.'
            },
            {
                stepImg: '/src/assets/resources/img/noodlesoup/step3.jpeg',
                stepTitle: '3. Make soup base',
                stepText: 'Add the <span>garlic, ginger, three-quarters of the spring onion, half the sesame oil, 1 tsp sugar</span> and <span>2 tsp soy sauce</span> to the stock and bring to a simmer over high heat. Reduce the heat to medium and simmer for 4-5 mins to develop the flavour.'
            },
            {
                stepImg: '/src/assets/resources/img/noodlesoup/step4.jpeg',
                stepTitle: '4. Make chilli vinegar',
                stepText: 'Meanwhile, heat <span>½ tsp chilli flakes*</span> and <span>1 tbs oil</span> in a small saucepan over low heat and cook, stirring, for 2-3 mins until fragrant. Remove from the heat and carefully stir in the <span>remaining sesame oil, 1 tbs white vinegar, 2 tsp soy sauce</span> and <span>1 tsp sugar</span> (take extra care when adding liquid to the hot pan as the oil can spit and the steam created is very hot).'
            },
            {
                stepImg: '/src/assets/resources/img/noodlesoup/step5.jpeg',
                stepTitle: '5. Cook dumplings',
                stepText: 'Add the <span>chicken dumplings</span> to the soup base, bring to the boil and cook for 1 min. Add the <span>noodles</span> and return to the boil.'
            },
            {
                stepImg: '/src/assets/resources/img/noodlesoup/step6.jpeg',
                stepTitle: '6. Get ready to serve',
                stepText: 'Add the <span>pak choy stems</span> to the soup and cook for a further 3 mins or until the noodles are tender. Add the <span>pak choy leaves</span> and stir for 30 secs or until wilted. Divide the <span>soup</span> among bowls. Drizzle with <span>a little of the chilli vinegar</span> and scatter with the <span>remaining spring onion</span>. Serve with the <span>remaining chilli vinegar</span>.'
            }
        ],
    },
    {
        id: '08',
        name: 'Sticky Chicken Wings',
        imageUrl: '/src/assets/resources/img/chickenwings/chicken_wings.jpeg',
        nameExtend: 'with Coconut Rice and Stir-Fried Vegetables',
        tags: ['NO ADDED GLUTEN','POULTRY','FAMILY-FRIENDLY','DAIRY FREE'],
        description: "This dish features Sticky Chicken Wings coated in a sweet and savory glaze, served on a bed of fragrant coconut rice. It’s paired with colorful stir-fried vegetables and garnished with crushed peanuts, making for a flavorful and balanced meal. A side of fresh lime wedges adds a zesty finish to this delicious combination.",
        nutriFacts: ['845', '24.9', '87.7', '41.5'],
        ingredients: [
            {
                ingreImg: '/src/assets/resources/img/chickenwings/capsicum.jpeg',
                ingreName: '1 capsicum'
            },
            {
                ingreImg: '/src/assets/resources/img/chickenwings/carrot.jpg',
                ingreName: '1 carrot'
            },
            {
                ingreImg: '/src/assets/resources/img/chickenwings/coconut_milk.jpg',
                ingreName: '200ml coconut milk'
            },
            {
                ingreImg: '/src/assets/resources/img/chickenwings/fish_sauce.jpg',
                ingreName: '20ml fish sauce'
            },
            {
                ingreImg: '/src/assets/resources/img/chickenwings/garlic.jpg',
                ingreName: '1 garlic clove',
            },
            {
                ingreImg: '/src/assets/resources/img/chickenwings/jasmine_rice.jpeg',
                ingreName: '150g jasmine rice'
            },
            {
                ingreImg: '/src/assets/resources/img/chickenwings/lime.jpg',
                ingreName: '1 lime'
            },
            {
                ingreImg: '/src/assets/resources/img/chickenwings/peanuts.jpeg',
                ingreName: '20g roasted peanuts'
            },
            {
                ingreImg: '/src/assets/resources/img/chickenwings/wings.jpeg',
                ingreName: 'chicken wings'
            },
            {
                ingreImg: '/src/assets/resources/img/chickenwings/zucchini.jpg',
                ingreName: '1 zucchini'
            }
        ],
        steps: [
            {
                stepImg: '/src/assets/resources/img/chickenwings/step1.jpeg',
                stepTitle: '1. Prep sauce',
                stepText: 'Preheat the oven to 220C, fan-forced. Grease a medium roasting pan. Crush or finely chop the <span>garlic</span>. Combine the <span>garlic, fish sauce, 2 tbs sugar, 2 tbs white vinegar, 2 tsp soy sauce</span> and <span>60ml (¼ cup) water</span> in the roasting pan.'
            },
            {
                stepImg: '/src/assets/resources/img/chickenwings/step2.jpeg',
                stepTitle: '2. Bake chicken wings',
                stepText: 'Add the <span>chicken wings</span> to the sauce and turn to coat. Bake, turning occasionally, for 25-30 mins until the chicken wings are cooked through and the sauce is sticky and reduced.'
            },
            {
                stepImg: '/src/assets/resources/img/chickenwings/step3.jpeg',
                stepTitle: '3. Cook rice',
                stepText: 'Meanwhile, rinse the <span>rice</span> until the water runs clear. Put the rice, <span>half the coconut milk*</span> and <span>200ml water</span> in a small saucepan, season with <span>salt</span>, cover and bring to a simmer. Reduce the heat to low and cook for 12 mins or until tender and the liquid is absorbed. Turn off the heat and stand, covered, for at least 5 mins.'
            },
            {
                stepImg: '/src/assets/resources/img/chickenwings/step4.jpeg',
                stepTitle: '4. Prep ingredients',
                stepText: 'While the rice is cooking, cut the <span>capsicum</span> into thin strips. Halve the <span>carrot</span> and <span>zucchini</span> lengthwise, then thinly slice on an angle. Cut <span>half the lime*</span> into wedges. Coarsely chop the <span>peanuts</span>.'
            },
            {
                stepImg: '/src/assets/resources/img/chickenwings/step5.jpeg',
                stepTitle: '5. Stir-fry vegetables',
                stepText: 'Heat <span>2 tsp oil</span> in a medium deep frypan over high heat. Stir-fry the <span>capsicum</span> and <span>carrot</span> for 2-3 mins until softened. Add the <span>zucchini</span> and stir-fry for 2 mins or until the vegetables are tender.'
            },
            {
                stepImg: '/src/assets/resources/img/chickenwings/step6.jpeg',
                stepTitle: '6. Get ready to serve',
                stepText: 'Fluff the <span>rice</span> with a fork. Divide the <span>rice, chicken wings</span> and <span>stir-fried vegetables</span> among plates. Drizzle with the <span>sauce</span> from the roasting pan. Scatter with the <span>peanuts</span> and serve with the <span>lime wedges</span>.'
            }
        ],
    }
]


const meal_display = computed(() => {
    return meals.find(m => m.id === props.mealID);
});
</script>

<style scoped>
section {
    margin-top: 70px;
}

.info-title {
    margin-left: 10px;
    font-size: 20px;
    color: #ff603d;
}

.meal-container {
    overflow: hidden;
    width: 100%;
    height: 550px;
    border-radius: 8% 25% 18% 55%;
    position: relative;
}

.meal-container img {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100vw;
    height: 550px;
    object-fit: cover;
}

#description .row div:nth-child(2) p:first-of-type {
    color: rgb(137, 137, 137);
    font-size: 20px;
    margin-top: -10px;
}

#meal-info {
    margin-top: 70px;
}

#description ul,
#nutri ul {
    list-style-type: none;
    padding: 0;
    margin: 0;
}

#description li {
    display: inline;
    margin-right: 10px;
    font-size: 12px;
    background-color: rgb(246, 246, 246);
    padding: 5px;
    font-family: monospace;
    color: rgb(112, 111, 111);
}

#meal-intro {
    text-align: justify;
}

#nutri li {
    display: flex;
    justify-content: space-between;
    padding: 5px 0;
}

.ingredient-img {
    overflow: hidden;
    width: 110px;
    height: 110px;
    border-radius: 80px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.ingredient-img img {
    width: 120px;
    height: auto;
}

#ingredients {
    display: flex;
    flex-wrap: wrap;
    gap: 50px;
}

.ingredient-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    width: 110px;
    margin-bottom: 10px;

}

.ingredient-container p {
    margin-top: 5px;
    font-size: 14px;
    word-wrap: break-word;
    line-height: 1.2;
}

hr {
    margin-top: 0px;
    margin-bottom: 0px;
}

.card {
    border: none !important;
    margin: 10px auto;
}

.card-title{
    font-weight: bold;
}

::v-deep .card-text span {
    font-weight: bold;
}
/*tablet*/
@media only screen and (max-width: 830px) {

    .meal-container {
        width: 90vw;
        margin-left: -5vw;
        border-radius: 34% 45% 55% 66%;
    }

    #meal-info {
        margin-top: 0px;
    }

    #nutri {
        background-color: rgb(250, 250, 250);
        padding: 20px;
        border-radius: 20px;
    }

    #ingredient-div {
        margin-top: 10px;
        background-color: rgb(250, 250, 250);
        padding: 20px;
        border-radius: 20px;
    }
}

/*mobile*/
@media only screen and (max-width: 450px) {
    .meal-container {
        width: 100vw;
        margin-left: -55px;
        border-radius: 0;
    }
}
</style>