/**
 * Demo seed data — sirf admin use kar sakta hai (rules enforce karti hain).
 * Restaurant + menu documents Firestore me likhta hai.
 */
import { doc, serverTimestamp, writeBatch } from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface SeedMenuItem {
  id: string
  name: string
  description: string
  price: number
  isVeg: boolean
  isPopular?: boolean
  category: string
}

interface SeedRestaurant {
  id: string
  name: string
  imageUrl: string
  cuisines: string[]
  rating: number
  ratingCount: number
  priceForTwo: number
  deliveryTimeMinutes: number
  area: string
  city: string
  offer: string
  menu: SeedMenuItem[]
}

/** Images Unsplash se aati hain — bina apne Storage ke demo ke liye. */
const IMG = {
  pizza: 'https://images.unsplash.com/photo-1579751626657-72bc17010498?w=800',
  burger: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800',
  biryani: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800',
  chinese: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800',
  dosa: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=800',
  dessert: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800',
  curry: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800',
  seafood: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=800',
}

export const SEED_RESTAURANTS: SeedRestaurant[] = [
  {
    id: 'pizza-hub',
    name: 'Pizza Hub',
    imageUrl: IMG.pizza,
    cuisines: ['Pizza'],
    rating: 4.6,
    ratingCount: 4200,
    priceForTwo: 600,
    deliveryTimeMinutes: 32,
    area: 'Koramangala',
    city: 'Bengaluru',
    offer: '40% off on your first order',
    menu: [
      { id: 'margherita', name: 'Margherita Pizza', description: 'Classic tomato, mozzarella, basil', price: 299, isVeg: true, isPopular: true, category: 'Popular' },
      { id: 'farmhouse', name: 'Farmhouse Pizza', description: 'Bell pepper, sweet corn, olives', price: 379, isVeg: true, category: 'Pizza' },
      { id: 'pepperoni', name: 'Pepperoni Pizza', description: 'Loaded with double pepperoni', price: 449, isVeg: false, isPopular: true, category: 'Pizza' },
      { id: 'garlic-bread', name: 'Garlic Bread', description: 'Cheese loaded, herb butter', price: 149, isVeg: true, category: 'Sides' },
    ],
  },
  {
    id: 'burger-junction',
    name: 'Burger Junction',
    imageUrl: IMG.burger,
    cuisines: ['Burger', 'North Indian'],
    rating: 4.3,
    ratingCount: 2800,
    priceForTwo: 450,
    deliveryTimeMinutes: 28,
    area: 'Indiranagar',
    city: 'Bengaluru',
    offer: 'Flat ₹100 off above ₹499',
    menu: [
      { id: 'double-cheese-burger', name: 'Double Cheese Burger', description: 'Two patties, double cheddar', price: 249, isVeg: true, isPopular: true, category: 'Popular' },
      { id: 'chicken-zinger', name: 'Chicken Zinger', description: 'Crispy fried, spicy mayo', price: 279, isVeg: false, isPopular: true, category: 'Burgers' },
      { id: 'veg-pattie', name: 'Veg Patty Burger', description: 'Grilled patty, fresh veggies', price: 199, isVeg: true, category: 'Burgers' },
      { id: 'fries', name: 'Peri Peri Fries', description: 'Crispy fries with peri peri seasoning', price: 129, isVeg: true, category: 'Sides' },
      { id: 'milkshake', name: 'Oreo Milkshake', description: 'Thick, creamy, chocolate', price: 139, isVeg: true, category: 'Drinks' },
    ],
  },
  {
    id: 'biryani-bazaar',
    name: 'Biryani Bazaar',
    imageUrl: IMG.biryani,
    cuisines: ['Biryani', 'North Indian'],
    rating: 4.5,
    ratingCount: 6100,
    priceForTwo: 550,
    deliveryTimeMinutes: 40,
    area: 'Jayanagar',
    city: 'Bengaluru',
    offer: 'Free delivery this week',
    menu: [
      { id: 'hyderabadi-chicken', name: 'Hyderabadi Chicken Biryani', description: 'Dum cooked, long grain basmati', price: 349, isVeg: false, isPopular: true, category: 'Biryani' },
      { id: 'veg-dum-biryani', name: 'Veg Dum Biryani', description: 'Seasonal veggies, saffron rice', price: 279, isVeg: true, category: 'Biryani' },
      { id: 'kacchi-gosht', name: 'Kacchi Gosht Biryani', description: 'Raw marinated mutton, slow cooked', price: 499, isVeg: false, isPopular: true, category: 'Biryani' },
      { id: 'mirchi-ka-salad', name: 'Mirchi Ka Salad', description: 'Refreshing onion and lemon', price: 49, isVeg: true, category: 'Sides' },
    ],
  },
  {
    id: 'wok-chinese',
    name: 'Wok Chinese',
    imageUrl: IMG.chinese,
    cuisines: ['Chinese'],
    rating: 4.2,
    ratingCount: 1900,
    priceForTwo: 500,
    deliveryTimeMinutes: 35,
    area: 'HSR Layout',
    city: 'Bengaluru',
    offer: '20% off on Chinese dishes',
    menu: [
      { id: 'hakka-noodles', name: 'Hakka Noodles', description: 'Wok tossed with vegetables', price: 219, isVeg: true, isPopular: true, category: 'Noodles' },
      { id: 'chilli-chicken', name: 'Chilli Chicken', description: 'Indo-Chinese, fiery gravy', price: 289, isVeg: false, isPopular: true, category: 'Starters' },
      { id: 'manchurian', name: 'Veg Manchurian', description: 'Crispy balls in garlic sauce', price: 239, isVeg: true, category: 'Starters' },
      { id: 'fried-rice', name: 'Schezwan Fried Rice', description: 'Spicy rice with spring onion', price: 229, isVeg: true, category: 'Rice' },
    ],
  },
  {
    id: 'tiffin-house',
    name: 'Tiffin House',
    imageUrl: IMG.dosa,
    cuisines: ['South Indian', 'Dosa'],
    rating: 4.4,
    ratingCount: 3300,
    priceForTwo: 250,
    deliveryTimeMinutes: 25,
    area: 'Malleshwaram',
    city: 'Bengaluru',
    offer: 'Breakfast combo @ ₹149',
    menu: [
      { id: 'masala-dosa', name: 'Masala Dosa', description: 'Crisp dosa, potato palya, chutneys', price: 129, isVeg: true, isPopular: true, category: 'Dosa' },
      { id: 'mysore-masala-dosa', name: 'Mysore Masala Dosa', description: 'Spicy red masala filling', price: 159, isVeg: true, isPopular: true, category: 'Dosa' },
      { id: 'idli-vada', name: 'Idli Vada Combo', description: 'Two idlis, one vada, sambar', price: 119, isVeg: true, category: 'South Indian' },
      { id: 'filter-coffee', name: 'Filter Coffee', description: 'Strong decoction with milk', price: 49, isVeg: true, category: 'Beverages' },
    ],
  },
  {
    id: 'sweet-saffron',
    name: 'Sweet Saffron',
    imageUrl: IMG.dessert,
    cuisines: ['Desserts'],
    rating: 4.7,
    ratingCount: 1500,
    priceForTwo: 400,
    deliveryTimeMinutes: 30,
    area: 'Brigade Road',
    city: 'Bengaluru',
    offer: 'Buy 1 get 1 on birthdays',
    menu: [
      { id: 'gulab-jamun', name: 'Gulab Jamun (2 pcs)', description: 'Soft, soaked in syrup', price: 129, isVeg: true, isPopular: true, category: 'Indian Sweets' },
      { id: 'chocolate-brownie', name: 'Chocolate Brownie', description: 'Fudgy, served warm', price: 199, isVeg: true, isPopular: true, category: 'Desserts' },
      { id: 'red-velvet', name: 'Red Velvet Cake', description: 'Cream cheese frosting', price: 349, isVeg: true, category: 'Desserts' },
      { id: 'lassi', name: 'Samosa Lassi', description: 'Sweet lassi with mini samosa', price: 99, isVeg: true, category: 'Beverages' },
    ],
  },
  {
    id: 'spice-route',
    name: 'Spice Route',
    imageUrl: IMG.curry,
    cuisines: ['North Indian', 'Curry'],
    rating: 4.3,
    ratingCount: 2400,
    priceForTwo: 650,
    deliveryTimeMinutes: 38,
    area: 'BTM Layout',
    city: 'Bengaluru',
    offer: '₹150 off on orders above ₹799',
    menu: [
      { id: 'butter-chicken', name: 'Butter Chicken', description: 'Tomato gravy, cream, butter', price: 379, isVeg: false, isPopular: true, category: 'Curries' },
      { id: 'paneer-butter-masala', name: 'Paneer Butter Masala', description: 'Soft paneer in rich gravy', price: 319, isVeg: true, isPopular: true, category: 'Curries' },
      { id: 'dal-tadka', name: 'Dal Tadka', description: 'Yellow lentils, tadka tempered', price: 199, isVeg: true, category: 'Curries' },
      { id: 'butter-naan', name: 'Butter Naan', description: 'Tandoor baked, brushed with butter', price: 79, isVeg: true, category: 'Breads' },
    ],
  },
  {
    id: 'coastal-catch',
    name: 'Coastal Catch',
    imageUrl: IMG.seafood,
    cuisines: ['Seafood'],
    rating: 4.5,
    ratingCount: 980,
    priceForTwo: 900,
    deliveryTimeMinutes: 45,
    area: 'Whitefield',
    city: 'Bengaluru',
    offer: 'Free dessert above ₹999',
    menu: [
      { id: 'butter-prawns', name: 'Butter Prawns', description: 'Grilled prawns, garlic butter', price: 549, isVeg: false, isPopular: true, category: 'Starters' },
      { id: 'fish-curry', name: 'Bengaluru Fish Curry', description: 'Coconut base, kokum, curry leaf', price: 429, isVeg: false, isPopular: true, category: 'Curries' },
      { id: 'surmai-fry', name: 'Surmai Fry', description: 'Crisp fried kingfish', price: 489, isVeg: false, category: 'Starters' },
      { id: 'veg-steam', name: 'Steamed Veg Platter', description: 'Seasonal vegetables', price: 299, isVeg: true, category: 'Starters' },
    ],
  },
]

/**
 * Har cuisine ke liye multiple dish images — taaki menu me saari dishes
 * ek jaisi na lagein. Index se rotate karte hain.
 */
const DISH_POOLS = {
  pizza: [
    'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
    'https://images.unsplash.com/photo-1579751626657-72bc17010498?w=400',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
    'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=400',
  ],
  burger: [
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
    'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400',
    'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400',
    'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400',
  ],
  biryani: [
    'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400',
    'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=400',
    'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400',
    'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400',
  ],
  chinese: [
    'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400',
    'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=400',
    'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400',
    'https://images.unsplash.com/photo-1541014741259-de529411b96a?w=400',
  ],
  southIndian: [
    'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=400',
    'https://images.unsplash.com/photo-1630383249896-424e482df921?w=400',
    'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400',
    'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400',
  ],
  desserts: [
    'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400',
    'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400',
    'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400',
    'https://images.unsplash.com/photo-1587317678481-72a376697a81?w=400',
  ],
  seafood: [
    'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400',
    'https://images.unsplash.com/photo-1626776876729-bab4369a5a5a?w=400',
    'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=400',
    'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400',
  ],
  default: [
    'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400',
    'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400',
    'https://images.unsplash.com/photo-1547592180-85f173990554?w=400',
    'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400',
  ],
} as const

type DishPoolKey = keyof typeof DISH_POOLS

function dishPoolKey(cuisines: string[]): DishPoolKey {
  if (cuisines.includes('Seafood')) return 'seafood'
  if (cuisines.includes('Desserts')) return 'desserts'
  if (cuisines.includes('South Indian')) return 'southIndian'
  if (cuisines.includes('Chinese')) return 'chinese'
  if (cuisines.includes('Biryani')) return 'biryani'
  if (cuisines.includes('Burger')) return 'burger'
  if (cuisines.includes('Pizza')) return 'pizza'
  return 'default'
}

/** Pool se cyclic image — har dish ko alag image milti hai. */
function dishImage(cuisines: string[], index: number): string {
  const pool: readonly string[] = DISH_POOLS[dishPoolKey(cuisines)]
  return pool[index % pool.length] ?? pool[0] ?? ''
}

/** Demo restaurants + unke menu items Firestore me likhta hai (batched). */
export async function seedDemoData(): Promise<number> {
  let batch = writeBatch(db)
  let pending = 0

  const commit = async () => {
    await batch.commit()
    batch = writeBatch(db)
    pending = 0
  }

  for (const restaurant of SEED_RESTAURANTS) {
    batch.set(doc(db, 'restaurants', restaurant.id), {
      name: restaurant.name,
      slug: restaurant.id,
      imageUrl: restaurant.imageUrl,
      cuisines: restaurant.cuisines,
      rating: restaurant.rating,
      ratingCount: restaurant.ratingCount,
      priceForTwo: restaurant.priceForTwo,
      deliveryTimeMinutes: restaurant.deliveryTimeMinutes,
      location: { area: restaurant.area, city: restaurant.city },
      isVegOnly: false,
      offer: restaurant.offer,
      createdAt: serverTimestamp(),
    })
    pending += 1

    for (const [index, item] of restaurant.menu.entries()) {
      batch.set(doc(db, 'restaurants', restaurant.id, 'menu', item.id), {
        restaurantId: restaurant.id,
        name: item.name,
        description: item.description,
        imageUrl: dishImage(restaurant.cuisines, index),
        price: item.price,
        isVeg: item.isVeg,
        isPopular: Boolean(item.isPopular),
        category: item.category,
      })
      pending += 1
    }

    // Firestore batch limit 500 writes
    if (pending >= 400) await commit()
  }

  if (pending > 0) await commit()
  return SEED_RESTAURANTS.length
}