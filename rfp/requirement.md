# Requirements — Zomato Clone

Food delivery web app: restaurant discovery, menu, cart, checkout, order tracking aur reviews.
Ye document kya banaya jaana hai, uski requirements aur acceptance criteria define karta hai.

| | |
| --- | --- |
| **Project** | Zomato Clone |
| **Doc version** | 1.2 - FR-9 per-card only; global rail removed |
| **Status** | Implemented (features below shipped ya in-progress) |
| **Stack** | React 19, TypeScript (strict), Vite 8, Tailwind CSS v4, React Router 7, Firebase (Auth, Firestore, Storage, Hosting) |
| **Live demo** | https://zomato-clone-b7f2.web.app |

---

## 1. Objective

Ek working food-delivery experience dena jo end-user se restaurant listing → menu → cart →
checkout → order tracking tak ka poora flow cover kare, aur saare real-world integrations
(Firebase services, payment gateway) ke saath deploy ho sake.

**Non-goals:** native mobile app, partner/driver app, real logistics tracking, multi-vendor payouts.
Ye in scope me nahi hain.

---

## 2. Functional requirements

### FR-1 — Authentication

| ID | Requirement | Status |
| --- | --- | --- |
| FR-1.1 | Email/password signup aur login | Done |
| FR-1.2 | Google OAuth login | Done |
| FR-1.3 | Logout, session persistence | Done |
| FR-1.4 | Do roles: `customer` (default) aur `admin` | Done |
| FR-1.5 | Role self-assign nahi ho sakta — sirf admin set kare | Done |
| FR-1.6 | Protected routes (`/checkout`, `/orders`, `/admin`) login maangein | Done |
| FR-1.7 | Missing Firebase config pe blank screen ke bajaye setup instructions | Done |

### FR-2 — Restaurant discovery

| ID | Requirement | Status |
| --- | --- | --- |
| FR-2.1 | Restaurant listing, rating se sorted | Done |
| FR-2.2 | Search — naam, cuisine ya area | Done |
| FR-2.3 | Cuisine filter dropdown | Done |
| FR-2.4 | Sort: rating / delivery time / price low-to-high | Done |
| FR-2.5 | Filter se kuch na mile to empty state with "clear filters" | Done |
| FR-2.6 | Skeleton loaders, error state with retry | Done |

### FR-3 — Menu

| ID | Requirement | Status |
| --- | --- | --- |
| FR-3.1 | Restaurant page, cuisine, rating, price, delivery time, offer | Done |
| FR-3.2 | Menu items category-wise grouped | Done |
| FR-3.3 | Veg / non-veg marker | Done |
| FR-3.4 | Add to cart with quantity | Done |
| FR-3.5 | Restaurant link slug-based ho (`/restaurant/:slug`) | Done |

### FR-4 — Cart

| ID | Requirement | Status |
| --- | --- | --- |
| FR-4.1 | Cart localStorage me persist, reload pe na ude | Done |
| FR-4.2 | Signed-in user ka cart Firestore se hydrate ho | Done |
| FR-4.3 | Quantity badhao / ghatao, zero pe remove | Done |
| FR-4.4 | Cart empty hone pe empty state | Done |
| FR-4.5 | Ek order ek hi restaurant ka — cross-restaurant add cart replace kare | Done |
| FR-4.6 | Totals — subtotal, delivery fee, taxes, grand total | Done |
| FR-4.7 | Cloud writes debounced + serialised (stale write na ho) | Done |

### FR-5 — Checkout

| ID | Requirement | Status |
| --- | --- | --- |
| FR-5.1 | Required-field validation, per-field errors | Done |
| FR-5.2 | Address capture (label, line1, line2, city, pincode, phone) | Done |
| FR-5.3 | Cash on Delivery | Done |
| FR-5.4 | Razorpay payment (optional — key na ho to COD) | Done |
| FR-5.5 | Payment fail/cancel pe order na bane | Done |
| FR-5.6 | Server timestamp + stored totals | Done |

### FR-6 — Orders

| ID | Requirement | Status |
| --- | --- | --- |
| FR-6.1 | User apne orders history dekh sake | Done |
| FR-6.2 | Order status realtime update ho (`onSnapshot`) | Done |
| FR-6.3 | Visual progress tracker (placed → preparing → out-for-delivery → delivered) | Done |
| FR-6.4 | Payment status (pending / paid / failed) dikhe | Done |
| FR-6.5 | Success banner order place hone pe | Done |

### FR-7 — Reviews & ratings

| ID | Requirement | Status |
| --- | --- | --- |
| FR-7.1 | Logged-in user ek review likh / edit / delete kar sake | Done |
| FR-7.2 | Per user ek hi review (doc ID = userId) | Done |
| FR-7.3 | Restaurant ka aggregate rating + count recalculate ho | Done |
| FR-7.4 | Star picker (1–5) + comment | Done |

### FR-8 — Admin console

| ID | Requirement | Status |
| --- | --- | --- |
| FR-8.1 | Demo data seed (8 restaurants + menu + sales counters) | Done |
| FR-8.2 | Storage image upload with progress + size/type validation | Done (Storage enable karna padta hai) |
| FR-8.3 | Sirf admin access | Done |

### FR-9 — Most sold items leaderboard

*Ye naya feature hai (branch `most-sold-items`).*

Most-sold dishes har restaurant card ke **andar** dikhte hain.

| ID | Requirement | Status |
| --- | --- | --- |
| FR-9.1 | Har restaurant card ke andar uske top **5** most-sold dishes | In progress |
| FR-9.2 | Sirf unhi items ki list jinka sales counter exist kare | In progress |
| FR-9.3 | Dish name, price aur sold count — restaurant card ke andar hi | In progress |
| FR-9.4 | Click se us restaurant ka menu page khule | In progress |
| FR-9.5 | Order place karne pe counter increment ho | In progress |
| FR-9.6 | Counter increment atomic ho (concurrent orders safe) | In progress |
| FR-9.7 | Koi counter na ho to list chhup jaaye — fake data na dikhe | In progress |
| FR-9.8 | Ek hi query, result memory me group — per-card fetch nahi | In progress |

**FR-9 design constraint:** `orders` collection rules me private hai — user sirf apne orders
padh sakta hai. Isliye leaderboard aggregate nahi padh sakta, balki denormalized counters
use karta hai (`itemSales/{restaurantId}__{itemId}`). Detail [§6](#6-most-sold-items--design-note) me.

**Ceiling vs actual data (FR-9.1):** 5 ek **ceiling** hai, guarantee nahi. Seed me har restaurant
ke exactly 2 items `isPopular` hain aur counters bhi unhi 2 pe hain — isliye abhi har card par
maximum **2** rows dikhenge, 5 nahi. 5 tab poora hoga jab real orders se counters badhein.

**Rejected: global homepage rail.** Ek poori horizontal "Most sold" rail (top 10, hero ke niche)
pehle banayi thi. Requirement owner ne use hata diya — wo per-card list ka duplicate tha aur wahi
data dobara fetch karta tha. `MostSoldRail` component aur `fetchMostSoldItems()` dono codebase se
hataye gaye hain.

---

## 3. Non-functional requirements

| ID | Category | Requirement |
| --- | --- | --- |
| NFR-1 | Performance | Route-level code splitting — har page lazy loaded |
| NFR-2 | Performance | Firestore queries `limit()` ke saath — unbounded pull nahi |
| NFR-3 | Quality | TypeScript strict mode, `npm run typecheck` clean |
| NFR-4 | Quality | Lint clean (oxlint) |
| NFR-5 | Quality | Firestore queries sirf `services/` layer me — components direct DB touch nahi karte |
| NFR-6 | UX | Responsive — mobile se desktop tak |
| NFR-7 | UX | Loading / empty / error states har async view pe |
| NFR-8 | Security | Saari access control Firestore + Storage rules me, sirf UI me nahi |
| NFR-9 | Security | Secrets repo me nahi — `.env.local` gitignored |
| NFR-10 | Testing | 22 Playwright e2e tests live app ke against |
| NFR-11 | Deploy | Firebase Hosting SPA rewrite — deep links 404 na hon |
| NFR-12 | Resilience | Payment/counter failure pe primary flow na toote |

---

## 4. Data model

```
restaurants/{restaurantId}
  name, slug, imageUrl, cuisines[], rating, ratingCount,
  priceForTwo, deliveryTimeMinutes, isVegOnly, offer,
  location { area, city }, createdAt

  restaurants/{restaurantId}/menu/{itemId}
    restaurantId, name, description, imageUrl,
    price, isVeg, isPopular, category

  restaurants/{restaurantId}/reviews/{userId}
    userId, userName, rating, comment, createdAt

users/{uid}
  email, displayName, photoURL, role ('customer' | 'admin'), createdAt
  users/{uid}/carts/current      -> lines[], restaurantId
  users/{uid}/addresses/{addressId}

orders/{orderId}
  userId, restaurantId, restaurantName,
  items[] { itemId, name, price, quantity },
  address { label, line1, line2, city, pincode, phone },
  subtotal, deliveryFee, taxes, total,
  status ('placed' | 'preparing' | 'out-for-delivery' | 'delivered' | 'cancelled'),
  paymentMethod, paymentStatus, createdAt

itemSales/{restaurantId}__{itemId}          # FR-9
  restaurantId, restaurantSlug, restaurantName,
  itemId, itemName, imageUrl, price,
  soldCount, updatedAt
```

---

## 5. Security requirements

| ID | Requirement |
| --- | --- |
| SEC-1 | Restaurants + menu: public read, admin-only write |
| SEC-2 | Reviews: public read, author-only write, ek review per user |
| SEC-3 | Orders: user sirf apna create/read kare; update/delete admin-only |
| SEC-4 | Cart + addresses: sirf owner |
| SEC-5 | `role` field user khud change na kar sake |
| SEC-6 | `itemSales`: public read; user sirf counter **increment** kare — decrease/reset nahi; fields restricted |
| SEC-7 | Storage: type + size validation, safe filenames |
| SEC-8 | Rules deploy hone se pehle assume na ki jayein — database production mode me ho |

---

## 6. Most sold items — design note

**Problem.** "Most sold" leaderboard ke liye saare orders aggregate karne padte hain. Lekin SEC-3
ke mutabik `orders` private hai — har user sirf apna order padh sakta hai. Admin hi aggregate
dekh sakta hai, public homepage pe nahi.

**Options considered.**

| Option | Verdict |
| --- | --- |
| Cloud Function aggregation | Sabse secure + scalable. Par Firebase **Blaze (billing) plan** chahiye aur setup kaafi kaam. |
| `itemSales` denormalized counters | **Chosen.** Cloud Functions nahi, billing nahi, rules ke andar increment-only enforce ho jaata hai. |
| Sirf `isPopular` flag | Free, par static — actual order data nahi. |
| Admin-only leaderboard | Rules unchanged, par end-user ko feature dikhega hi nahi. |

**Implementation.** Order place hone par `itemSales` me per-item counter `increment()` hota hai —
atomic, isliye concurrent orders safe. Document ID deterministic hai (`restaurantId__itemId`),
isliye dobara order karne par naya document nahi banta. Display ke liye dish aur restaurant ka
naam/image denormalized hai, to extra fetch nahi lagta.

**Known limitation (accepted).** Koi bhi logged-in user counter 1–20 tak increment kar sakta hai,
matfake counts inflate ho sakte hain. Demo ke liye acceptable hai; production me Cloud Functions
se replace karna chahiye.

**Rollout dependency.** Feature dikhne ke liye `firestore.rules` me naya `itemSales` block
deploy hona chahiye (pehle default deny tha) aur Admin console se seed dobara chalna chahiye.
Deploy hone tak feature code present rahega par UI pe nahi dikhega.

**Data reality (2026-10).** Seed me 16 counters hain, aur ye **sab 16** `isPopular: true`
items pe hain — non-popular items par koi counter nahi. Har restaurant ke exactly 2 popular
items hain, isliye per-restaurant list (FR-9.3) par abhi max 2 rows dikhti hain, chahe ceiling
5 ho. Ye jaan-boojh kar rakha gaya hai: "sab items ko counter dena" se "most sold" ka matlab
hi khatam ho jaata (sab equal, ranking meaningless).

**Failure behaviour.** Fetch fail hone par koi error ya empty state
nahi dikhta — list chup-chaap render nahi hoti (`useAsync` error pakad leta hai, component
`null` return karta hai). Data-driven hone ki wajah se ye theek hai, par production me
permission ya query failure diagnose karna mushkil hoga. Visible empty/error state consider
karna chahiye.

---

## 7. Out of scope

- Native mobile app
- Delivery partner / driver app aur live GPS tracking
- Real payment settlement (Razorpay demo mode me hai)
- Multi-language / i18n (UI copy Hinglish + English mix hai)
- Analytics, recommendation engine, personalization

---

## 8. Future scope

- Admin CRUD for restaurants aur menu items (abhi seed-only)
- Favourites / wishlist
- Search debounce aur listing pagination
- Coupon / promo codes
- Push notifications on order status change
- Most-sold counters ko Cloud Functions se secure karna
- Most-sold fetch failure par visible empty/error state
- `fetchTopSoldByRestaurant` ka scale-out — ab saare counters padhta hai (500 cap)
- Analytics: popular items, peak hours, revenue per restaurant