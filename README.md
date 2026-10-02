# Zomato Clone — React + TypeScript + Firebase

Restaurant listing, menu, cart aur checkout — Firestore + Storage + Auth ke saath.
Firebase Hosting par deploy-ready hai.

**Project ID:** `zomato-clone-b7f2`

> Pehle `flipmart-c8f97` try kiya tha, par us project me aapka purana live app tha.
> Firestore/Storage rules database aur project level pe apply hoti hain, to rules deploy
> karne se purana app break ho sakta tha. Isliye ye app **dedicated naye project** me hai.

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

## Local setup

```bash
npm install
cp .env.example .env.local   # Windows: copy .env.example .env.local
# .env.local me apni Firebase Web App config bharo
npm run dev
```

Config values yahan se milenge:
Firebase Console → project `flipmart-c8f97` → ⚙ Project settings → Your apps → Web app → SDK setup and configuration.

Config missing hone par app blank page ki jagah setup instructions dikhata hai.

## Scripts

| Command | Kaam |
| --- | --- |
| `npm run dev` | Local dev server |
| `npm run build` | Typecheck + production build |
| `npm run preview` | Production build ka local preview |
| `npm run typecheck` | Sirf TS typecheck |
| `npm run lint` | oxlint |
| `npm run deploy` | Build + `firebase deploy` |

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

## Abhi pending (project `zomato-clone-b7f2`)

Project, web app, config aur hosting — sab done hai. Baki 2 cheezein aapke console se:

1. **Firestore API enable karo:**
   https://console.developers.google.com/apis/library/firestore.googleapis.com?project=zomato-clone-b7f2
   → **Enable** → 2-3 min wait.
2. **Database banao:**
   https://console.firebase.google.com/project/zomato-clone-b7f2/firestore
   → **Create database** → Database ID `default`, Location `asia-south1`, Production mode.
   Ya CLI se: `firebase firestore:databases:create default --location=asia-south1 --project zomato-clone-b7f2`

Phir batao — main rules deploy + demo seed chala dunga.

Auth (login) aur Storage (image upload) baad me enable karne hain:
- https://console.firebase.google.com/project/zomato-clone-b7f2/auth/providers
- https://console.firebase.google.com/project/zomato-clone-b7f2/storage

Admin banane ke liye: pehla signup karo, phir Firestore console me
`users/{uid}.role = "admin"` set karo → admin console khul jayega.

Web app ki SDK config values `.env.local` me hain. Ye client-side hain
(public by design) — koi secret nahi; rules hi asli protection hain.

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
`users/{uid}.role` ko `"admin"` set kar do.

## Abhi included / baad me

Included: Auth (email + Google), restaurant list with search/filter/sort,
menu, cart (localStorage + Firestore sync), checkout with validation,
order history, admin image upload.

Next (agar chahiye to batao): admin CRUD for restaurants/menu,
realtime order tracking (`onSnapshot`), ratings & reviews,
favourites, payment gateway (Razorpay).