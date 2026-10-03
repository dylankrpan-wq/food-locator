// Nutrition for popular items at major US chains, transcribed from each
// chain's own published nutrition information in October 2026 (the source is
// noted above each chain). Recipes and portions change, so re-check against
// the chain's current guide from time to time.
//
// I(name, calories, protein g, carbs g, fat g, sat fat g, sodium mg, fiber g,
//   sugar g, flags, extra keywords)
// flags: v = vegetarian, vg = vegan, gf = no gluten ingredients as ordered

export const I = (name, cal, protein, carbs, fat, sat, sodium, fiber, sugar, flags = '', kw = '') => {
  const f = flags.split(' ');
  return {
    name, cal, protein, carbs, fat, sat, sodium, fiber, sugar, kw,
    v: f.includes('v') || f.includes('vg'),
    vg: f.includes('vg'),
    gf: f.includes('gf'),
  };
};

export const CHAINS = [
  // Summed from the per-ingredient rows in Chipotle's US Nutrition Facts
  // paper menu (3-2025). Burrito = flour tortilla, protein, white rice, black
  // beans, fresh tomato salsa, cheese, romaine; a bowl is the same without the
  // tortilla; the salad is supergreens, chicken, black beans and salsa, no dressing.
  {
    id: 'chipotle', name: 'Chipotle', aliases: ['chipotle'], cuisines: ['mexican'],
    items: [
      I('Chicken Burrito', 980, 58, 118, 29.5, 9.5, 2210, 13, 3),
      I('Steak Burrito', 950, 47, 119, 28.5, 9, 2230, 14, 3),
      I('Carnitas Burrito', 1010, 49, 118, 34.5, 13.5, 2350, 13, 3, '', 'pork'),
      I('Sofritas Burrito', 950, 34, 127, 32.5, 8, 2460, 16, 8, 'v', 'tofu veggie'),
      I('Chicken Burrito Bowl', 660, 50, 68, 20.5, 9, 1610, 10, 3, 'gf'),
      I('Steak Burrito Bowl', 630, 39, 69, 19.5, 8.5, 1630, 11, 3, 'gf'),
      I('Veggie Bowl with Guacamole', 620, 15, 80, 27.5, 4.5, 1630, 17, 6, 'vg gf', 'burrito'),
      I('Chicken Salad Bowl', 350, 41, 29, 8.5, 3, 1085, 10, 4, 'gf'),
      I('Crispy Chicken Tacos (3)', 530, 41, 36, 24, 8, 1050, 5, 1, 'gf'),
      I('Chips & Guacamole', 770, 9, 81, 47, 7, 760, 13, 2, 'vg gf'),
    ],
  },
  // From Taco Bell's official nutrition calculator (linked from
  // tacobell.com/nutrition/info), last updated 09/30/2026.
  {
    id: 'tacobell', name: 'Taco Bell', aliases: ['taco bell'], cuisines: ['mexican'],
    items: [
      I('Crunchy Taco', 170, 7, 13, 9, 4, 310, 3, 0, '', 'beef'),
      I('Soft Taco', 180, 9, 18, 8, 4, 500, 3, 1, '', 'beef'),
      I('Bean Burrito', 360, 13, 54, 10, 4.5, 1080, 8, 3, 'v'),
      I('Burrito Supreme (Beef)', 390, 16, 52, 14, 6, 1160, 8, 4),
      I('Chicken Burrito Supreme', 370, 19, 49, 11, 5, 1170, 6, 4),
      I('Beefy 5-Layer Burrito', 490, 17, 65, 18, 8, 1290, 7, 4, '', 'beef'),
      I('Cheesy Bean and Rice Burrito', 400, 9, 56, 16, 3.5, 950, 6, 3, 'v'),
      I('Crunchwrap Supreme', 530, 15, 74, 20, 7, 1210, 6, 6, '', 'wrap beef'),
      I('Chicken Quesadilla', 490, 26, 44, 23, 11, 1240, 4, 3),
      I('Cantina Chicken Bowl', 580, 26, 55, 29, 8, 1320, 11, 4),
      I('Nachos BellGrande', 730, 17, 81, 38, 6, 1180, 13, 4, '', 'beef'),
      I('Cheesy Gordita Crunch', 480, 20, 44, 26, 10, 830, 6, 4, '', 'taco beef'),
      I('Mexican Pizza', 530, 19, 51, 27, 8, 1000, 8, 3, '', 'beef'),
      I('Chalupa Supreme (Beef)', 350, 12, 32, 20, 5, 570, 4, 3, '', 'taco'),
    ],
  },
  // From the nutrition data behind McDonald's US product pages
  // (mcdonalds.com/us/en-us), read 2026-10-03.
  {
    id: 'mcdonalds', name: "McDonald's", aliases: ['mcdonalds'], cuisines: ['burger', 'breakfast'],
    items: [
      I('Big Mac', 580, 25, 45, 34, 11, 1060, 3, 7, '', 'burger beef'),
      I('Quarter Pounder with Cheese', 520, 30, 42, 26, 12, 1140, 2, 10, '', 'burger cheeseburger beef'),
      I('Double Quarter Pounder with Cheese', 740, 48, 43, 42, 20, 1360, 2, 10, '', 'burger cheeseburger beef'),
      I('McDouble', 390, 22, 32, 20, 9, 920, 2, 6, '', 'burger cheeseburger beef'),
      I('Cheeseburger', 300, 15, 31, 13, 6, 720, 2, 6, '', 'beef'),
      I('Hamburger', 250, 12, 30, 9, 3.5, 510, 1, 5, '', 'beef'),
      I('McChicken', 390, 14, 38, 21, 3.5, 560, 1, 4, '', 'chicken sandwich'),
      I('McCrispy', 470, 26, 46, 20, 5, 1140, 1, 9, '', 'chicken sandwich'),
      I('Chicken McNuggets (10 pc)', 410, 23, 26, 24, 4, 850, 1, 0),
      I('Chicken McNuggets (6 pc)', 250, 14, 15, 15, 2.5, 500, 1, 0),
      I('Filet-O-Fish', 380, 16, 38, 19, 4, 580, 1, 4, '', 'fish sandwich'),
      I('Medium Fries', 320, 5, 43, 15, 2, 260, 4, 0),
      I('Egg McMuffin', 310, 17, 30, 13, 6, 770, 2, 3, '', 'breakfast sandwich'),
      I('Sausage McMuffin with Egg', 480, 20, 30, 31, 12, 830, 2, 2, '', 'breakfast sandwich'),
      I('Sausage Burrito', 310, 13, 25, 17, 7, 800, 1, 2, '', 'breakfast'),
      I('Hash Browns', 140, 2, 18, 8, 1, 310, 2, 0, '', 'breakfast potato'),
      I('Fruit & Maple Oatmeal', 320, 6, 64, 4.5, 1.5, 150, 4, 31, 'v', 'breakfast'),
    ],
  },
  // From the "Nutritional Value" data on Wendy's US ordering site
  // (order.wendys.com), default builds, read 2026-10-03.
  {
    id: 'wendys', name: "Wendy's", aliases: ['wendys'], cuisines: ['burger'],
    items: [
      I("Dave's Single", 560, 31, 37, 34, 14, 1170, 2, 9, '', 'burger cheeseburger beef'),
      I("Dave's Double", 810, 50, 37, 52, 22, 1410, 2, 9, '', 'burger cheeseburger beef'),
      I('Jr. Cheeseburger', 270, 14, 25, 13, 6, 660, 1, 5, '', 'beef'),
      I('Jr. Bacon Cheeseburger', 350, 18, 24, 21, 8, 650, 1, 5, '', 'beef'),
      I('Baconator', 890, 59, 36, 58, 24, 1580, 1, 8, '', 'burger cheeseburger bacon beef'),
      I('Classic Chicken Sandwich', 550, 28, 55, 25, 4, 1630, 3, 7),
      I('Spicy Chicken Sandwich', 560, 28, 55, 26, 4.5, 1500, 3, 7),
      I('Grilled Chicken Ranch Wrap', 420, 28, 41, 16, 5, 1100, 1, 2),
      I('Crispy Chicken Nuggets (10 pc)', 430, 23, 22, 27, 6, 900, 1, 0),
      I('Chili (small)', 280, 19, 24, 12, 4.5, 1050, 3, 6, 'gf', 'soup beef'),
      I('Plain Baked Potato', 270, 7, 61, 0, 0, 40, 7, 3, 'vg gf'),
      I('Apple Pecan Salad', 510, 31, 43, 25, 9, 1160, 5, 33, '', 'chicken'),
      I('Medium Fries', 350, 5, 47, 16, 2.5, 550, 4, 0, 'vg'),
    ],
  },
  // From Burger King's US nutrition explorer (bk.com/nutrition-explorer),
  // as-served builds, read 2026-10-03. The nugget fiber figure is as published
  // there but looks too high.
  {
    id: 'burgerking', name: 'Burger King', aliases: ['burger king'], cuisines: ['burger'],
    items: [
      I('Whopper', 710, 34, 57, 42, 12, 1250, 4, 14, '', 'burger beef'),
      I('Whopper with Cheese', 790, 37, 58, 49, 16, 1660, 4, 15, '', 'burger cheeseburger beef'),
      I('Whopper Jr.', 340, 15, 30, 19, 5, 630, 2, 7, '', 'burger beef'),
      I('Impossible Whopper', 670, 32, 64, 35, 9, 1490, 8, 14, 'v', 'burger veggie plant'),
      I('Cheeseburger', 300, 16, 30, 14, 6, 810, 2, 7, '', 'beef'),
      I('Original Chicken Sandwich', 680, 23, 63, 39, 7, 1380, 3, 7),
      I('Royal Crispy Chicken', 600, 31, 54, 31, 5, 1330, 4, 9, '', 'sandwich'),
      I('Chicken Nuggets (10 pc)', 520, 26, 31, 32, 6, 910, 11, 1),
      I('Chicken Fries (8 pc)', 220, 13, 16, 12, 2.5, 680, 1, 0, '', 'tender'),
      I('Medium Fries', 370, 5, 50, 17, 3, 330, 4, 1, 'vg'),
    ],
  },
  // From Subway's U.S. Nutrition Information PDF, October 2026. "Fresh Fit"
  // rows are multigrain bread and vegetables with no cheese or sauce; the others
  // are the as-menued builds, which include cheese and sauce.
  {
    id: 'subway', name: 'Subway', aliases: ['subway'], cuisines: ['sandwich'],
    items: [
      I('Fresh Fit Veggie Delite (6-inch)', 220, 10, 40, 3, 1, 360, 4, 6, 'vg', 'sub sandwich veggie'),
      I('Fresh Fit Oven-Roasted Turkey (6-inch)', 270, 20, 40, 4, 1, 810, 4, 6, '', 'sub sandwich'),
      I('Fresh Fit Rotisserie-Style Chicken (6-inch)', 310, 24, 40, 6, 2, 750, 4, 6, '', 'sub sandwich'),
      I('Sweet Onion Chicken Teriyaki (6-inch)', 430, 29, 55, 11, 5, 1250, 4, 20, '', 'sub sandwich'),
      I('Grilled Chicken (6-inch)', 510, 31, 43, 24, 8, 830, 3, 5, '', 'sub sandwich'),
      I('Black Forest Ham (6-inch)', 480, 25, 44, 22, 7, 1160, 2, 5, '', 'sub sandwich'),
      I('Subway Club (6-inch)', 500, 31, 43, 23, 8, 1520, 4, 8, '', 'sub sandwich turkey ham roast beef'),
      I('Steak Philly (6-inch)', 510, 28, 43, 25, 9, 1320, 2, 5, '', 'sub sandwich cheese cheesesteak'),
      I('Italian B.M.T. (6-inch)', 590, 26, 44, 35, 12, 1470, 2, 5, '', 'sub sandwich salami pepperoni ham'),
      I('Meatball Marinara (6-inch)', 550, 26, 52, 27, 12, 1330, 4, 7, '', 'sub sandwich'),
      I('Tuna (6-inch)', 560, 27, 42, 32, 9, 920, 2, 4, '', 'sub sandwich'),
    ],
  },
  // From Chick-fil-A's nutrition guide (chick-fil-a.com/nutrition-allergens),
  // read 2026-10-03. The Cool Wrap and Market Salad figures include dressing.
  {
    id: 'chickfila', name: 'Chick-fil-A', aliases: ['chick fil a', 'chickfila'], cuisines: ['chicken'],
    items: [
      I('Chicken Sandwich', 420, 29, 41, 16, 3.5, 1470, 1, 6),
      I('Chicken Deluxe Sandwich', 490, 32, 43, 21, 6, 1710, 1, 7),
      I('Spicy Chicken Sandwich', 450, 28, 44, 18, 4, 1740, 1, 6),
      I('Grilled Chicken Sandwich', 390, 28, 45, 11, 2.5, 765, 3, 11),
      I('Chicken Nuggets (8 ct)', 250, 27, 11, 11, 2.5, 1210, 0, 1),
      I('Grilled Nuggets (8 ct)', 130, 25, 1, 3, 0.5, 440, 0, 1, 'gf', 'chicken'),
      I('Chick-n-Strips (3 ct)', 310, 29, 16, 14, 2.5, 870, 0, 2, '', 'chicken tenders'),
      I('Cool Wrap with Avocado Lime Ranch', 660, 43, 32, 45, 9, 1420, 14, 5, '', 'grilled chicken'),
      I('Market Salad with Grilled Chicken', 550, 28, 42, 31, 6, 1010, 5, 26),
      I('Egg White Grill', 300, 27, 29, 8, 4, 990, 1, 2, '', 'breakfast sandwich chicken'),
      I('Chicken Biscuit', 460, 19, 45, 23, 8, 1510, 2, 6, '', 'breakfast sandwich'),
      I('Waffle Fries (medium)', 420, 5, 45, 24, 4, 240, 5, 1, 'v'),
    ],
  },
  // From KFC's interactive nutrition guide (kfc.com/full-nutrition-guide),
  // last updated 10/02/2026. Tenders are the per-piece row times three.
  {
    id: 'kfc', name: 'KFC', aliases: ['kfc', 'kentucky fried chicken'], cuisines: ['chicken'],
    items: [
      I('Original Recipe Chicken Breast', 390, 39, 11, 21, 4, 1190, 2, 0, '', 'fried'),
      I('Original Recipe Drumstick', 130, 12, 4, 8, 1.5, 430, 1, 0, '', 'fried chicken'),
      I('Kentucky Grilled Chicken Breast', 210, 38, 0, 7, 2, 710, 0, 0),
      I('Original Recipe Tenders (3)', 510, 33, 60, 18, 1.5, 1200, 0, 0, '', 'chicken'),
      I('Classic Chicken Sandwich', 650, 34, 49, 35, 4.5, 1260, 1, 6),
      I('Famous Bowl', 590, 31, 67, 22, 5, 2160, 4, 3, '', 'chicken'),
      I('Chicken Pot Pie', 720, 26, 60, 41, 25, 1750, 7, 5),
      I('Mashed Potatoes with Gravy', 130, 3, 20, 4.5, 1, 520, 1, 0, '', 'potato'),
      I('Secret Recipe Fries', 320, 5, 41, 15, 2, 1100, 3, 0),
      I('Coleslaw', 170, 1, 14, 12, 2, 180, 4, 10, 'v'),
    ],
  },
  // From the Popeyes USA Nutrition Guide, September 2026.
  {
    id: 'popeyes', name: 'Popeyes', aliases: ['popeyes'], cuisines: ['chicken'],
    items: [
      I('Classic Chicken Sandwich', 700, 28, 50, 42, 14, 1440, 2, 8),
      I('Spicy Chicken Sandwich', 700, 28, 50, 42, 14, 1470, 2, 8),
      I('Classic Chicken Tenders (3)', 390, 35, 25, 19, 9, 1700, 1, 0),
      I('Blackened Chicken Tenders (3)', 170, 28, 2, 6, 2, 860, 1, 0),
      I('Classic Chicken Breast', 620, 52, 17, 30, 16, 1780, 2, 1, '', 'fried'),
      I('Classic Chicken Leg', 200, 15, 9, 12, 6, 540, 1, 0, '', 'fried drumstick'),
      I('Red Beans & Rice (regular)', 260, 7, 29, 16, 4, 580, 6, 1),
      I('Cajun Fries (regular)', 270, 3, 31, 15, 7, 620, 3, 0),
      I('Homestyle Mac & Cheese (regular)', 280, 11, 16, 20, 10, 510, 0, 3, '', 'pasta'),
      I('Biscuit', 230, 3, 24, 14, 6, 520, 1, 2),
    ],
  },
  // From pandaexpress.com/nutritioninformation. Entrees are one standard
  // serving (about 4.5-6.5 oz); sides are the full 10-12 oz portion.
  {
    id: 'panda', name: 'Panda Express', aliases: ['panda express'], cuisines: ['chinese'],
    items: [
      I('Orange Chicken', 560, 19, 63, 25, 5, 1000, 1, 24),
      I('Kung Pao Chicken', 270, 20, 16, 14, 3, 1300, 2, 7),
      I('Grilled Teriyaki Chicken', 280, 38, 13, 9, 3, 610, 0, 9),
      I('String Bean Chicken Breast', 210, 15, 15, 10, 2, 600, 3, 7),
      I('Mushroom Chicken', 180, 13, 12, 9, 2, 820, 1, 5),
      I('Honey Sesame Chicken Breast', 420, 16, 44, 20, 5, 540, 2, 19),
      I('Broccoli Beef', 190, 17, 14, 7, 2, 600, 2, 7),
      I('Beijing Beef', 480, 14, 46, 27, 5, 600, 2, 21),
      I('Black Pepper Sirloin Steak', 200, 17, 15, 8, 2, 560, 1, 8, '', 'beef'),
      I('Honey Walnut Shrimp', 340, 13, 28, 20, 3, 790, 1, 6),
      I('Chicken Egg Roll (1)', 200, 6, 20, 10, 2, 340, 2, 2),
      I('Chow Mein (side)', 520, 14, 89, 12, 2, 1040, 5, 11, '', 'noodle'),
      I('Fried Rice (side)', 610, 15, 109, 13, 3, 810, 3, 2),
      I('Super Greens (side)', 180, 8, 17, 9, 2, 660, 8, 8, '', 'veggie'),
      I('White Steamed Rice (side)', 570, 11, 129, 0, 0, 0, 0, 0, 'vg gf'),
    ],
  },
  // Transcribed from the Buffalo Wild Wings Nutrition Guide (10-29-2025 to
  // 01-06-2026). Sauced rows are the plain wings plus that count's sauce row.
  {
    id: 'bww', name: 'Buffalo Wild Wings', aliases: ['buffalo wild wings', 'bww'], cuisines: ['chicken'],
    items: [
      I('Traditional Wings, plain (6)', 430, 53, 0, 24, 8, 160, 0, 0, '', 'chicken bone-in'),
      I('Traditional Wings, Lemon Pepper dry rub (6)', 435, 53, 1, 24, 8, 450, 0, 0, '', 'chicken bone-in'),
      I('Traditional Wings, Medium sauce (6)', 460, 53, 1, 27, 8, 1250, 0, 0, '', 'chicken bone-in buffalo'),
      I('Traditional Wings, Honey BBQ (6)', 500, 53, 17, 24, 8, 570, 0, 14, '', 'chicken bone-in'),
      I('Traditional Wings, Parmesan Garlic (6)', 560, 54, 3, 37, 10.5, 790, 0, 1, '', 'chicken bone-in'),
      I('Traditional Wings, plain (10)', 720, 88, 0, 41, 13, 270, 0, 0, '', 'chicken bone-in'),
      I('Boneless Wings, plain (6)', 360, 29, 20, 19, 7, 1260, 1, 0, '', 'chicken'),
      I('Boneless Wings, Medium sauce (6)', 410, 29, 22, 23, 7.5, 2890, 1, 0, '', 'chicken buffalo'),
      I('Boneless Wings, Honey BBQ (6)', 460, 29, 45, 19, 7, 1880, 1, 21, '', 'chicken'),
      I('Boneless Wings, plain (10)', 610, 48, 34, 31, 12, 2090, 1, 1, '', 'chicken'),
    ],
  },
  // Calculated from the per-piece values in Wingstop's Nutritional Guide
  // (linked from wingstop.com/nutrition), so totals carry its rounding.
  {
    id: 'wingstop', name: 'Wingstop', aliases: ['wingstop', 'wing stop'], cuisines: ['chicken'],
    items: [
      I('Classic Wings, Plain (6)', 540, 60, 0, 30, 9, 180, 0, 0, '', 'chicken bone-in'),
      I('Classic Wings, Original Hot (6)', 540, 60, 0, 30, 9, 1380, 0, 0, '', 'chicken bone-in buffalo'),
      I('Classic Wings, Mango Habanero (6)', 600, 60, 24, 30, 9, 480, 0, 18, '', 'chicken bone-in'),
      I('Classic Wings, Hickory Smoked BBQ (6)', 600, 60, 24, 30, 9, 900, 0, 18, '', 'chicken bone-in'),
      I('Classic Wings, Garlic Parmesan (6)', 720, 60, 6, 48, 12, 450, 0, 0, '', 'chicken bone-in'),
      I('Classic Wings, Lemon Pepper (6)', 720, 60, 0, 48, 12, 1260, 0, 0, '', 'chicken bone-in'),
      I('Boneless Wings, Plain (6)', 480, 24, 36, 27, 6, 1380, 0, 0, '', 'chicken'),
      I('Boneless Wings, Original Hot (6)', 480, 24, 36, 27, 6, 2340, 0, 0, '', 'chicken buffalo'),
      I('Boneless Wings, Lemon Pepper (6)', 660, 24, 36, 42, 9, 1740, 0, 0, '', 'chicken'),
      I('Chicken Tenders, Plain (3)', 420, 30, 30, 21, 3, 1410, 0, 0),
      I('Chicken Sandwich, Plain', 610, 32, 66, 24, 4.5, 1720, 2, 10),
      I('Seasoned Fries (regular)', 500, 8, 69, 21, 3.5, 620, 0, 3),
    ],
  },
  // Summed from the component rows in the Five Guys US Nutrition & Allergen
  // Guide (9-1-2026), plain with no toppings: regular burgers are a bun plus two
  // patties (and two cheese slices), "Little" ones a single patty (one slice).
  // Calories are rounded to the figures on the Five Guys menu pages.
  {
    id: 'fiveguys', name: 'Five Guys', aliases: ['five guys'], cuisines: ['burger'],
    items: [
      I('Hamburger', 840, 39, 35, 42, 19, 410, 1, 6, '', 'beef'),
      I('Cheeseburger', 980, 47, 35, 54, 26, 1010, 1, 6, '', 'beef'),
      I('Bacon Cheeseburger', 1060, 52, 35, 60, 28, 1220, 1, 6, '', 'beef'),
      I('Little Hamburger', 540, 23, 35, 25, 11, 360, 1, 6, '', 'beef'),
      I('Little Cheeseburger', 610, 27, 35, 31, 14.5, 660, 1, 6, '', 'beef'),
      I('Veggie Sandwich', 270, 7, 42, 8, 3, 368, 1, 9, 'v'),
      I('Hot Dog', 500, 17, 34, 33, 14, 1090, 1, 6),
      I('Little Fries', 526, 8, 72, 23, 4, 531, 8, 2, 'vg'),
      I('Regular Fries', 953, 15, 131, 41, 7, 962, 15, 4, 'vg'),
    ],
  },
  // From the product data on starbucks.com/menu, read 2026-10-03. The
  // Frappuccino figure is the default build with whole milk and whipped cream.
  {
    id: 'starbucks', name: 'Starbucks', aliases: ['starbucks'], cuisines: ['cafe', 'breakfast'],
    items: [
      I('Spinach, Feta & Egg White Wrap', 290, 20, 34, 8, 3.5, 840, 3, 5, 'v', 'breakfast'),
      I('Turkey Bacon, Cheddar & Egg White Sandwich', 260, 17, 30, 9, 3.5, 600, 2, 2, '', 'breakfast'),
      I('Bacon, Gouda & Egg Sandwich', 360, 18, 35, 18, 6, 710, 1, 2, '', 'breakfast'),
      I('Sausage, Cheddar & Egg Sandwich', 480, 18, 34, 29, 10, 890, 1, 2, '', 'breakfast'),
      I('Double-Smoked Bacon, Cheddar & Egg Sandwich', 500, 21, 43, 27, 13, 960, 2, 8, '', 'breakfast'),
      I('Bacon & Gruyère Egg Bites', 300, 19, 9, 20, 12, 680, 0, 2, 'gf', 'breakfast'),
      I('Rolled & Steel-Cut Oatmeal', 160, 5, 28, 2.5, 0.5, 125, 4, 0, 'vg', 'breakfast'),
      I('Butter Croissant', 250, 5, 26, 14, 8, 300, 1, 4, 'v', 'pastry'),
      I('Cheese Danish', 290, 7, 33, 14, 9, 400, 1, 11, 'v', 'pastry'),
      I('Blueberry Streusel Muffin', 370, 5, 47, 18, 4, 330, 1, 27, 'v', 'pastry'),
      I('Caffè Latte (grande, 2% milk)', 190, 13, 19, 7, 4.5, 170, 0, 18, 'v gf', 'coffee'),
      I('Caramel Frappuccino (grande)', 380, 4, 55, 16, 10, 230, 0, 54, 'v', 'coffee'),
    ],
  },
];
