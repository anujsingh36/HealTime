# HealTime — Deploy Guide (Render + Vercel + Neon)

No Docker needed. Three free services:
- **Neon** → Postgres database
- **Render** → Spring Boot backend
- **Vercel** → React frontend

Total time: ~20 minutes.

---

## 1. Database — Neon (free Postgres)

1. Go to https://neon.tech → sign up → **Create Project** → name it `healtime`.
2. Copy the **connection string**. It looks like:
   ```
   postgresql://user:password@ep-xxx.neon.tech/healtime?sslmode=require
   ```
3. Convert to JDBC format (you'll paste this into Render):
   ```
   jdbc:postgresql://ep-xxx.neon.tech/healtime?sslmode=require
   ```
   Keep the username and password separately — you'll need them too.

---

## 2. Push code to GitHub

1. Create a new GitHub repo (e.g. `healtime`).
2. From the unzipped folder:
   ```bash
   cd healtime
   git init && git add . && git commit -m "initial"
   git branch -M main
   git remote add origin https://github.com/<you>/healtime.git
   git push -u origin main
   ```

---

## 3. Backend — Render

1. Go to https://render.com → **New +** → **Web Service** → connect your GitHub repo.
2. Settings:
   - **Root Directory**: `backend`
   - **Runtime**: `Docker`? → No, pick **Native** if available, else use the auto-detected Java env.
   - **Build Command**: `./mvnw clean package -DskipTests`
   - **Start Command**: `java -jar target/healtime-0.0.1-SNAPSHOT.jar`
   - **Instance Type**: Free
3. **Environment Variables** (Add these):
   | Key | Value |
   |---|---|
   | `DB_URL` | `jdbc:postgresql://ep-xxx.neon.tech/healtime?sslmode=require` |
   | `DB_USER` | (Neon username) |
   | `DB_PASSWORD` | (Neon password) |
   | `JWT_SECRET` | any long random string (50+ chars) |
   | `CORS_ORIGINS` | `*` (temporarily — update in step 5) |
4. Click **Create Web Service**. Wait ~5 min for first build.
5. Once live, copy your backend URL: `https://healtime-xxx.onrender.com`. Test it: visit `/swagger` → API docs should load.

> Free Render instances sleep after 15 min idle — first request after sleep takes ~30s.

---

## 4. Frontend — Vercel

1. Go to https://vercel.com → **Add New Project** → import your GitHub repo.
2. Settings:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite (auto-detected)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `dist` (default)
3. **Environment Variables**:
   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://healtime-xxx.onrender.com` (your Render URL from step 3) |
4. Click **Deploy**. Wait ~2 min.
5. Copy your Vercel URL: `https://healtime-xxx.vercel.app`.

---

## 5. Lock down CORS

Back in **Render → Environment**, update:
```
CORS_ORIGINS = https://healtime-xxx.vercel.app
```
Save → Render auto-redeploys. Done.

---

## 6. Verify

1. Open `https://healtime-xxx.vercel.app`
2. Register a patient → log in → book an appointment.
3. If something fails, check:
   - Browser DevTools → Network tab → look at the failing request URL.
   - Render → Logs tab → backend errors.

---

## Updating later

- **Frontend change** → `git push` → Vercel auto-deploys.
- **Backend change** → `git push` → Render auto-deploys.
- **DB schema change** → add Flyway migration in `backend/src/main/resources/db/migration/` → push.

---

## Custom domain

- Vercel → Project → Settings → Domains → add `app.yourdomain.com`.
- Render → Settings → Custom Domain → add `api.yourdomain.com`.
- After domain switch, update `CORS_ORIGINS` on Render and `VITE_API_URL` on Vercel, then redeploy.
