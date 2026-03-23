# ⛽ FuelTH — หาน้ำมันใกล้คุณแบบเรียลไทม์

**Production-ready Next.js 14 web app** for finding gas stations and checking real-time fuel availability across Thailand.

---

## 🗂 Project Structure

```
fuelfinder-th/
├── src/
│   ├── app/                        # Next.js App Router pages
│   │   ├── layout.tsx              # Root layout (fonts, dark mode)
│   │   ├── page.tsx                # Home (map + nearby panel)
│   │   ├── providers.tsx           # Client providers
│   │   ├── globals.css             # Global styles + animations
│   │   ├── list/page.tsx           # Browse all stations
│   │   ├── station/[id]/page.tsx   # Station detail
│   │   ├── report/page.tsx         # Submit fuel report
│   │   ├── profile/page.tsx        # User profile + bookmarks
│   │   ├── premium/page.tsx        # Subscription page
│   │   └── api/seed/route.ts       # Dev-only seed endpoint
│   ├── components/
│   │   ├── map/
│   │   │   ├── MapView.tsx         # Google Maps with custom markers
│   │   │   └── BottomSheet.tsx     # Station quick-view overlay
│   │   ├── ui/
│   │   │   ├── FuelBadge.tsx       # Fuel type availability badge
│   │   │   ├── ConfidenceMeter.tsx # Trust score progress bar
│   │   │   ├── StationCard.tsx     # Station card (compact/full)
│   │   │   ├── FilterBar.tsx       # Horizontal filter chips
│   │   │   └── AdBanner.tsx        # Non-intrusive ad placement
│   │   └── layout/
│   │       ├── Navbar.tsx          # Top navigation
│   │       └── BottomNav.tsx       # Mobile tab bar
│   ├── hooks/
│   │   ├── useAuth.ts              # Firebase Auth subscription
│   │   └── useNearby.ts            # Geolocation + sorted stations
│   ├── lib/
│   │   ├── firebase.ts             # Firebase app init
│   │   ├── firestore.ts            # All DB operations + seed data
│   │   ├── store.ts                # Zustand global state
│   │   └── utils.ts                # Helpers, distance, formatting
│   └── types/
│       └── index.ts                # TypeScript types + constants
├── public/
│   └── manifest.json               # PWA manifest
├── firestore.rules                 # Firestore security rules
├── firestore.indexes.json          # Composite index definitions
├── firebase.json                   # Firebase CLI config
├── .env.local.example              # Environment variable template
├── next.config.js
├── tailwind.config.js
└── tsconfig.json
```

---

## 🚀 Quick Start

### 1. Clone and install dependencies

```bash
git clone https://github.com/yourname/fuelfinder-th.git
cd fuelfinder-th
npm install
```

### 2. Set up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/) → **New Project**
2. Add a **Web App**
3. Enable **Authentication** → Sign-in method → **Google**
4. Enable **Firestore Database** (start in test mode, then apply rules)
5. Copy your config values

### 3. Set up Google Maps

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable APIs:
   - **Maps JavaScript API**
   - **Places API**
   - **Directions API**
3. Create a **Map ID** (Maps Platform → Map Management)
4. Create an **API Key** (restrict to your domain in production)

### 4. Configure environment variables

```bash
cp .env.local.example .env.local
# Fill in all values in .env.local
```

### 5. Run locally

```bash
npm run dev
# Open http://localhost:3000
```

### 6. Seed demo data (first run only)

```
GET http://localhost:3000/api/seed
```

This loads 4 sample stations across Thailand. Remove or protect this endpoint before deploying.

### 7. Deploy Firestore rules

```bash
npm install -g firebase-tools
firebase login
firebase init firestore
firebase deploy --only firestore:rules,firestore:indexes
```

### 8. Deploy to Vercel

```bash
npm install -g vercel
vercel
# Add all NEXT_PUBLIC_* env vars in Vercel dashboard
```

---

## 🗄️ Firestore Data Structure

### `stations` collection
```json
{
  "id": "auto-generated",
  "name": "ปตท. หัวหิน สาขา 1",
  "brand": "PTT",
  "province": "ประจวบคีรีขันธ์",
  "address": "ถ.เพชรเกษม หัวหิน",
  "lat": 12.5706,
  "lng": 99.9580,
  "phone": "032-511111",
  "openHours": "24 ชั่วโมง",
  "fuels": {
    "diesel":    { "available": true,  "price": 29.94, "updatedAt": 1711000000000 },
    "gasohol91": { "available": true,  "price": 36.86, "updatedAt": 1711000000000 },
    "gasohol95": { "available": false, "price": 40.10, "updatedAt": 1711000000000 },
    "e20":       { "available": true,  "price": 33.44, "updatedAt": 1711000000000 }
  },
  "confidence": 87,
  "reportCount": 23,
  "featured": true,
  "createdAt": 1711000000000,
  "updatedAt": 1711000000000
}
```

### `reports` collection
```json
{
  "id": "auto-generated",
  "stationId": "abc123",
  "userId": "uid_xyz",
  "fuelType": "diesel",
  "status": "available",
  "price": 29.94,
  "note": "รอคิวนาน 10 นาที",
  "upvotes": 5,
  "downvotes": 1,
  "timestamp": 1711000000000
}
```

### `users` collection
```json
{
  "uid": "firebase_uid",
  "displayName": "สมชาย ใจดี",
  "email": "somchai@gmail.com",
  "photoURL": "https://...",
  "trustScore": 73,
  "reportCount": 12,
  "isPremium": false,
  "bookmarks": ["stationId1", "stationId2"],
  "createdAt": 1711000000000
}
```

---

## 💰 Monetisation

| Feature | Details |
|---|---|
| **Featured Stations** | `featured: true` flag → orange ring + star badge on map. Station owners pay monthly via email contact |
| **Ad Banners** | `AdBanner.tsx` — replace placeholder with Google AdSense `<ins>` tag. Hidden for Premium users |
| **Premium Subscription** | ฿49/month or ฿399/year · Integrate Stripe or PromptPay in `/api/checkout` |
| **Premium Features** | Push notifications, ad-free, AI prediction, unlimited bookmarks, price history |

---

## 🧠 Trust / Confidence System

- Every new user starts with `trustScore: 50`
- Submitting a report: `+2 points`
- When other users upvote your report: `+1 point` (max +5 per write)
- Station `confidence` score is recalculated from the last 20 reports
- Formula: `(positiveWeightedVotes / totalVotes) × 100`

---

## 🤖 AI Features

| Feature | Implementation |
|---|---|
| **Run-out Prediction** | `runOutProbability()` in `utils.ts` — heuristic based on report frequency, age, and confidence score |
| **Future: Real ML** | Export Firestore data to BigQuery → train a model → serve via Cloud Functions |

---

## ⚡ Performance Optimisations

- **Map**: `dynamic()` with `ssr: false` — Google Maps only loads client-side
- **Markers**: `AdvancedMarkerElement` with SVG — no heavy icon libraries
- **Data**: Max 200 stations per query; filter client-side for MVP
- **Images**: Next.js `<Image>` with Firebase Storage domains whitelisted
- **Fonts**: `display: swap` and preconnect for Thai Sarabun font
- **PWA**: `manifest.json` enables Add to Home Screen on iOS/Android

---

## 📱 Production Checklist

- [ ] Replace all `.env.local.example` values
- [ ] Restrict Google Maps API key to your domain
- [ ] Deploy Firestore security rules
- [ ] Remove or secure `/api/seed` endpoint
- [ ] Add real AdSense publisher ID in `AdBanner.tsx`
- [ ] Integrate Stripe / PromptPay for Premium
- [ ] Enable Firebase Analytics
- [ ] Set up Firebase Performance Monitoring
- [ ] Add error boundary components
- [ ] Set up Sentry for error tracking
- [ ] Configure Vercel Analytics

---

## 🛣️ Roadmap

- [ ] Push notifications (Firebase Cloud Messaging)
- [ ] Fuel price chart history (Recharts)
- [ ] Station photo uploads (Firebase Storage)
- [ ] Admin dashboard for station management
- [ ] Geo-query with geohash for scalable map loading
- [ ] Line Notify integration (popular in Thailand)
- [ ] Export for delivery apps (Grab, Lalamove drivers)

---

## 📄 License

MIT — free to use, modify, and deploy commercially.
