// Curated authentic Indian fast-food imagery with category fallbacks and SVG backup
export const FOOD_IMAGES = {
  // Burgers & Sandwiches
  'Mumbai Vada Pav': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=700&q=80',
  'Crispy Paneer Burger': 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=700&q=80',
  'Aloo Tikki Burger': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=700&q=80',
  'Chicken Tikka Burger': 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=700&q=80',
  'Masala Grilled Sandwich': 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=700&q=80',

  // Pizzas & Breads
  'Tandoori Paneer Pizza': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=700&q=80',
  'Mumbai Masala Pizza': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=700&q=80',
  'Masala Garlic Bread': 'https://images.unsplash.com/photo-1619535860434-ba1d8fa12536?auto=format&fit=crop&w=700&q=80',

  // Main Course
  'Butter Chicken with Naan': 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=700&q=80',
  'Paneer Tikka Rice Bowl': 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=700&q=80',
  'Hyderabadi Chicken Biryani': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=700&q=80',
  'Veg Biryani Bowl': 'https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?auto=format&fit=crop&w=700&q=80',
  'Chole Kulcha Meal': 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=700&q=80',

  // Starters & Appetizers
  'Peri-Peri Fries': 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=700&q=80',
  'Pav Bhaji': 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=700&q=80',
  'Spicy Chicken Kathi Roll': 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=700&q=80',
  'Crispy Corn Bhel': 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=700&q=80',

  // Desserts & Beverages
  'Mango Lassi': 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=700&q=80',
  'Masala Chai': 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=700&q=80',
  'Gulab Jamun (2 pcs)': 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=700&q=80',
  'Molten Chocolate Lava Cake': 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=700&q=80',
  'Cold Coffee with Ice Cream': 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=700&q=80',
};

// Generic category fallbacks
export const CATEGORY_FALLBACKS = {
  'Pizzas & Breads': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=700&q=80',
  'Burgers & Sandwiches': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=700&q=80',
  'Main Course': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=700&q=80',
  'Starters & Appetizers': 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=700&q=80',
  'Desserts & Beverages': 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=700&q=80',
};

export const DEFAULT_FOOD_IMAGE = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=700&q=80';

export const getFoodImage = (item) => {
  if (!item) return DEFAULT_FOOD_IMAGE;
  if (item.imageUrl) return item.imageUrl;
  if (FOOD_IMAGES[item.name]) return FOOD_IMAGES[item.name];

  // Try substring matching
  const nameLower = (item.name || '').toLowerCase();
  for (const [key, url] of Object.entries(FOOD_IMAGES)) {
    if (nameLower.includes(key.toLowerCase()) || key.toLowerCase().includes(nameLower)) {
      return url;
    }
  }

  // Category fallback
  if (item.categoryName && CATEGORY_FALLBACKS[item.categoryName]) {
    return CATEGORY_FALLBACKS[item.categoryName];
  }

  return DEFAULT_FOOD_IMAGE;
};
