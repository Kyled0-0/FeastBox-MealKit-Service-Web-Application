import { prisma } from './client.js'
import { sanitiseMealSteps } from '../services/sanitiseMealContent.js'

const PRICE_CENTS = 1200

const img = (path) => `/src/assets/resources/img/${path}`

const meals = [
  {
    title: 'Fast Peppered Beef Wraps',
    nameExtend: 'with Chimichurri Tomato and Aioli',
    cuisine: 'Latin American',
    tags: ['FAST', 'MEAT', 'FAMILY-FRIENDLY', 'DAIRY-FREE', 'OPTIONAL SPICE', '>40G PROTEIN'],
    imageUrl: img('beefwraps/beef-wraps.jpeg'),
    description:
      'These wraps are a perfect blend of tender, juicy steak strips layered with fresh, crisp spinach and vibrant tomatoes, all topped with a chimichurri sauce. Perfect for a quick lunch or a light dinner, these wraps are as nutritious as they are delicious, making them an ideal choice for those seeking a balanced and tasty meal. Enjoy the richness of quality steak combined with the freshness of garden veggies in every wrap!',
    nutriFacts: { caloriesKcal: 820, proteinG: 41.1, carbsG: 44.7, fatG: 52 },
    ingredients: [
      { name: '50g aioli mayonnaise', image: img('beefwraps/aioli-mayo.jpg') },
      { name: 'beef stir-fry', image: img('beefwraps/beef-stirfry.jpg') },
      { name: '2g dried oregano', image: img('beefwraps/oregano.jpeg') },
      { name: 'parsley', image: img('beefwraps/parsley.jpg') },
      { name: '1 red onion', image: img('beefwraps/red-onion.jpeg') },
      { name: '10g pepper and garlic seasoning', image: img('beefwraps/seasoning.jpeg') },
      { name: '50g baby spinach leaves', image: img('beefwraps/spinach.jpeg') },
      { name: '1 tomato', image: img('beefwraps/tomato.jpg') },
      { name: '6 flour tortillas', image: img('beefwraps/tortilla.jpeg') },
    ],
    steps: [
      {
        title: '1. Prep ingredients',
        image: img('beefwraps/step1.jpeg'),
        stepText: 'Finely chop the <span>onion</span> and <span>parsley</span>, including the parsley stems.',
      },
      {
        title: '2. Make chimichurri',
        image: img('beefwraps/step2.jpeg'),
        stepText:
          'Put <span>1½ tsp dried oregano*, 1 tbs red wine vinegar</span> and <span>1 tbs extra virgin olive oil</span> in a large bowl. Add the <span>onion</span> and <span>parsley</span> and season with <span>salt and pepper</span>.',
      },
      {
        title: '3. Prep tomato',
        image: img('beefwraps/step3.jpeg'),
        stepText: 'Cut the <span>tomato</span> into thin wedges, add to the chimichurri and stir to combine.',
      },
      {
        title: '4. Cook Beef',
        image: img('beefwraps/step4.jpeg'),
        stepText:
          'Separate the <span>beef stir-fry</span>. Heat <span>20g butter</span> in a large frypan over medium-high heat. Stir-fry the beef for 1-2 mins until browned. Add <span>3 tsp pepper and garlic seasoning</span> and cook, stirring, for 1 min or until fragrant. Remove from the pan.',
      },
      {
        title: '5. Warm tortillas',
        image: img('beefwraps/step5.jpeg'),
        stepText:
          'Heat <span>a drizzle of olive oil</span> in the same pan over high heat. Warm the <span>tortillas</span>, in batches, for 30 secs each side or until heated through and golden.',
      },
      {
        title: '6. Get ready to serve',
        image: img('beefwraps/step6.jpeg'),
        stepText:
          'Spread the <span>tortillas</span> with the <span>aioli</span> and divide among plates. Fill with the <span>spinach, beef</span> and <span>chimichurri tomato</span> to serve.',
      },
    ],
  },
  {
    title: 'Easy Veggie and Haloumi Salad',
    nameExtend: 'with Red Pesto Dressing',
    cuisine: 'Mediterranean',
    tags: ['VEGETARIAN', 'NO ADDED GLUTEN', 'FAMILY-FRIENDLY', '3+ VEG SERVES'],
    imageUrl: img('haloumisalad/haloumi-salad.jpeg'),
    description:
      "Welcome to a burst of flavors with this Easy Veggie and Haloumi Salad! Grilled to perfection, the Haloumi adds a savory touch to the fresh, colorful veggies, all beautifully complemented by a rich red pesto dressing. This dish is not just a meal, it's a celebration of wholesome, delicious eating!",
    nutriFacts: { caloriesKcal: 750, proteinG: 27.9, carbsG: 40.4, fatG: 51.3 },
    ingredients: [
      { name: '2 small sweet potatoes', image: img('haloumisalad/sweet-potato.jpg') },
      { name: '250g cauliflower', image: img('haloumisalad/cauliflower.jpg') },
      { name: '1 capsicum', image: img('haloumisalad/capsicum.jpeg') },
      { name: '1 red onion', image: img('haloumisalad/red-onion.jpeg') },
      { name: '5g smokey barbecue seasoning', image: img('haloumisalad/smoke-bbq.jpeg') },
      { name: '50g red pesto', image: img('haloumisalad/red-pesto.jpeg') },
      { name: '180g haloumi', image: img('haloumisalad/haloumi.jpg') },
      { name: '50g mixed salad leaves', image: img('haloumisalad/salad-leaves.jpeg') },
    ],
    steps: [
      {
        title: '1. Prep vegetables',
        image: img('haloumisalad/step1.jpeg'),
        stepText:
          'Preheat the oven to 200C, fan-forced. Line a large oven tray with baking paper. Cut the <span>unpeeled sweet potatoes</span> into 1.5cm chunks. Coarsely chop the <span>cauliflower</span> stem, then cut the head into small florets. Thinly slice the <span>capsicum</span>. Cut the <span>onion</span> into thin wedges.',
      },
      {
        title: '2. Roast vegetables',
        image: img('haloumisalad/step2.jpeg'),
        stepText:
          'Put the <span>sweet potato, cauliflower, capsicum</span> and <span>onion</span> on the lined tray. Drizzle with <span>1 tbs olive oil</span> and scatter with the <span>barbecue seasoning</span>, then toss to coat. Roast for 20-25 mins until golden and tender.',
      },
      {
        title: '3. Make dressing',
        image: img('haloumisalad/step3.jpeg'),
        stepText:
          'Meanwhile, combine the <span>red pesto, 2 tsp extra virgin olive oil</span> and <span>2 tsp red wine vinegar</span> in a large bowl and season with <span>salt and pepper</span>.',
      },
      {
        title: '4. Prep haloumi',
        image: img('haloumisalad/step4.jpeg'),
        stepText: 'Slice the <span>haloumi</span> and dry on paper towel.',
      },
      {
        title: '5. Cook haloumi',
        image: img('haloumisalad/step5.jpeg'),
        stepText:
          'Heat <span>2 tsp olive oil</span> in a medium frypan over medium-high heat. Cook the <span>haloumi</span> for 2 mins each side or until golden. Remove from the pan.',
      },
      {
        title: '6. Get ready to serve',
        image: img('haloumisalad/step6.jpeg'),
        stepText:
          'Add the <span>roasted vegetables</span> and <span>salad leaves</span> to the dressing and toss to combine. Divide the <span>salad</span> and <span>haloumi</span> among bowls to serve.',
      },
    ],
  },
  {
    title: 'Mediterranean Mussel and Tomato Risotto',
    nameExtend: 'with Fresh Spinach and Parsley',
    cuisine: 'Mediterranean',
    tags: ['NO ADDED GLUTEN', 'SEAFOOD'],
    imageUrl: img('musselrisotto/mussel_risotto.jpeg'),
    description:
      "The Mediterranean Mussel and Tomato Risotto is a flavorful blend of fresh mussels, tangy tomatoes, and creamy risotto. Enhanced by spinach and parsley, it delivers a taste of the Mediterranean that's both rich and refreshing. Perfect for a seafood lover's meal!",
    nutriFacts: { caloriesKcal: 540, proteinG: 23.4, carbsG: 69, fatG: 17.5 },
    ingredients: [
      { name: '150g arborio rice', image: img('musselrisotto/arborio_rice.jpeg') },
      { name: '2 garlic cloves', image: img('musselrisotto/garlic.jpg') },
      { name: '10g italian seasoning', image: img('musselrisotto/italian_seasoning.jpeg') },
      { name: '2 x 500g Australian blue mussels', image: img('musselrisotto/mussel.jpeg') },
      { name: '1 onion', image: img('musselrisotto/onion.jpeg') },
      { name: 'parsley', image: img('musselrisotto/parsley.jpg') },
      { name: '50g baby spinach leaves', image: img('musselrisotto/spinach.jpeg') },
      { name: '2 chicken-style stock cubes', image: img('musselrisotto/stock.jpg') },
      { name: '2 tomatoes', image: img('musselrisotto/tomato.jpg') },
      { name: '5g ground turmeric', image: img('musselrisotto/tumeric.jpeg') },
    ],
    steps: [
      {
        title: '1. Prep ingredients',
        image: img('musselrisotto/step1.jpeg'),
        stepText:
          'Thinly slice the <span>onion</span>. Coarsely chop the <span>tomatoes</span>. Pick the <span>parsley</span> leaves and finely chop the stems. Crush or finely chop the <span>garlic</span>.',
      },
      {
        title: '2. Prep mussels and stock',
        image: img('musselrisotto/step2.jpeg'),
        stepText:
          'Strain <span>125ml (½ cup) mussel liquid</span> into a jug, discarding any remaining liquid. Rinse the <span>mussels</span>. Put the strained mussel liquid in a small saucepan over medium-high heat. Crumble in the <span>stock cubes</span>, add <span>500ml (2 cups) boiling water</span> and stir to dissolve. Bring to a simmer, then reduce the heat to low.',
      },
      {
        title: '3. Cook onion mixture',
        image: img('musselrisotto/step3.jpeg'),
        stepText:
          'Meanwhile, heat <span>1 tbs olive oil</span> in a medium deep frypan over high heat. Cook the <span>onion, tomato, parsley</span> stems and <span>garlic</span>, stirring regularly, for 3 mins or until the onion is softened.',
      },
      {
        title: '4. Cook risotto',
        image: img('musselrisotto/step4.jpeg'),
        stepText:
          'Add the <span>rice, Italian seasoning</span> and <span>¼ tsp turmeric*</span> to the onion mixture and cook, stirring, for 1-2 mins until the grains are well coated. Add the <span>hot stock</span>, reduce the heat to low and cook, covered, for 17 mins or until most of the liquid is absorbed and the rice is almost tender.',
      },
      {
        title: '5. Add spinach and butter',
        image: img('musselrisotto/step5.jpeg'),
        stepText:
          'Add the <span>spinach, 10g butter</span> and <span>½ tsp red wine vinegar</span> to the risotto and stir to combine.',
      },
      {
        title: '6. Heat mussels and serve',
        image: img('musselrisotto/step6.jpeg'),
        stepText:
          'Push the <span>mussels</span>, closed-end down, into the risotto. Cook, covered, for a further 3 mins or until the mussels are hot. Remove the pan from the heat. Taste the risotto, then season with <span>salt and pepper</span>. Scatter the <span>risotto</span> with the <span>parsley leaves</span> and serve at the table.',
      },
    ],
  },
  {
    title: 'Sesame Soy-Glazed Salmon',
    nameExtend: 'with Broccoli, Pak Choy and Brown Rice',
    cuisine: 'Asian',
    tags: ['NO ADDED GLUTEN', 'FISH', 'FAMILY-FRIENDLY', 'DAIRY-FREE', 'NUTRITIOUS', '3+ VEG SERVES'],
    imageUrl: img('sesamesalmon/sesame_salmon.jpeg'),
    description:
      'This meal features Sesame Soy-Glazed Salmon, perfectly paired with a vibrant mix of fresh broccoli, pak choy, and carrots, served over a bed of hearty brown rice. The savory glaze adds a rich, flavorful touch to the tender salmon, making it a wholesome and delicious option for any time of day.',
    nutriFacts: { caloriesKcal: 735, proteinG: 39.3, carbsG: 63.8, fatG: 34.2 },
    ingredients: [
      { name: '125g brown rice', image: img('sesamesalmon/brown_rice.jpeg') },
      { name: '1 head broccoli', image: img('sesamesalmon/brocoli.jpg') },
      { name: '1 carrot', image: img('sesamesalmon/carrot.jpg') },
      { name: '1 pak choy', image: img('sesamesalmon/pak_choy.jpg') },
      { name: '2 Tasmanian salmon fillets', image: img('sesamesalmon/salmon.jpg') },
      { name: '10ml sesame oil', image: img('sesamesalmon/sesame_oil.jpg') },
      { name: '5g toasted sesame seeds', image: img('sesamesalmon/sesame.jpeg') },
    ],
    steps: [
      {
        title: '1. Cook rice',
        image: img('sesamesalmon/step1.jpeg'),
        stepText:
          'Fill a medium saucepan three-quarters full with water and bring to the boil. Add the <span>rice</span> and cook for 25-27 mins until tender. Drain.',
      },
      {
        title: '2. Prep vegetables',
        image: img('sesamesalmon/step2.jpeg'),
        stepText:
          'Halve the <span>carrot</span> lengthwise and thinly slice on an angle. Coarsely chop the <span>broccoli</span> stem, then cut the head into small florets. Coarsely chop the <span>pak choy</span>, keeping the stems and leaves separate.',
      },
      {
        title: '3. Prep salmon',
        image: img('sesamesalmon/step3.jpeg'),
        stepText:
          'Cut the <span>salmon</span> into 3cm cubes. (If preferred, remove the skin before cutting into cubes by making an incision between flesh and skin with a sharp knife. Grip skin tightly and slice in a downward motion, pushing the blade into the skin.)',
      },
      {
        title: '4. Make sesame-soy sauce',
        image: img('sesamesalmon/step4.jpeg'),
        stepText:
          'Whisk the <span>sesame seeds, sesame oil, 1 tbs soy sauce, 3 tsp white vinegar, 1 tbs water</span> and <span>1 tbs honey</span> in a bowl until combined.',
      },
      {
        title: '5. Stir-fry vegetables',
        image: img('sesamesalmon/step5.jpeg'),
        stepText:
          'Heat <span>2 tsp extra virgin olive oil</span> in a large deep frypan over high heat. Stir-fry the <span>carrot, broccoli</span> and <span>pak choy</span> stems for 2 mins. Add <span>1 tbs water</span> and cook, stirring, for 1 min or until just starting to soften. Add the <span>pak choy leaves</span> and stir-fry for a further 1 min or until the vegetables are just tender.',
      },
      {
        title: '6. Cook salmon',
        image: img('sesamesalmon/step6.jpeg'),
        stepText:
          'Meanwhile, heat <span>2 tsp extra virgin olive oil</span> in a medium frypan over medium-high heat. Cook the <span>salmon</span> for 1-2 mins each side until golden. Add the <span>sesame-soy sauce</span> and cook, stirring, for 2 mins or until the sauce is reduced. Divide the <span>rice, salmon</span> and <span>vegetables</span> among bowls. Drizzle with the <span>sesame-soy sauce</span> to serve.',
      },
    ],
  },
  {
    title: 'Lebanese-Style Lamb Pizza',
    nameExtend: 'with Spinach Salad and Mint Yoghurt',
    cuisine: 'Middle Eastern',
    tags: ['MEAT', 'FAMILY-FRIENDLY'],
    imageUrl: img('lambpizza/lamb_pizza.jpeg'),
    description:
      "This dish is a Lebanese-Style Lamb Pizza, featuring a crispy base topped with seasoned ground lamb, fresh mint leaves, and dollops of creamy mint yogurt. It's paired with a refreshing spinach salad, making it a perfect blend of rich flavors and light, refreshing sides.",
    nutriFacts: { caloriesKcal: 710, proteinG: 38.7, carbsG: 64.7, fatG: 31.9 },
    ingredients: [
      { name: '1 Lebanese cucumber', image: img('lambpizza/cucumber.jpg') },
      { name: '5g cumin and coriander spice blend', image: img('lambpizza/cumin_spice.jpeg') },
      { name: '20g dried currants', image: img('lambpizza/currants.jpeg') },
      { name: 'lamb mince', image: img('lambpizza/lamb_mince.jpg') },
      { name: '1 lemon', image: img('lambpizza/lemon.jpg') },
      { name: 'mint', image: img('lambpizza/mint.jpeg') },
      { name: '1 onion', image: img('lambpizza/onion.jpeg') },
      { name: '4 pita breads', image: img('lambpizza/pita_bread.jpg') },
      { name: '50g baby spinach leaves', image: img('lambpizza/spinach.jpeg') },
      { name: '100g natural yoghurt', image: img('lambpizza/yoghurt.jpeg') },
    ],
    steps: [
      {
        title: '1. Prep onion and lemon',
        image: img('lambpizza/step1.jpeg'),
        stepText:
          'Preheat the oven to 200C, fan-forced. Finely chop the <span>onion</span>. Finely grate <span>½ tsp lemon zest</span>, then juice <span>half the lemon</span>. Cut the <span>remaining lemon</span> into wedges.',
      },
      {
        title: '2. Cook mince mixture',
        image: img('lambpizza/step2.jpeg'),
        stepText:
          'Heat <span>2 tsp olive oil</span> in a medium frypan over medium-high heat. Cook the <span>onion, lamb mince, currants</span> and <span>2 tsp cumin and coriander spice blend*</span>, breaking up the lumps with a spoon, for 5-6 mins until well browned. Season with <span>salt and pepper</span>.',
      },
      {
        title: '3. Season yoghurt',
        image: img('lambpizza/step3.jpeg'),
        stepText:
          'While the mince is cooking, put <span>half the yoghurt</span> in a bowl. Season with <span>salt and pepper</span> and stir to combine.',
      },
      {
        title: '4. Assemble and bake pizzas',
        image: img('lambpizza/step4.jpeg'),
        stepText:
          'Line 2 oven trays with baking paper. Put <span>2 pita*</span> on the lined trays. Spread with the <span>seasoned yoghurt</span>, then scatter over the <span>mince mixture</span>. Bake for 8-10 mins until golden.',
      },
      {
        title: '5. Make mint yoghurt',
        image: img('lambpizza/step5.jpeg'),
        stepText:
          'Meanwhile, reserve <span>a few whole mint leaves</span>, then finely chop the <span>remaining mint leaves</span>, discarding the stems. Put the <span>chopped mint, lemon zest, remaining yoghurt</span> and <span>1 tbs water</span> in a bowl. Season with <span>salt and pepper</span> and stir to combine.',
      },
      {
        title: '6. Toss salad and serve',
        image: img('lambpizza/step6.jpeg'),
        stepText:
          'Combine <span>2 tsp lemon juice*</span> and <span>1 tbs extra virgin olive oil</span> in a large bowl and season with <span>salt and pepper</span>. Coarsely chop the <span>cucumber</span>, add to the dressing with the <span>spinach</span> and toss to combine. Drizzle the pizzas with <span>mint yoghurt</span> and <span>1 tsp honey</span>, then scatter with the <span>reserved mint leaves</span>. Serve the <span>pizzas</span> at the table with the <span>salad</span> and <span>lemon wedges</span>.',
      },
    ],
  },
  {
    title: 'Easy Plant-Based Butter Chicken',
    nameExtend: 'with Cumin Rice and Quick Red Onion Pickle',
    cuisine: 'Indian',
    tags: ['VEGAN', 'NO ADDED GLUTEN', 'FAST', 'FAMILY-FRIENDLY', 'DAIRY-FREE', '3+ VEG SERVES'],
    imageUrl: img('butterchicken/butter_chicken.jpeg'),
    description:
      "This meal is an Easy Plant-Based Butter Chicken, featuring a rich, creamy tomato sauce over tender plant-based protein. It's served on a bed of fragrant cumin rice and topped with a quick red onion pickle, adding a tangy contrast to the warm, savory flavors. A delicious and satisfying plant-based twist on a classic dish.",
    nutriFacts: { caloriesKcal: 680, proteinG: 31.7, carbsG: 82.4, fatG: 30 },
    ingredients: [
      { name: '150g basmati rice', image: img('butterchicken/basmati_rice.jpeg') },
      { name: '1 carrot', image: img('butterchicken/carrot.jpg') },
      { name: '200g plant-based chicken-style strips', image: img('butterchicken/chicken.jpeg') },
      { name: '200ml coconut milk', image: img('butterchicken/coconut_milk.jpg') },
      { name: '5g cumin seeds', image: img('butterchicken/cumin_seed.jpeg') },
      { name: '50g Indian butter curry paste', image: img('butterchicken/indian_butter.jpeg') },
      { name: '1 red onion', image: img('butterchicken/onion.jpeg') },
      { name: '210g tomato puree', image: img('butterchicken/puree.jpeg') },
      { name: '100g baby spinach leaves', image: img('butterchicken/spinach.jpg') },
    ],
    steps: [
      {
        title: '1. Pickle onion',
        image: img('butterchicken/step1.jpeg'),
        stepText:
          'Thinly slice the <span>onion</span> into rings. Combine <span>1 tsp sugar, 2 tsp white wine vinegar</span> and <span>a pinch of salt</span> in a large bowl. Add the onion and toss well to combine. Set aside to pickle, tossing occasionally, until needed.',
      },
      {
        title: '2. Toast cumin seeds',
        image: img('butterchicken/step2.jpeg'),
        stepText:
          'Meanwhile, rinse the <span>rice</span> until the water runs clear. Melt <span>10g plant-based butter</span> in a small saucepan over medium-high heat. Add <span>half the cumin seeds*</span> and cook, stirring, for 30 secs or until fragrant.',
      },
      {
        title: '3. Cook rice',
        image: img('butterchicken/step3.jpeg'),
        stepText:
          'Add the <span>rice</span> and <span>250ml (1 cup) water</span> to the cumin seeds, cover and bring to the boil. Reduce the heat to low and cook for 12 mins or until tender and the water is absorbed. Turn off the heat and stand, covered, for at least 5 mins.',
      },
      {
        title: '4. Start curry',
        image: img('butterchicken/step4.jpeg'),
        stepText:
          'While the rice is cooking, halve the <span>carrot</span> lengthwise and thinly slice on an angle. Melt <span>10g plant-based butter</span> in a medium deep frypan over medium-high heat. Cook the <span>chicken-style strips</span> and <span>carrot</span>, stirring occasionally, for 3-4 mins until golden and heated through. Add the <span>curry paste</span> and cook, stirring, for 1 min or until fragrant and evenly coated.',
      },
      {
        title: '5. Finish curry',
        image: img('butterchicken/step5.jpeg'),
        stepText:
          'Stir the <span>tomato puree</span> and <span>coconut milk</span> into the curry, season with <span>salt and pepper</span> and bring to a simmer. Cook, stirring occasionally, for 8 mins. Add the <span>spinach</span> to the curry and cook, stirring, for a further 1 min or until the sauce is slightly thickened and the vegetables are tender.',
      },
      {
        title: '6. Get ready to serve',
        image: img('butterchicken/step6.jpeg'),
        stepText:
          'Fluff the <span>rice</span> with a fork. Divide the <span>rice, curry</span> and <span>pickled onion</span> among bowls. Drizzle over the pickling liquid to serve.',
      },
    ],
  },
  {
    title: 'Chicken Dumpling-Noodle Soup',
    nameExtend: 'with Greens and Chilli Vinegar',
    cuisine: 'Asian',
    tags: ['SPICY', 'POULTRY', 'DAIRY-FREE'],
    imageUrl: img('noodlesoup/noodle_soup.jpeg'),
    description:
      'This Chicken Dumpling-Noodle Soup is a comforting and flavorful dish, featuring tender chicken dumplings, hearty noodles, and fresh greens. The soup is complemented by a tangy kick of chili vinegar, adding a perfect balance of warmth and spice to this delicious, nourishing bowl.',
    nutriFacts: { caloriesKcal: 665, proteinG: 26.2, carbsG: 90.2, fatG: 19.5 },
    ingredients: [
      { name: '2g chili flakes', image: img('noodlesoup/chili_flakes.jpeg') },
      { name: '300g honey soy chicken dumplings', image: img('noodlesoup/dumplings.jpeg') },
      { name: '1 garlic clove', image: img('noodlesoup/garlic.jpg') },
      { name: 'ginger', image: img('noodlesoup/ginger.jpg') },
      { name: '150g egg noodles', image: img('noodlesoup/noodles.jpeg') },
      { name: '1 pak choy', image: img('noodlesoup/pak_choy.jpg') },
      { name: '10ml sesame oil', image: img('noodlesoup/sesame_oil.jpg') },
      { name: '1 spring onion', image: img('noodlesoup/spring_onion.jpg') },
      { name: '2 chicken-style stock cubes', image: img('noodlesoup/stock_cubes.jpg') },
    ],
    steps: [
      {
        title: '1. Prep ingredients',
        image: img('noodlesoup/step1.jpeg'),
        stepText:
          'Crush or finely chop the <span>garlic</span>. Peel and finely grate the <span>ginger</span>. Thinly slice the <span>spring onion</span> on an angle. Coarsely chop the <span>pak choy</span>, keeping the stems and leaves separate.',
      },
      {
        title: '2. Prep stock',
        image: img('noodlesoup/step2.jpeg'),
        stepText:
          'Bring <span>1.5L (6 cups) water</span> to the boil in a medium saucepan. Crumble in <span>3 stock cubes*</span> and stir to dissolve.',
      },
      {
        title: '3. Make soup base',
        image: img('noodlesoup/step3.jpeg'),
        stepText:
          'Add the <span>garlic, ginger, three-quarters of the spring onion, half the sesame oil, 1 tsp sugar</span> and <span>2 tsp soy sauce</span> to the stock and bring to a simmer over high heat. Reduce the heat to medium and simmer for 4-5 mins to develop the flavour.',
      },
      {
        title: '4. Make chilli vinegar',
        image: img('noodlesoup/step4.jpeg'),
        stepText:
          'Meanwhile, heat <span>½ tsp chilli flakes*</span> and <span>1 tbs oil</span> in a small saucepan over low heat and cook, stirring, for 2-3 mins until fragrant. Remove from the heat and carefully stir in the <span>remaining sesame oil, 1 tbs white vinegar, 2 tsp soy sauce</span> and <span>1 tsp sugar</span>.',
      },
      {
        title: '5. Cook dumplings',
        image: img('noodlesoup/step5.jpeg'),
        stepText:
          'Add the <span>chicken dumplings</span> to the soup base, bring to the boil and cook for 1 min. Add the <span>noodles</span> and return to the boil.',
      },
      {
        title: '6. Get ready to serve',
        image: img('noodlesoup/step6.jpeg'),
        stepText:
          'Add the <span>pak choy stems</span> to the soup and cook for a further 3 mins or until the noodles are tender. Add the <span>pak choy leaves</span> and stir for 30 secs or until wilted. Divide the <span>soup</span> among bowls. Drizzle with <span>a little of the chilli vinegar</span> and scatter with the <span>remaining spring onion</span>. Serve with the <span>remaining chilli vinegar</span>.',
      },
    ],
  },
  {
    title: 'Sticky Chicken Wings',
    nameExtend: 'with Coconut Rice and Stir-Fried Vegetables',
    cuisine: 'Thai',
    tags: ['NO ADDED GLUTEN', 'POULTRY', 'FAMILY-FRIENDLY', 'DAIRY-FREE'],
    imageUrl: img('chickenwings/chicken_wings.jpeg'),
    description:
      "This dish features Sticky Chicken Wings coated in a sweet and savory glaze, served on a bed of fragrant coconut rice. It's paired with colorful stir-fried vegetables and garnished with crushed peanuts, making for a flavorful and balanced meal. A side of fresh lime wedges adds a zesty finish to this delicious combination.",
    nutriFacts: { caloriesKcal: 845, proteinG: 24.9, carbsG: 87.7, fatG: 41.5 },
    ingredients: [
      { name: '1 capsicum', image: img('chickenwings/capsicum.jpeg') },
      { name: '1 carrot', image: img('chickenwings/carrot.jpg') },
      { name: '200ml coconut milk', image: img('chickenwings/coconut_milk.jpg') },
      { name: '20ml fish sauce', image: img('chickenwings/fish_sauce.jpg') },
      { name: '1 garlic clove', image: img('chickenwings/garlic.jpg') },
      { name: '150g jasmine rice', image: img('chickenwings/jasmine_rice.jpeg') },
      { name: '1 lime', image: img('chickenwings/lime.jpg') },
      { name: '20g roasted peanuts', image: img('chickenwings/peanuts.jpeg') },
      { name: 'chicken wings', image: img('chickenwings/wings.jpeg') },
      { name: '1 zucchini', image: img('chickenwings/zucchini.jpg') },
    ],
    steps: [
      {
        title: '1. Prep sauce',
        image: img('chickenwings/step1.jpeg'),
        stepText:
          'Preheat the oven to 220C, fan-forced. Grease a medium roasting pan. Crush or finely chop the <span>garlic</span>. Combine the <span>garlic, fish sauce, 2 tbs sugar, 2 tbs white vinegar, 2 tsp soy sauce</span> and <span>60ml (¼ cup) water</span> in the roasting pan.',
      },
      {
        title: '2. Bake chicken wings',
        image: img('chickenwings/step2.jpeg'),
        stepText:
          'Add the <span>chicken wings</span> to the sauce and turn to coat. Bake, turning occasionally, for 25-30 mins until the chicken wings are cooked through and the sauce is sticky and reduced.',
      },
      {
        title: '3. Cook rice',
        image: img('chickenwings/step3.jpeg'),
        stepText:
          'Meanwhile, rinse the <span>rice</span> until the water runs clear. Put the rice, <span>half the coconut milk*</span> and <span>200ml water</span> in a small saucepan, season with <span>salt</span>, cover and bring to a simmer. Reduce the heat to low and cook for 12 mins or until tender and the liquid is absorbed. Turn off the heat and stand, covered, for at least 5 mins.',
      },
      {
        title: '4. Prep ingredients',
        image: img('chickenwings/step4.jpeg'),
        stepText:
          'While the rice is cooking, cut the <span>capsicum</span> into thin strips. Halve the <span>carrot</span> and <span>zucchini</span> lengthwise, then thinly slice on an angle. Cut <span>half the lime*</span> into wedges. Coarsely chop the <span>peanuts</span>.',
      },
      {
        title: '5. Stir-fry vegetables',
        image: img('chickenwings/step5.jpeg'),
        stepText:
          'Heat <span>2 tsp oil</span> in a medium deep frypan over high heat. Stir-fry the <span>capsicum</span> and <span>carrot</span> for 2-3 mins until softened. Add the <span>zucchini</span> and stir-fry for 2 mins or until the vegetables are tender.',
      },
      {
        title: '6. Get ready to serve',
        image: img('chickenwings/step6.jpeg'),
        stepText:
          'Fluff the <span>rice</span> with a fork. Divide the <span>rice, chicken wings</span> and <span>stir-fried vegetables</span> among plates. Drizzle with the <span>sauce</span> from the roasting pan. Scatter with the <span>peanuts</span> and serve with the <span>lime wedges</span>.',
      },
    ],
  },
]

async function main() {
  // Belt: never run in production. Meals are managed via admin tooling there.
  if (process.env.NODE_ENV === 'production') {
    throw new Error('seed.js refuses to run in production (NODE_ENV=production).')
  }

  // Braces: refuse to wipe meals if orders reference them. OrderItem.mealId
  // is onDelete: Restrict, so prisma.meal.deleteMany() will fail with a
  // foreign-key violation the moment any OrderItem points at a meal. The
  // previous version of this script worked around Restrict by manually
  // deleting orderItems and orders first in dependency order — which
  // destroyed real order history. Fail loud instead. A dev who points
  // npm run db:seed at a populated DATABASE_URL by mistake should not
  // silently lose data. (TODO Task 11: replace with upsert-by-slug once
  // Meal gains a @unique slug field; then this script can drop the
  // delete-all step entirely.)
  const orderCount = await prisma.order.count()
  if (orderCount > 0) {
    throw new Error(
      `Refusing to seed: ${orderCount} order(s) exist. Use \`npm run db:reset\` if you truly want to wipe everything.`
    )
  }

  await prisma.meal.deleteMany()

  for (const meal of meals) {
    await prisma.meal.create({
      data: {
        ...meal,
        pricePerServingCents: PRICE_CENTS,
        steps: sanitiseMealSteps(meal.steps),
      },
    })
  }

  const count = await prisma.meal.count()
  console.log(`Seeded ${count} meals.`)
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err)
    await prisma.$disconnect()
    process.exit(1)
  })
