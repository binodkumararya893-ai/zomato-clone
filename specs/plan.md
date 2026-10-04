# Test Plan — RFP Evidence Run

Purpose: `rfp/requirement.md` ke acceptance gates ke liye **evidence** collect karna —
screenshots jo prove karein ki requirement actually implemented hai.

Ye plan `npm run test` (deployed app suite) se alag hai. Woh suite
`https://zomato-clone-b7f2.web.app` ke against chalta hai aur is branch ka code
test **nahi** karta. Evidence run ke liye localhost use hota hai.

Config: `playwright.evidence.config.ts` (baseURL = `http://localhost:5173`)

---

## 1. Acceptance Gate Evidence

### 1.1 AC-1 — Discoverable
**Steps:**
1. Homepage kholo
2. Restaurants load hone do
3. Search box me "dosa" type karo
4. Cuisine filter change karo

**Verification:** restaurant cards visible; search results filter hote hain

### 1.2 AC-2 — Orderable (cart + checkout, order place nahi)
**Steps:**
1. Ek restaurant menu page kholo
2. Pehle item ADD karo
3. Cart page kholo
4. `/checkout` kholo bina login ke

**Verification:** cart badge update; totals visible; login pe redirect

> Order **place nahi** kiya jaata — wo live demo database me real order likhta hai.
> Sirf cart aur validation tak.

### 1.3 FR-1.6 — Protected route
**Steps:**
1. Login ke baghair `/checkout` kholo

**Verification:** `/login` pe redirect ho

### 1.4 AC-2 — Checkout validation (login ke baad)
**Steps:**
1. Demo account se login
2. Cart me item daalo
3. `/checkout` kholo
4. Khaali form "Place order" se submit karo

**Verification:** per-field validation errors; COD selected; Razorpay disabled + reason

> Login read-only hai. Order place nahi hota — sirf form validation.

### 1.5 SPA Deep Links (NFR-11)
**Steps:**
1. Seed data me se ek restaurant slug direct URL se kholo

**Verification:** page render ho, 404 nahi

### 1.6 404 Handling
**Steps:**
1. Non-existent path kholo

**Verification:** "Page nahi mila" + Home button

### 1.7 FR-9 — Most sold (negative evidence)
**Steps:**
1. Homepage kholo, restaurant cards dekho

**Verification:** `🔥 MOST SOLD` label **absent** hona chahiye, kyunki is
machine ke Firestore me abhi `itemSales` counters nahi hain aur rules me
collection deploy nahi hui.

Ye FR-9.7 ("counter na ho to list chhup jaaye") ka evidence hai —
FR-9.1 ke **positive** evidence ke liye rules deploy + seed chahiye.

---

## 2. Outputs

Screenshots → `rfp/evidence/`, naming:

```
01-homepage-listings.png
02-search-filtered.png
03-restaurant-menu.png
04-cart-totals.png
05-protected-route-redirect.png
06-checkout-validation.png
07-404.png
08-most-sold-hidden.png
```

Index aur gaps: `rfp/evidence/README.md`