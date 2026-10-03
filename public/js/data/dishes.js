// Estimates for a typical restaurant serving of common dishes, used for places
// that are not in the chain table. These are ballpark figures: the same dish
// can vary by hundreds of calories between kitchens.
//
// D(cuisines, name, calories, protein g, carbs g, fat g, sat fat g, sodium mg,
//   fiber g, sugar g, flags, extra keywords)

import { I } from './chains.js';

const D = (cuisines, ...rest) => ({ ...I(...rest), cuisines: cuisines.split(' ') });

export const DISHES = [
  // Mexican
  D('mexican', 'Chicken Burrito', 950, 50, 105, 32, 11, 2000, 12, 5),
  D('mexican', 'Steak Burrito', 980, 48, 105, 36, 13, 2050, 12, 5, '', 'beef carne asada'),
  D('mexican', 'Bean & Cheese Burrito', 780, 28, 105, 26, 11, 1700, 16, 4, 'v', 'veggie'),
  D('mexican', 'Chicken Burrito Bowl', 680, 45, 70, 22, 8, 1500, 11, 5, 'gf'),
  D('mexican', 'Chicken Tacos (3)', 510, 33, 45, 21, 7, 1100, 6, 4),
  D('mexican', 'Carne Asada Tacos (3)', 560, 32, 44, 27, 9, 1150, 6, 3, '', 'steak beef'),
  D('mexican seafood', 'Fish Tacos (3)', 600, 28, 55, 28, 6, 1100, 6, 5),
  D('mexican', 'Chicken Quesadilla', 900, 48, 62, 50, 24, 1900, 4, 4),
  D('mexican', 'Cheese Quesadilla', 760, 30, 60, 44, 24, 1500, 4, 3, 'v'),
  D('mexican', 'Chicken Fajitas', 800, 50, 70, 32, 10, 2100, 10, 10),
  D('mexican', 'Chicken Enchiladas (3)', 750, 40, 60, 38, 16, 1900, 8, 8),
  D('mexican', 'Nachos with Beef', 1100, 40, 95, 62, 22, 2000, 14, 6),
  D('mexican', 'Taco Salad with Chicken', 780, 40, 60, 42, 14, 1500, 12, 8),
  D('mexican breakfast', 'Breakfast Burrito', 750, 32, 60, 40, 15, 1600, 5, 4, '', 'egg'),

  // Burgers and American
  D('burger american', 'Hamburger', 550, 28, 42, 28, 10, 900, 2, 8, '', 'beef'),
  D('burger american', 'Cheeseburger', 700, 36, 44, 40, 16, 1250, 2, 9, '', 'beef'),
  D('burger american', 'Bacon Cheeseburger', 880, 45, 45, 56, 22, 1600, 2, 9, '', 'beef'),
  D('burger american', 'Veggie Burger', 480, 20, 55, 20, 5, 1000, 7, 9, 'v', 'plant'),
  D('burger american', 'Turkey Burger', 560, 34, 42, 28, 8, 1000, 3, 8),
  D('burger american chicken', 'French Fries', 400, 5, 52, 19, 3, 400, 5, 0, 'vg'),
  D('american bbq', 'Mac and Cheese', 700, 26, 70, 36, 20, 1500, 3, 8, 'v', 'pasta'),
  D('american', 'Chili (bowl)', 400, 28, 34, 16, 6, 1200, 10, 8, '', 'soup beef'),

  // Chicken
  D('chicken burger american sandwich', 'Grilled Chicken Sandwich', 480, 36, 45, 16, 4, 1100, 3, 8),
  D('chicken burger american', 'Fried Chicken Sandwich', 650, 30, 55, 34, 7, 1500, 3, 8, '', 'crispy'),
  D('chicken american burger', 'Chicken Tenders (4)', 520, 34, 32, 28, 5, 1300, 2, 1),
  D('chicken american pizza bbq', 'Chicken Wings (8)', 720, 56, 6, 52, 14, 1700, 1, 2),
  D('chicken american', 'Fried Chicken (2 pieces)', 600, 44, 20, 38, 9, 1400, 1, 0),

  // Salads
  D('salad american sandwich cafe', 'Grilled Chicken Salad', 420, 38, 18, 22, 6, 900, 6, 8, 'gf'),
  D('salad american sandwich cafe italian pizza', 'Chicken Caesar Salad', 560, 38, 20, 36, 9, 1200, 4, 4),
  D('salad american', 'Cobb Salad', 680, 42, 16, 50, 14, 1400, 6, 6, 'gf', 'chicken'),
  D('salad american sandwich cafe italian pizza burger', 'Garden Salad', 180, 5, 18, 10, 1.5, 350, 5, 8, 'vg gf', 'veggie'),
  D('salad mediterranean pizza', 'Greek Salad', 380, 10, 18, 30, 9, 1100, 5, 9, 'v gf'),

  // Sandwiches and wraps
  D('sandwich cafe american', 'Turkey Sandwich', 520, 32, 50, 20, 5, 1500, 4, 7),
  D('sandwich american', 'Club Sandwich', 780, 42, 55, 42, 11, 1900, 4, 8, '', 'turkey bacon'),
  D('sandwich cafe american', 'BLT Sandwich', 550, 20, 42, 34, 9, 1100, 3, 6, '', 'bacon'),
  D('sandwich cafe', 'Tuna Sandwich', 600, 28, 48, 32, 5, 1100, 4, 6),
  D('sandwich cafe american', 'Grilled Cheese Sandwich', 560, 20, 46, 32, 17, 1100, 2, 6, 'v'),
  D('sandwich pizza italian', 'Italian Sub', 800, 36, 60, 45, 15, 2300, 4, 8),
  D('sandwich cafe american salad', 'Chicken Wrap', 600, 36, 52, 26, 7, 1400, 4, 5),
  D('sandwich cafe salad', 'Veggie Wrap', 480, 14, 60, 20, 5, 1000, 8, 7, 'v'),
  D('sandwich cafe american', 'Chicken Noodle Soup', 220, 16, 24, 6, 1.5, 1500, 2, 3),
  D('sandwich cafe american', 'Tomato Soup', 280, 6, 30, 16, 9, 1100, 4, 16, 'v'),

  // Pizza and Italian
  D('pizza italian', 'Cheese Pizza (2 slices)', 570, 24, 70, 21, 9, 1200, 4, 7, 'v'),
  D('pizza italian', 'Pepperoni Pizza (2 slices)', 640, 27, 70, 27, 11, 1500, 4, 7),
  D('pizza italian', 'Veggie Pizza (2 slices)', 540, 23, 72, 18, 8, 1150, 6, 8, 'v'),
  D('pizza italian', 'Meat Lovers Pizza (2 slices)', 760, 34, 70, 38, 15, 1900, 4, 7, '', 'sausage'),
  D('pizza italian', 'Margherita Pizza (personal)', 800, 34, 100, 28, 13, 1600, 5, 8, 'v'),
  D('italian', 'Spaghetti with Meatballs', 950, 42, 105, 38, 14, 1900, 9, 16, '', 'pasta'),
  D('italian', 'Spaghetti Marinara', 650, 20, 110, 14, 2.5, 1100, 9, 16, 'vg', 'pasta'),
  D('italian', 'Fettuccine Alfredo', 1100, 28, 100, 65, 38, 1300, 5, 6, 'v', 'pasta'),
  D('italian', 'Chicken Parmesan', 1050, 60, 80, 52, 18, 2200, 7, 14, '', 'pasta'),
  D('italian', 'Lasagna', 850, 45, 60, 46, 22, 1900, 5, 12, '', 'pasta beef'),
  D('italian cafe', 'Minestrone Soup', 200, 8, 32, 5, 1, 1000, 7, 7, 'v', 'veggie'),

  // Chinese
  D('chinese', 'Orange Chicken with Rice', 950, 36, 130, 30, 6, 1600, 3, 35),
  D('chinese', "General Tso's Chicken with Rice", 1000, 38, 125, 36, 7, 2000, 3, 32),
  D('chinese', 'Kung Pao Chicken with Rice', 800, 40, 85, 32, 6, 1900, 5, 12),
  D('chinese', 'Beef and Broccoli with Rice', 700, 38, 80, 24, 6, 1800, 5, 10),
  D('chinese', 'Chicken and Broccoli with Rice', 600, 42, 75, 14, 2.5, 1600, 5, 8),
  D('chinese', 'Chicken Fried Rice', 850, 34, 110, 28, 5, 1700, 4, 5),
  D('chinese', 'Vegetable Fried Rice', 700, 16, 115, 20, 3.5, 1400, 5, 5, 'v'),
  D('chinese', 'Chicken Lo Mein', 900, 40, 110, 32, 5, 2300, 6, 12, '', 'noodle'),
  D('chinese', 'Tofu and Vegetable Stir-Fry with Rice', 550, 24, 70, 20, 3, 1400, 8, 10, 'vg'),
  D('chinese', 'Egg Rolls (2)', 400, 10, 48, 20, 4, 800, 4, 6),
  D('chinese', 'Hot and Sour Soup', 160, 9, 16, 6, 1.5, 1400, 2, 3),

  // Japanese and poke
  D('japanese', 'California Roll (8 pieces)', 260, 9, 38, 7, 1, 550, 3, 6, '', 'sushi'),
  D('japanese', 'Spicy Tuna Roll (8 pieces)', 300, 20, 30, 11, 2, 650, 2, 4, '', 'sushi'),
  D('japanese', 'Shrimp Tempura Roll (8 pieces)', 510, 20, 64, 21, 3.5, 900, 3, 10, '', 'sushi'),
  D('japanese', 'Salmon Sashimi (6 pieces)', 240, 34, 0, 11, 2.5, 90, 0, 0, 'gf', 'sushi fish'),
  D('japanese', 'Chicken Teriyaki with Rice', 750, 48, 95, 16, 4, 1900, 3, 22, '', 'bowl'),
  D('japanese', 'Tonkotsu Ramen', 900, 40, 85, 42, 15, 2500, 4, 5, '', 'noodle soup pork'),
  D('japanese', 'Miso Soup', 60, 5, 6, 2, 0.5, 800, 1, 1),
  D('japanese', 'Edamame', 190, 17, 14, 8, 1, 300, 8, 3, 'vg gf'),
  D('poke japanese', 'Tuna Poke Bowl', 650, 38, 80, 18, 3, 1300, 6, 10, '', 'fish'),

  // Thai, Vietnamese, Korean
  D('thai', 'Pad Thai with Chicken', 950, 42, 120, 32, 6, 2000, 5, 25, '', 'noodle'),
  D('thai', 'Green Curry with Chicken and Rice', 850, 38, 80, 42, 26, 1700, 5, 10, 'gf'),
  D('thai', 'Tom Yum Soup', 180, 16, 12, 7, 2, 1500, 2, 4, '', 'shrimp'),
  D('thai vietnamese', 'Fresh Spring Rolls (2)', 200, 10, 30, 4, 1, 500, 2, 5, '', 'shrimp'),
  D('vietnamese', 'Beef Pho', 650, 38, 85, 14, 5, 1800, 3, 5, '', 'noodle soup'),
  D('vietnamese', 'Banh Mi', 600, 28, 65, 24, 6, 1400, 4, 8, '', 'sandwich pork'),
  D('korean', 'Bibimbap', 750, 32, 100, 22, 5, 1500, 7, 12, '', 'bowl rice beef'),
  D('korean', 'Bulgogi with Rice', 800, 42, 95, 26, 8, 1700, 3, 22, '', 'beef'),

  // Indian
  D('indian', 'Chicken Tikka Masala with Rice', 950, 48, 95, 40, 16, 1700, 6, 10, 'gf', 'curry'),
  D('indian', 'Butter Chicken with Rice', 1000, 46, 95, 46, 22, 1600, 5, 10, 'gf', 'curry'),
  D('indian', 'Tandoori Chicken', 450, 55, 8, 20, 6, 1100, 2, 4, 'gf'),
  D('indian', 'Chana Masala with Rice', 700, 20, 115, 18, 3, 1400, 16, 10, 'vg gf', 'curry chickpea'),
  D('indian', 'Saag Paneer with Rice', 800, 28, 85, 40, 20, 1400, 8, 8, 'v gf', 'curry spinach'),
  D('indian', 'Dal with Rice', 600, 22, 100, 12, 4, 1200, 16, 6, 'v gf', 'lentil'),
  D('indian', 'Naan', 320, 9, 55, 7, 2, 550, 2, 4, 'v', 'bread'),
  D('indian', 'Samosas (2)', 500, 8, 60, 26, 6, 800, 5, 4, 'v'),

  // Mediterranean
  D('mediterranean', 'Chicken Shawarma Wrap', 650, 42, 55, 28, 6, 1500, 5, 5),
  D('mediterranean', 'Chicken Kebab Plate', 750, 52, 70, 26, 6, 1400, 6, 6, '', 'rice'),
  D('mediterranean', 'Gyro', 720, 32, 55, 40, 15, 1500, 4, 6, '', 'wrap sandwich lamb'),
  D('mediterranean', 'Falafel Wrap', 600, 18, 75, 26, 4, 1300, 12, 6, 'vg'),
  D('mediterranean', 'Hummus with Pita', 450, 14, 55, 20, 3, 800, 9, 2, 'vg'),

  // BBQ, seafood, steak
  D('bbq american', 'Pulled Pork Sandwich', 650, 36, 60, 28, 9, 1500, 3, 22),
  D('bbq american', 'BBQ Ribs (half rack)', 900, 60, 25, 62, 23, 1500, 1, 20, '', 'pork'),
  D('bbq', 'Brisket Plate', 800, 55, 30, 50, 19, 1600, 3, 18, '', 'beef'),
  D('seafood american', 'Fish and Chips', 950, 38, 90, 50, 9, 1300, 7, 3, '', 'fries'),
  D('seafood american steak', 'Grilled Salmon with Vegetables', 550, 42, 20, 32, 7, 700, 5, 6, 'gf', 'fish'),
  D('seafood american', 'Fish Sandwich', 550, 22, 50, 28, 5, 1000, 2, 6),
  D('seafood', 'Clam Chowder (bowl)', 400, 14, 30, 24, 13, 1200, 2, 4, '', 'soup'),
  D('steak american', 'Sirloin Steak (8 oz) with Vegetables', 520, 54, 15, 26, 10, 900, 5, 5, 'gf', 'beef'),
  D('steak', 'Ribeye (12 oz) with Baked Potato', 1100, 70, 60, 65, 28, 1100, 6, 4, 'gf', 'steak beef'),

  // Breakfast, cafe, dessert
  D('breakfast cafe american sandwich', 'Bacon, Egg & Cheese Sandwich', 480, 22, 36, 27, 11, 1100, 2, 4, '', 'breakfast'),
  D('breakfast american', 'Pancakes (3) with Syrup', 700, 12, 125, 16, 6, 1300, 3, 50, 'v'),
  D('breakfast american cafe', 'Veggie Omelette', 420, 26, 8, 32, 13, 800, 2, 4, 'v gf', 'egg'),
  D('breakfast cafe', 'Avocado Toast', 380, 10, 38, 22, 3.5, 500, 9, 4, 'vg'),
  D('breakfast cafe', 'Oatmeal with Fruit', 300, 8, 58, 5, 1, 150, 7, 20, 'vg'),
  D('breakfast cafe', 'Bagel with Cream Cheese', 430, 13, 60, 15, 8, 650, 3, 8, 'v'),
  D('breakfast cafe juice', 'Yogurt Parfait', 300, 12, 50, 6, 3, 120, 3, 32, 'v'),
  D('cafe dessert', 'Blueberry Muffin', 450, 6, 65, 19, 4, 400, 2, 36, 'v', 'pastry'),
  D('cafe dessert', 'Glazed Donut', 260, 3, 31, 14, 6, 330, 1, 12, 'v'),
  D('cafe', 'Latte (16 oz)', 190, 13, 19, 7, 4.5, 170, 0, 17, 'v gf', 'coffee'),
  D('juice cafe', 'Fruit Smoothie (16 oz)', 280, 4, 65, 1, 0, 40, 5, 52, 'vg gf'),
  D('dessert', 'Ice Cream (2 scoops)', 400, 7, 44, 22, 14, 130, 1, 40, 'v gf'),
];
