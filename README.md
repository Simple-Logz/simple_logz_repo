# SimpleLogz — Enterprise SaaS Platform

AI-powered log analysis with real auth, payments, database, community forum, and terminal.

---

## File Structure

```
simplelogz/
├── backend/
│   ├── server.js              ← Express entry point
│   ├── package.json
│   ├── .env.example           ← Copy to .env and fill in
│   ├── routes/
│   │   ├── analyze.js         ← AI analysis + plan enforcement
│   │   ├── auth.js            ← Profile sync after OAuth
│   │   ├── stripe.js          ← Checkout, webhook, portal
│   │   ├── forum.js           ← Threads, comments, likes
│   │   └── user.js            ← History, usage, profile, delete
│   ├── middleware/
│   │   ├── auth.js            ← JWT verification
│   │   └── rateLimit.js       ← Rate limiters
│   └── lib/
│       └── supabase.js        ← Supabase admin client
│
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── main.jsx
│       ├── App.jsx            ← Router + providers
│       ├── index.css          ← Design system tokens
│       ├── hooks/
│       │   └── useAuth.jsx    ← Auth context (Supabase)
│       ├── lib/
│       │   ├── supabase.js    ← Supabase browser client
│       │   └── api.js         ← All backend API calls
│       ├── components/
│       │   ├── layout/
│       │   │   └── Navbar.jsx + .module.css
│       │   └── ui/
│       │       └── Toast.jsx + .module.css
│       └── pages/
│           ├── Landing.jsx    ← Marketing homepage
│           ├── Login.jsx      ← Sign in (4 OAuth + email)
│           ├── Signup.jsx     ← Register
│           ├── AuthCallback.jsx ← OAuth redirect handler
│           ├── Analyzer.jsx   ← Log analysis tool
│           ├── Terminal.jsx   ← Browser terminal
│           ├── Forum.jsx      ← Community forum
│           ├── Pricing.jsx    ← Plans + Stripe checkout
│           └── Dashboard.jsx  ← Dashboard + Settings
│
├── supabase-schema.sql        ← Run in Supabase SQL Editor
└── README.md
```

---

## Step 1 — Supabase setup (free)

1. Go to https://supabase.com and create a free project
2. Go to **SQL Editor** → paste and run `supabase-schema.sql`
3. Go to **Project Settings → API** and copy:
   - `Project URL`
   - `anon/public` key
   - `service_role` key (keep secret — backend only)
4. Go to **Authentication → Providers** and enable:
   - **Google** (needs Google Cloud OAuth app)
   - **GitHub** (needs GitHub OAuth app)
   - **Azure** for Microsoft
   - **Apple** (optional)
   - Set redirect URL to: `http://localhost:5173/auth/callback`

---

## Step 2 — Stripe setup (free test mode)

1. Go to https://stripe.com → create account
2. Get your **test** Secret Key from the Dashboard
3. Create a **Product**: Developer Plan, $10/month (recurring)
4. Copy the **Price ID** (starts with `price_`)
5. Set up webhook: Dashboard → Webhooks → Add endpoint
   - URL: `https://your-backend-url.com/api/stripe/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Copy the **Webhook Secret**

---

## Step 3 — Anthropic API key

1. Go to https://console.anthropic.com
2. API Keys → Create Key → copy it

---

## Step 4 — Run locally

### Backend
```bash
cd backend
cp .env.example .env
# Fill in all values in .env
npm install
npm run dev
# → API running at http://localhost:3001
```

### Frontend
```bash
cd frontend
cp .env.example .env
# Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm install
npm run dev
# → App running at http://localhost:5173
```

---

## Step 5 — Deploy frontend to Netlify

```bash
cd frontend
npm run build
```

1. Go to https://app.netlify.com
2. Drag the `frontend/dist` folder to netlify.com/drop
   **OR** connect your GitHub repo:
   - Base dir: `frontend`
   - Build command: `npm run build`
   - Publish dir: `frontend/dist`
3. Add environment variables in Netlify:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_API_URL` = your backend URL

### Add _redirects for SPA routing
Create `frontend/public/_redirects`:
```
/*    /index.html   200
```

---

## Step 6 — Deploy backend to Railway (free tier)

1. Push repo to GitHub
2. Go to https://railway.app → New Project → Deploy from GitHub
3. Select the `backend` folder as root directory
4. Add environment variables (all from your .env)
5. Railway gives you a URL like `https://simplelogz-backend.up.railway.app`
6. Update `VITE_API_URL` in Netlify to this URL
7. Update `FRONTEND_URL` in Railway to your Netlify URL

### Update Supabase OAuth redirects
In Supabase → Authentication → URL Configuration:
- Site URL: `https://your-app.netlify.app`
- Redirect URLs: `https://your-app.netlify.app/auth/callback`

---

## Pricing Plans

| Feature               | Free    | Developer ($10/mo) | Enterprise |
|-----------------------|---------|--------------------|------------|
| Analyses/day          | 2       | Unlimited          | Unlimited  |
| Downloadable reports  | ✗       | ✓                  | ✓          |
| Full resolution steps | Limited | ✓                  | ✓          |
| Analysis history      | ✗       | 90 days            | Custom     |
| Support               | Community | Email            | Dedicated  |
| Team seats            | 1       | 1                  | Unlimited  |

---

## Routes

| Method | Path                          | Auth     | Description             |
|--------|-------------------------------|----------|-------------------------|
| POST   | /api/analyze                  | Optional | AI log analysis         |
| POST   | /api/auth/sync                | Required | Profile sync after OAuth|
| GET    | /api/auth/me                  | Required | Get current user        |
| GET    | /api/user/history             | Required | Analysis history        |
| GET    | /api/user/usage               | Required | Daily/total usage       |
| PATCH  | /api/user/profile             | Required | Update name             |
| DELETE | /api/user/account             | Required | Delete account          |
| GET    | /api/forum/threads            | Public   | List threads            |
| GET    | /api/forum/threads/:id        | Public   | Get thread + comments   |
| POST   | /api/forum/threads            | Required | Create thread           |
| POST   | /api/forum/threads/:id/comments | Required | Post comment          |
| POST   | /api/stripe/create-checkout   | Required | Start subscription      |
| POST   | /api/stripe/portal            | Required | Manage subscription     |
| POST   | /api/stripe/webhook           | Public   | Stripe events           |
| GET    | /api/health                   | Public   | Health check            |
