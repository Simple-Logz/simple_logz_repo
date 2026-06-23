# SimpleLogz â Enterprise SaaS Platform

AI-powered log analysis with real auth, payments, database, community forum, and terminal.

---

## File Structure

```
simplelogz/
âââ backend/
â   âââ server.js              â Express entry point
â   âââ package.json
â   âââ .env.example           â Copy to .env and fill in
â   âââ routes/
â   â   âââ analyze.js         â AI analysis + plan enforcement
â   â   âââ auth.js            â Profile sync after OAuth
â   â   âââ stripe.js          â Checkout, webhook, portal
â   â   âââ forum.js           â Threads, comments, likes
â   â   âââ user.js            â History, usage, profile, delete
â   âââ middleware/
â   â   âââ auth.js            â JWT verification
â   â   âââ rateLimit.js       â Rate limiters
â   âââ lib/
â       âââ supabase.js        â Supabase admin client
â
âââ frontend/
â   âââ index.html
â   âââ vite.config.js
â   âââ package.json
â   âââ .env.example
â   âââ src/
â       âââ main.jsx
â       âââ App.jsx            â Router + providers
â       âââ index.css          â Design system tokens
â       âââ hooks/
â       â   âââ useAuth.jsx    â Auth context (Supabase)
â       âââ lib/
â       â   âââ supabase.js    â Supabase browser client
â       â   âââ api.js         â All backend API calls
â       âââ components/
â       â   âââ layout/
â       â   â   âââ Navbar.jsx + .module.css
â       â   âââ ui/
â       â       âââ Toast.jsx + .module.css
â       âââ pages/
â           âââ Landing.jsx    â Marketing homepage
â           âââ Login.jsx      â Sign in (4 OAuth + email)
â           âââ Signup.jsx     â Register
â           âââ AuthCallback.jsx â OAuth redirect handler
â           âââ Analyzer.jsx   â Log analysis tool
â           âââ Terminal.jsx   â Browser terminal
â           âââ Forum.jsx      â Community forum
â           âââ Pricing.jsx    â Plans + Stripe checkout
â           âââ Dashboard.jsx  â Dashboard + Settings
â
âââ supabase-schema.sql        â Run in Supabase SQL Editor
âââ README.md
```

---

## Step 1 â Supabase setup (free)

1. Go to https://supabase.com and create a free project
2. Go to **SQL Editor** â paste and run `supabase-schema.sql`
3. Go to **Project Settings â API** and copy:
   - `Project URL`
   - `anon/public` key
   - `service_role` key (keep secret â backend only)
4. Go to **Authentication â Providers** and enable:
   - **Google** (needs Google Cloud OAuth app)
   - **GitHub** (needs GitHub OAuth app)
   - **Azure** for Microsoft
   - **Apple** (optional)
   - Set redirect URL to: `http://localhost:5173/auth/callback`

---

## Step 2 â Stripe setup (free test mode)

1. Go to https://stripe.com â create account
2. Get your **test** Secret Key from the Dashboard
3. Create a **Product**: Developer Plan, $10/month (recurring)
4. Copy the **Price ID** (starts with `price_`)
5. Set up webhook: Dashboard â Webhooks â Add endpoint
   - URL: `https://your-backend-url.com/api/stripe/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Copy the **Webhook Secret**

---

## Step 3 â Anthropic API key

1. Go to https://console.anthropic.com
2. API Keys â Create Key â copy it

---

## Step 4 â Run locally

### Backend
```bash
cd backend
cp .env.example .env
# Fill in all values in .env
npm install
npm run dev
# â API running at http://localhost:3001
```

### Frontend
```bash
cd frontend
cp .env.example .env
# Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm install
npm run dev
# â App running at http://localhost:5173
```

---

## Step 5 â Deploy frontend to Netlify

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

## Step 6 â Deploy backend to Railway (free tier)

1. Push repo to GitHub
2. Go to https://railway.app â New Project â Deploy from GitHub
3. Select the `backend` folder as root directory
4. Add environment variables (all from your .env)
5. Railway gives you a URL like `https://simplelogz-backend.up.railway.app`
6. Update `VITE_API_URL` in Netlify to this URL
7. Update `FRONTEND_URL` in Railway to your Netlify URL

### Update Supabase OAuth redirects
In Supabase â Authentication â URL Configuration:
- Site URL: `https://your-app.netlify.app`
- Redirect URLs: `https://your-app.netlify.app/auth/callback`

---

## Pricing Plans

| Feature               | Free    | Developer ($10/mo) | Enterprise |
|-----------------------|---------|--------------------|------------|
| Analyses/day          | 2       | Unlimited          | Unlimited  |
| Downloadable reports  | â       | â                  | â          |
| Full resolution steps | Limited | â                  | â          |
| Analysis history      | â       | 90 days            | Custom     |
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
