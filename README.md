# Zomato Clone — React + TypeScript + Firebase

Restaurant listing, menu, cart, checkout, reviews aur realtime order tracking —
Firestore + Storage + Auth + Hosting ke saath.

**Live demo:** https://zomato-clone-b7f2.web.app · **Demo login:** `demo@test.com` / `demo12345`

> Feature list aur architecture [niche](#features) me hai. Naya project setup karne ke liye
> [Getting started](#getting-started) dekho — repo me `.env.local` ya `.firebaserc` nahi hai
> (dono `.gitignore` me hain), dono banane padte hain.

## Stack

| Layer | Choice |
| --- | --- |
| UI | React 19 + TypeScript (strict) |
| Build | Vite 8 |
| Styling | Tailwind CSS v4 |
| Routing | React Router 7 |
| Backend | Firebase — Auth, Firestore, Storage, Hosting |
| Lint | oxlint |

## Structure

```
src/
├── components/
│   ├── ui/            # Reusable primitives (Button, Form, Feedback)
│   ├── layout/        # Header, Footer, providers
│   ├── restaurant/    # RestaurantCard
│   ├── menu/          # MenuItemRow
│   ├── cart/          # CartSummary
│   └── auth/          # RequireAuth / RequireAdmin guards
├── hooks/             # useAuth, useCart, useAsync + unke providers
├── lib/               # Firebase init, storage upload helpers
├── pages/             # Route-level components (lazy loaded)
├── services/          # Firestore data access (single place for queries)
├── types/             # Domain types
└── utils/             # Pure helpers (money, dates, totals)
```

Layering: `pages → components → hooks → services → lib/firebase`.
Pages kabhi seedha Firestore call nahi karte — queries sirf `services/` me hain.

## Getting started

### Prerequisites

- Node.js 20+
- [Firebase CLI](https://firebase.google.com/docs/cli): `npm install -g firebase-tools`
- Apna Firebase project (Firestore + Auth + Storage + Hosting)

### Setup

```bash
git clone https://github.com/binodkumararya893-ai/zomato-clone.git
cd zomato-clone
npm install
```

### 1. Firebase config (`.env.local`)

`.env.local` repo me **nahi** hai (`.gitignore` me hai). Banao:

```bash
cp .env.example .env.local       # Windows PowerShell:
Copy-Item .env.example .env.local
```

Firebase Console → apna project → ⚙ **Project settings** → **Your apps** → Web app (`</>`)
→ **SDK setup and configuration** → config values `.env.local` me copy karo.

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...

# Optional — iske bina app Cash on Delivery use karega
VITE_RAZORPAY_KEY_ID=
```

> Ye Firebase **web** config hai, isme koi secret nahi hota — rules hi asli protection hain.
> Config missing ho to app blank page ki jagah setup instructions dikhata hai.

### 2. Firebase project link (`.firebaserc`)

`.firebaserc` bhi repo me nahi hai (project-specific hota hai):

```bash
cp .firebaserc.example .firebaserc
```

Ya direct apna project select karo:

```bash
firebase login
firebase use --add      # apna project ID choose karo
```

Isse `.firebaserc` ban jayega. Iske bina `firebase deploy` kaam nahi karega.

### 3. Run karo

```bash
npm run dev     # http://localhost:5173
```

## Scripts

| Command | Kaam |
| --- | --- |
| `npm run dev` | Local dev server |
| `npm run build` | Typecheck + production build |
| `npm run preview` | Production build ka local preview |
| `npm run typecheck` | Sirf TS typecheck |
| `npm run lint` | oxlint |
| `npm run deploy` | Build + `firebase deploy` |
| `npm run test` | Playwright e2e tests (headed browser) |
| `npm run test:ui` | Playwright UI mode |
| `npm run test:install` | Playwright browsers install |

## Tests

Playwright suite live deployed app ke against chalti hai (`baseURL` config me set hai).

```bash
npm run test:install    # ek baar — Chromium download
npm run test            # headed (browser khulega)
```

22 tests, 3 files:

| File | Cover |
| --- | --- |
| `tests/public.spec.ts` | Listing, search, menu, SPA deep links, 404 |
| `tests/auth-flow.spec.ts` | Login, cart add/qty/remove, cross-restaurant guard, checkout validation, order place |
| `tests/reviews-payment.spec.ts` | Reviews CRUD, rating aggregate, payment methods |

**Test account** — `TEST_EMAIL` / `TEST_PASSWORD` env vars se override hota hai,
default `demo@test.com` / `demo12345`.

> Har test fresh browser context me login karta hai (Firebase session IndexedDB me
> hota hai jo `storageState` se reliably restore nahi hota). Firebase sign-in
> throttle karta hai, isliye login retry ke saath hai.

Tests real orders/reviews banate hain demo project me.

## Deploy (Firebase Hosting)

Hosting deploy ho chuka hai:

**Live URL:** https://zomato-clone-b7f2.web.app

Aage ke deploys:

```bash
npm run deploy        # build + firebase deploy
```

Rules/indexes alag se:

```bash
firebase deploy --only firestore:rules,firestore:indexes,storage
```

> `firebase.json` me SPA rewrite already hai, isliye deep links (jaise `/restaurant/pizza-hub`) 404 nahi honge.

## Apne project me setup karte waqt

Ye steps ek baar karne padte hain (kisi bhi naye Firebase project ke liye):

**1. Firestore API enable karo**
https://console.developers.google.com/apis/library/firestore.googleapis.com?project=`<PROJECT_ID>`
→ **Enable** → 2-3 min wait. Ya CLI se deploy karte waqt apne aap enable ho jata hai.

**2. Database banao**
https://console.firebase.google.com/project/`<PROJECT_ID>`/firestore
→ **Create database** → Database ID `default`, Production mode, location jaisa pasand ho.

> ⚠️ Production mode hi chuno. Test mode me 30 din baad rules enforce hoti hain
> aur app chup-chaap fail hone lagta hai.
> Location baad me change **nahi** ho sakti — users India me hon to `asia-south1`.

**3. Auth enable karo**
https://console.firebase.google.com/project/`<PROJECT_ID>`/auth/providers
→ **Email/Password** → Enable → **Save**

Google login chahiye to wahi page se Google enable karo, aur
Authentication → **Settings** → **Authorized domains** me apna domain add karo.

**4. Storage enable karo** (image upload ke liye)
https://console.firebase.google.com/project/`<PROJECT_ID>`/storage → **Get started**

**5. Rules deploy karo**

```bash
firebase deploy --only firestore:rules,firestore:indexes,storage
```

**6. Pehla account banao + admin role**

App pe signup karo, phir Firestore console me `users/{uid}.role` ko `"admin"` set karo
(quotes ke saath). Ab header me **Admin** link aa jayega.

**7. Demo data daalo**

Admin console → **Seed demo restaurants** → 8 restaurants + menu items Firestore me likh diye jayenge.

## Project notes

- Database location `nam5` (Iowa) hai default project me — India se thoda latency
  feel hota hai, par data theek hai. Naye project me `asia-south1` behtar rahega.
- Storage is project me enable nahi hai, isliye admin console ka image upload
  section abhi kaam nahi karega.
- Razorpay optional hai — key na ho to checkout COD pe chalta hai.

## Firestore data model

```
restaurants/{restaurantId}
  name, slug, imageUrl, cuisines[], rating, ratingCount,
  priceForTwo, deliveryTimeMinutes, isVegOnly, offer,
  location { area, city }, createdAt

  restaurants/{restaurantId}/menu/{itemId}
    restaurantId, name, description, imageUrl,
    price, isVeg, isPopular, category

users/{uid}
  email, displayName, photoURL, role ('customer' | 'admin'), createdAt
  users/{uid}/carts/current        -> lines[], restaurantId
  users/{uid}/addresses/{addressId}

orders/{orderId}
  userId, restaurantId, restaurantName,
  items[] { itemId, name, price, quantity },
  address { label, line1, line2, city, pincode, phone },
  subtotal, deliveryFee, taxes, total,
  status ('placed' | 'preparing' | 'out-for-delivery' | 'delivered' | 'cancelled'),
  createdAt
```

## Storage

```
restaurants/{restaurantId}/{timestamp}.jpg      # restaurant cover
restaurants/{restaurantId}/menu/{itemId}/{ts}.jpg
users/{uid}/avatar.jpg
```

`src/lib/storage.ts` upload handle karta hai: type/size validation (5MB max),
progress callback aur safe filename (original filename use nahi hota).

## Security

`firestore.rules` + `storage.rules` me:

- Restaurants/menu: public read, sirf admin write
- Orders: user sirf apna order create/read kar sakta hai
- Cart/addresses: sirf owner
- Role field: user khud change nahi kar sakta (admin hi kar sakta hai)

First admin banate hue: ek signup karo, phir Firestore console me
`users/{uid}.role` ko `"admin"` set kar do (quotes ke saath).

## Features

**Included**

- Auth — email/password + Google
- Restaurant listing with search, cuisine filter, sort
- Menu pages with veg/non-veg markers, category grouping
- Cart — localStorage + Firestore sync (debounced, serialised writes)
- Checkout — validation, address capture, COD + Razorpay
- Order history with **realtime** status tracking (`onSnapshot`) + live progress bar
- Reviews & ratings with automatic aggregate recalculation
- Admin console — demo seed, Storage image upload
- Firestore security rules, Storage rules, SPA hosting rewrites
- 22 Playwright e2e tests against the live app

**Possible next steps**

- Admin CRUD for restaurants and menu items (currently seed-only)
- Favourites / wishlist
- Search debounce and pagination on listing
- Coupon / promo codes
- Delivery partner assignment
- Push notifications on order status change