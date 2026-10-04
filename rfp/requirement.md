# Requirements — Zomato Clone

Food delivery web app: restaurant discovery, menu, cart, checkout, order tracking aur reviews.

Ye document kya banaya jaana hai, uski requirements, aur **kaise pata chalega ki requirement
poori hui** — ye define karta hai.

| | |
| --- | --- |
| **Project** | Zomato Clone |
| **Doc version** | 2.1 — evidence-linked verification (`rfp/evidence/`) |
| **Stack** | React 19, TypeScript (strict), Vite 8, Tailwind CSS v4, React Router 7, Firebase (Auth, Firestore, Storage, Hosting) |
| **Live demo** | https://zomato-clone-b7f2.web.app |
| **Feature branch** | `most-sold-items` |

---

## 1. Goal aur acceptance

**Goal.** Ek deployed, publicly reachable food-delivery experience jo end-user ko
restaurant discovery → menu → cart → checkout → live order tracking tak le jaye, bina
kisi manual backend intervention ke, aur jisme data actually private rahe.

Goal poora tab maana jayega jab **saare 8 acceptance gates** pass hon:

| # | Acceptance gate | Pass kaise hoga |
| --- | --- | --- |
| AC-1 | **Discoverable** | Homepage pe seeded restaurants load hon, search/filter/sort kaam kare |
| AC-2 | **Orderable** | Guest login → cart → checkout → order place poora chal sake |
| AC-3 | **Trackable** | Order status change hone pe UI bina reload update ho |
| AC-4 | **Reviewable** | Review likhne se restaurant ka aggregate rating change ho |
| AC-5 | **Private** | Logged-out user orders na padh sake; user doosre ka cart na dekh sake |
| AC-6 | **Deployable** | `npm run build` + hosting deploy clean, deep links 404 na hon |
| AC-7 | **Safe to hand over** | Secrets repo me nahi; naye user ko setup steps mil sakein |
| AC-8 | **Most-sold visible** | Card ke andar us restaurant ke most-sold dishes dikhein |

**Current standing:** AC-1 aur AC-2 (partially) is run me **screenshot evidence** ke saath
verify hue. AC-3 aur AC-4 ke tests maujood hain par is run me capture nahi hue.
**AC-5 implemented, verify pending. AC-8 implemented, render nahi hua.**

**Evidence:** `rfp/evidence/` — screenshots + `README.md` jo batata hai kya prove hua aur
kya nahi. Plan `specs/plan.md`, spec `tests/evidence/rfp-evidence.spec.ts`.

```bash
npm run test:evidence    # localhost:5173 chalna chahiye
```

> **Verification honesty note.** "Verified" likha hua criterion do sources par based hai:
> (a) `tests/` suite ka recorded behaviour, aur (b) `rfp/evidence/` me is run ke screenshots.
> Jahan sirf (a) hai, wahan `(suite)` likha hai; jahan (b) hai, wahan evidence file ka naam
> diya hai. FR-9.1 ke liye **koi evidence nahi** hai — wo render nahi hua.

---

## 2. Verification vocabulary

Har requirement ke do alag columns hain, kyunki "banaya hua" aur "sahi kaam kar raha hai"
ek cheez nahi hai:

| Term | Matlab |
| --- | --- |
| **Verified** | Automated test ya browser me chala kar confirm kiya gaya |
| **Implemented** | Code likha hai, typecheck/lint clean, par live behaviour confirm nahi kiya |
| **Blocked** | Code ready hai, par Firebase console / key jaise external setup chahiye |
| **Not started** | Spec me hai, code nahi hai |

---

## 3. Functional requirements

### FR-1 — Authentication

| ID | Requirement | Impl | Verification |
| --- | --- | --- | --- |
| FR-1.1 | Email/password signup aur login | Done | Verified (`auth-flow.spec.ts`) |
| FR-1.2 | Google OAuth login | Done | **Blocked** — Firebase console me provider enable karna padta hai |
| FR-1.3 | Logout, session persistence | Done | Implemented |
| FR-1.4 | Do roles: `customer` (default) aur `admin` | Done | Verified (role gate in tests) |
| FR-1.5 | Role self-assign nahi ho sakta — sirf admin set kare | Done | Implemented (rule SEC-5) |
| FR-1.6 | Protected routes login maangein | Done | **Verified** - `evidence/05` |
| FR-1.7 | Missing config pe blank screen ke bajaye setup instructions | Done | Implemented |

### FR-2 — Restaurant discovery

| ID | Requirement | Impl | Verification |
| --- | --- | --- | --- |
| FR-2.1 | Restaurant listing, rating se sorted | Done | **Verified** - `evidence/01` (8 cards) |
| FR-2.2 | Search — naam, cuisine ya area | Done | **Verified** — `evidence/01` |
| FR-2.3 | Cuisine filter dropdown | Done | **Verified** - `evidence/02` |
| FR-2.4 | Sort: rating / delivery time / price low-to-high | Done | Implemented |
| FR-2.5 | Filter se kuch na mile to empty state + clear action | Done | Implemented |
| FR-2.6 | Skeleton loaders, error state with retry | Done | Implemented |

### FR-3 — Menu

| ID | Requirement | Impl | Verification |
| --- | --- | --- | --- |
| FR-3.1 | Restaurant page — cuisine, rating, price, delivery, offer | Done | **Verified** — `evidence/03` |
| FR-3.2 | Menu items category-wise grouped | Done | **Verified** - `evidence/03` |
| FR-3.3 | Veg / non-veg marker | Done | Implemented |
| FR-3.4 | Add to cart with quantity | Done | Verified (`auth-flow.spec.ts`) |
| FR-3.5 | Restaurant link slug-based (`/restaurant/:slug`) | Done | Verified (deep-link test) |

### FR-4 — Cart

| ID | Requirement | Impl | Verification |
| --- | --- | --- | --- |
| FR-4.1 | Cart localStorage me persist, reload pe na ude | Done | Implemented |
| FR-4.2 | Signed-in cart Firestore se hydrate ho | Done | Implemented |
| FR-4.3 | Quantity badhao / ghatao, zero pe remove | Done | Verified (`auth-flow.spec.ts`) |
| FR-4.4 | Cart empty hone pe empty state | Done | Verified |
| FR-4.5 | Cross-restaurant add cart replace kare | Done | Verified (explicit test) |
| FR-4.6 | Totals — subtotal, delivery fee, taxes, grand total | Done | **Verified** — `evidence/04` |
| FR-4.7 | Cloud writes debounced + serialised | Done | Implemented |

### FR-5 — Checkout

| ID | Requirement | Impl | Verification |
| --- | --- | --- | --- |
| FR-5.1 | Required-field validation, per-field errors | Done | **Verified** - `evidence/06` |
| FR-5.2 | Address capture (6 fields) | Done | Verified |
| FR-5.3 | Cash on Delivery | Done | Verified (`reviews-payment.spec.ts`) |
| FR-5.4 | Razorpay payment (optional — key na ho to COD) | Done | **Blocked** — key chahiye; UI me disabled + reason dikhta hai (`evidence/06`) |
| FR-5.5 | Payment fail/cancel pe order na bane | Done | Implemented |
| FR-5.6 | Server timestamp + stored totals | Done | Implemented |

### FR-6 — Orders

| ID | Requirement | Impl | Verification |
| --- | --- | --- | --- |
| FR-6.1 | User apne orders history dekh sake | Done | Verified (order place test) |
| FR-6.2 | Status realtime update (`onSnapshot`) | Done | Implemented |
| FR-6.3 | Visual progress tracker (4 states) | Done | Implemented |
| FR-6.4 | Payment status (pending / paid / failed) | Done | Verified (payment methods test) |
| FR-6.5 | Success banner order place hone pe | Done | Implemented |

### FR-7 — Reviews & ratings

| ID | Requirement | Impl | Verification |
| --- | --- | --- | --- |
| FR-7.1 | Review likh / edit / delete | Done | Verified (`reviews-payment.spec.ts` CRUD) |
| FR-7.2 | Per user ek hi review | Done | Verified |
| FR-7.3 | Aggregate rating + count recalculate ho | Done | Verified (explicit assertion) |
| FR-7.4 | Star picker (1–5) + comment | Done | Verified |

### FR-8 — Admin console

| ID | Requirement | Impl | Verification |
| --- | --- | --- | --- |
| FR-8.1 | Demo seed — 8 restaurants + menu + sales counters | Done | Implemented |
| FR-8.2 | Storage image upload, progress + validation | Done | **Blocked** — is Firebase project me Storage enable nahi hai |
| FR-8.3 | Sirf admin access | Done | Implemented (rule SEC-1) |

### FR-9 — Most sold items, per restaurant

*Naya feature — branch `most-sold-items`. Spec closed hai, koi open point nahi.*

Presentation: card ke bottom me, `🔥 MOST SOLD` label ke saath vertical list.
Har row: rank, dish name, price, green sold-count badge.

| ID | Requirement | Impl | Verification |
| --- | --- | --- | --- |
| FR-9.1 | Card ke andar top **5** most-sold dishes, `soldCount` desc | Done | **Implemented — render nahi hua** |
| FR-9.2 | Sirf unhi items jinka counter exist kare | Done | Implemented |
| FR-9.3 | Har row me rank, name, price, sold count | Done | Implemented |
| FR-9.4 | Card ka koi bhi hissa click → restaurant menu page | Done | Implemented |
| FR-9.5 | Order place pe counter increment | Done | Implemented |
| FR-9.6 | Counter increment atomic (`increment()`) | Done | Implemented |
| FR-9.7 | Counter na ho to list chhup jaaye | Done | **Verified** - `evidence/08` |
| FR-9.8 | Ek query + memory grouping, per-card fetch nahi | Done | Implemented |
| FR-9.9 | Rows plain text — alag click target nahi | Done | Implemented |
| FR-9.10 | Ek restaurant = ek query, card count ke saath scale nahi | Done | Implemented |

**AC-8 (is feature ka gate) teen steps se pass hoga:**
1. `firestore.rules` ka `itemSales` block live project pe deploy ho
2. Admin console se seed chale, counters banein
3. Browser me dikhe — card ke andar rows, click se menu khule

Abhi teeno pending hain. Step 1 live project ki security policy badalta hai
(isliye permission maangi gayi thi aur nahi mili).

**FR-9.9 rationale.** `RestaurantCard` pehle se ek `<Link>` hai jiska destination wahi hai.
Uske andar doosra `<Link>` invalid HTML hota. Rows plain text hain — user behaviour same
dikhata hai, markup valid rehta hai.

**Edge cases — expected behaviour:**

| Situation | Behaviour |
| --- | --- |
| Restaurant ke 0 counters | List render nahi hoti, card layout unchanged |
| Restaurant ke 1–4 counters | Utni hi rows |
| Restaurant ke 5+ counters | Sirf top 5, truncation **silent** — `+N more` nahi |
| Query fail / permission denied | Kuch nahi — na error na empty state |
| Fresh DB, counters nahi | Poori list invisible |

**Ceiling ≠ guarantee (FR-9.1).** 5 ek ceiling hai. Seed me har restaurant ke exactly 2 items
`isPopular` hain aur counters bhi unhi 2 pe — to abhi har card par max **2** rows dikhenge.
5 tab poora hoga jab real orders counters badhein.

**Rejected: global homepage rail.** Top-10 horizontal rail pehle bani thi, phir hatayi gayi —
per-card list ka duplicate thi aur wahi data dobara fetch karta tha. `MostSoldRail` component
aur `fetchMostSoldItems()` codebase se hataye gaye hain.

---

## 4. Non-functional requirements

| ID | Category | Requirement | Verification |
| --- | --- | --- | --- |
| NFR-1 | Performance | Route-level code splitting | Implemented |
| NFR-2 | Performance | Queries `limit()` ke saath | Implemented |
| NFR-3 | Quality | TypeScript strict, typecheck clean | **Verified** (is session me) |
| NFR-4 | Quality | oxlint clean | **Verified** (is session me) |
| NFR-5 | Quality | Queries sirf `services/` layer me | Implemented (code review) |
| NFR-6 | UX | Responsive mobile → desktop | Implemented |
| NFR-7 | UX | Loading / empty / error states | Implemented — **partial**, FR-9.7 exception |
| NFR-8 | Security | Access control rules me, sirf UI me nahi | Implemented (rules file) |
| NFR-9 | Security | Secrets repo me nahi | **Verified** (`.gitignore`) |
| NFR-10 | Testing | Playwright suite live app ke against | 22 tests, **is session me run nahi kiye** |
| NFR-11 | Deploy | SPA rewrite — deep links 404 na hon | Verified (deep-link test) |
| NFR-12 | Resilience | Counter/payment failure pe flow na toote | Implemented (fire-and-forget) |

---

## 5. Data model

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

## 6. Security requirements

| ID | Requirement | Verification |
| --- | --- | --- |
| SEC-1 | Restaurants + menu: public read, admin-only write | Implemented |
| SEC-2 | Reviews: public read, author-only write, ek per user | Implemented |
| SEC-3 | Orders: user sirf apna create/read; update/delete admin-only | Implemented — **AC-5 me verify pending** |
| SEC-4 | Cart + addresses: sirf owner | Implemented |
| SEC-5 | `role` field user khud change na kar sake | Implemented |
| SEC-6 | `itemSales`: public read; sirf counter increment, decrease nahi | Implemented |
| SEC-7 | Storage: type + size validation, safe filenames | Implemented — **FR-8.2 blocked** |
| SEC-8 | Database production mode me ho, rules assume na karein | Documented in README |

---

## 7. FR-9 design note

**Problem.** "Most sold" ke liye saare orders aggregate karne padte hain. Lekin SEC-3 ke
mutabik `orders` private hai — har user sirf apna order padh sakta hai. Admin hi aggregate
dekh sakta hai, public homepage pe nahi.

**Options considered.**

| Option | Verdict |
| --- | --- |
| Cloud Function aggregation | Sabse secure + scalable. Par **Blaze (billing) plan** chahiye aur setup kaafi kaam |
| `itemSales` denormalized counters | **Chosen.** No functions, no billing, rules increment-only enforce kar deti hain |
| Sirf `isPopular` flag | Free, par static — actual order data nahi |
| Admin-only leaderboard | Rules unchanged, par end user ko dikhega hi nahi |

**Implementation.** Order place hone par per-item counter `increment()` — atomic, isliye
concurrent orders safe. Document ID deterministic (`restaurantId___{itemId}`), isliye dobara
order karne par naya document nahi banta. Dish + restaurant ka naam denormalized hai, to
display ke liye extra fetch nahi lagta.

**Data reality (2026-10).** Seed me 16 counters hain aur ye **sab 16** `isPopular: true`
items pe — non-popular items par koi counter nahi. Ye jaan-boojh kar rakha gaya: "sab items
ko counter dena" se "most sold" ka matlab hi khatam ho jaata (sab equal, ranking meaningless).

**Accepted limitations.**

| Limitation | Kyu accept kiya |
| --- | --- |
| Silent truncation 5 ke baad | Requirement owner ne `+N more` explicitly reject kiya |
| Fetch fail pe kuch nahi dikhta | Visible empty state misleading lagta hai — "koi popular item nahi" jaisa |
| Saare counters ek query me (500 cap) | Demo scale theek; bade catalogue me per-restaurant query chahiye |
| Counter inflate ho sakta hai | Rules increment-only enforce karti hain; Cloud Functions se fix hoga |
| Koi bhi user 1–20 increment | Demo ke liye theek; production me backend move karna hoga |

---

## 8. Out of scope

- Native mobile app
- Delivery partner / driver app, live GPS tracking
- Real payment settlement (Razorpay demo mode)
- Multi-language / i18n (copy Hinglish + English mix hai)
- Analytics, recommendation engine, personalization

---

## 9. Future scope

- Admin CRUD for restaurants aur menu items (abhi seed-only)
- Favourites / wishlist
- Search debounce aur listing pagination
- Coupon / promo codes
- Push notifications on order status change
- Most-sold counters ko Cloud Functions se secure karna
- Most-sold fetch failure par visible empty/error state
- `fetchTopSoldByRestaurant` scale-out — ab saare counters padhta hai
- Test suite ko is session ke against dobara run karke verification claims refresh karna