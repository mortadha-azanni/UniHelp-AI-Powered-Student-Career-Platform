# UniHelp — Setup Guide

> Step-by-step instructions to run UniHelp locally.

---

## Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Node.js | 18+ | [Download](https://nodejs.org/) |
| npm | 9+ | Comes with Node.js |
| MongoDB | Atlas or Local | Free Atlas tier works |
| Git | Any | – |
| Google AI API Key | – | [Get free key](https://aistudio.google.com/apikey) |

---

## 1. Clone the Repository

```bash
git clone https://github.com/MouhammedHoussemAwadi/projet_nuit_ai.git
cd projet_nuit_ai
```

---

## 2. Configure the Server

### Install dependencies
```bash
cd server
npm install
```

### Create `.env`
Create `server/.env` with the following content:

```env
# ── Database ───────────────────────────────────
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/unihelp?retryWrites=true&w=majority

# ── Server ─────────────────────────────────────
PORT=5000
NODE_ENV=development

# ── JWT (change these secrets in production!) ──
JWT_ACCESS_SECRET=change_me_access_secret_key
JWT_REFRESH_SECRET=change_me_refresh_secret_key
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# ── Frontend URL (CORS) ────────────────────────
CLIENT_URL=http://localhost:5173

# ── Google AI (Gemini) ─────────────────────────
# Get a free key at https://aistudio.google.com/apikey
GOOGLE_API_KEY=AIzaSy...your_primary_key
GOOGLE_API_KEY_BACKUP=AIzaSy...your_backup_key   # Optional but recommended

# ── OpenRouter (fallback when Google quota runs out) ──
# Free plan at https://openrouter.ai/
OPENROUTER_API_KEY=sk-or-v1-...
```

> [!TIP]
> Get a free MongoDB Atlas connection string at https://cloud.mongodb.com — create a free M0 cluster and copy the connection string.

---

## 3. Configure the Client

```bash
cd ../client
npm install
```

Optionally create `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```
> If you skip this file, the client defaults to `http://localhost:5000/api` automatically.

---

## 4. Run the Application

Open **two separate terminal windows**:

**Terminal 1 — Backend:**
```bash
cd server
node index.js
```
Expected output:
```
✅ MongoDB connected
🚀 Server running on port 5000
📍 API URL: http://localhost:5000
🔐 Auth endpoints: http://localhost:5000/api/auth
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
```
Expected output:
```
VITE v6.x.x  ready in 300 ms
➜  Local:   http://localhost:5173/
```

Open **http://localhost:5173** in your browser.

---

## 5. First Use

1. Click **Register** and create an account
2. Go to **Profile** and fill in your information (used by all AI features)
3. Go to **Roadmaps** → **Générer avec l'IA** → type a goal like `"Penetration Testing"` → hit Generate
4. Wait 20–60 seconds — the AI generates a branching visual roadmap

---

## 6. API Key Notes

The roadmap generator (and all AI features) use a **3-tier fallback**:

```
Try GOOGLE_API_KEY → quota exceeded? →
Try GOOGLE_API_KEY_BACKUP → quota exceeded? →
Try OPENROUTER_API_KEY → fail? → error shown
```

**Free-tier limits (Google AI Studio):** ~15 requests/minute, 1500/day (as of 2025).
If you hit the quota, the system automatically switches to the backup or OpenRouter.

---

## 7. Common Issues

### `MongoServerSelectionError`
- Check your `MONGO_URI` in `.env` — it must include your actual password
- Ensure your IP address is whitelisted in MongoDB Atlas → Network Access

### Roadmap generation hangs or fails
- Check your Google API key is valid at https://aistudio.google.com/
- Make sure the server was **restarted** after any `.env` change
- Check the server terminal — the generation logs every step

### `401 Unauthorized` on API calls
- Your access token may have expired — try logging out and back in
- Check that `localStorage.getItem('accessToken')` returns a value in the browser console

### Port already in use (EADDRINUSE)
```powershell
# Kill all node processes
Get-Process node | Stop-Process -Force
```

---

## 8. Development Tips

- Use `nodemon` for auto-restart: `npm run dev` (already configured in `package.json`)
- For debugging AI chain responses: run `node test_roadmap.js` in the `server/` directory
- The server logs each AI step with emoji prefixes (📋 🤖 🔄 🔗 📐 💾)
