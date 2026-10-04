# Evidence — acceptance gates

Screenshots `rfp/requirement.md` ke acceptance gates ke liye. Ye **local dev server**
(`http://localhost:5173`) ke against capture hue, is branch ka code dikhate hue.

| | |
| --- | --- |
| **Branch** | `most-sold-items` |
| **Captured** | 2026-10-04 |
| **Plan** | `specs/plan.md` |
| **Test** | `tests/evidence/rfp-evidence.spec.ts` |
| **Config** | `playwright.evidence.config.ts` |
| **Result** | 6 passed |

Run again:

```bash
npm run dev    # terminal 1 — localhost:5173 chalna chahiye
npx playwright test --config=playwright.evidence.config.ts
```

> Main `playwright.config.ts` alag hai — wo live deployed app ke against chalta hai
> (regression). Ye evidence config localhost ke against chalti hai, warna screenshots
> deployed code ke hote, is branch ke nahi.

---

## Screenshots

| File | Gate | Kya prove karta hai |
| --- | --- | --- |
| `01-homepage-listings.png` | AC-1 | 8 seeded restaurants, rating desc sorted, hero + search + filters |
| `02-search-filtered.png` | AC-1 | Cuisine filter "Biryani" → results narrow |
| `03-restaurant-menu.png` | AC-1, FR-3 | Restaurant detail, category grouping, veg marker, cart summary |
| `04-cart-totals.png` | AC-2 | Cart totals — item total, delivery fee, taxes |
| `05-protected-route-redirect.png` | FR-1.6 | `/checkout` login ke bina `/login` pe redirect |
| `06-checkout-validation.png` | AC-2, FR-5.1, FR-5.4 | Per-field validation errors; COD selected; **Razorpay visibly disabled** |
| `07-404.png` | NFR-11 | Unknown path → 404 page, SPA fallback |
| `08-most-sold-hidden.png` | FR-9.7 | `🔥 MOST SOLD` list **absent** — counters na hone par chhupi rehti hai |

---

## Ye kya NAHI prove karta

Evidence poora nahi hai. Do gaps hain, dono jaan-boojh kar chhode gaye:

### 1. FR-9.1 positive evidence missing — deploy kiye bina nahi milega

`08-most-sold-hidden.png` **negative** evidence hai. Ye prove karta hai ki list data na hone
par chhup jaati hai (FR-9.7) — iska matlab ye **nahi** ki list data hone par dikhti hai.

FR-9.1 (top 5 dishes card ke andar) ka positive evidence ke liye chahiye:

1. `firestore.rules` ka `itemSales` block live project pe deploy hona
2. Admin console se seed chala kar counters banana
3. Phir ye test dobara run karna

Ye teenon steps aapki permission ke bina nahi ho sakte — step 1 aapke live database ki
security policy badalta hai.

### 2. Order place / live order tracking nahi capture kiya

Login kiya gaya (read-only), cart bharaya, validation dikhaya — par **order place nahi kiya**,
kyunki wo aapke demo database me real order likhta hai.

Isiliye in gates ka is run me visual evidence nahi hai:

- AC-3 realtime order tracking (FR-6.2, FR-6.3)
- AC-4 review submit + rating recalculation (FR-7.1, FR-7.3)

Dono ke automated tests `tests/` me maujood hain, wo deployed app ke against chalti hain.
Chahiye to inhe bhi localhost pe run karne ka config bana sakte hain — batayein.

---

## Test ne jo galti pakdi

Evidence likhte waqt do bugs mile, dono fix kiye:

1. **Screenshot galat state capture ho raha tha** — `01-homepage-listings.png` me search
   pehle apply ho chuka tha, isliye 8 cards ke bajaye 1 dikh raha tha. Naam galat, evidence
   galat. Ab screenshot filter se pehle leta hai.
2. **`networkidle` kabhi settle nahi hota** — Firebase ke open realtime connections ki wajah se
   wait 60s timeout tak chala aur 4 tests fail hue. Image-decode based bounded wait se badla.

Ye dono isliye pakde gaye kyunki screenshots **dekhhe** gaye, sirf test pass hone pe bharosa
nahi kiya gaya.