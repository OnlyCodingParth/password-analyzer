# Password Analyzer

A small full-stack project: a **vanilla JavaScript frontend** that checks password strength live in the browser, and a **Python Flask backend** that you deploy and connect to it.

```
Frontend (HTML/CSS/JS)  --API request-->  Backend (Flask)  --> /api/health
     Vercel / Netlify                          Render
```

The point of the project is to learn the whole workflow:
**Frontend -> Backend API -> GitHub -> Deployment -> Live website.**

## 1. What it does

You type a password and five rules turn red or green instantly:
8+ characters, uppercase, lowercase, number, special symbol.
A meter shows **WEAK**, **MEDIUM** or **STRONG**.

**Security:** the password is analyzed only inside your browser. It is never stored, logged, put in a URL, saved in localStorage, or sent to the backend. The backend only answers two plain GET requests.

## 2. Technologies

| Part | Tech |
|---|---|
| Frontend | HTML5, CSS3, vanilla JavaScript |
| Backend | Python, Flask, Flask-CORS |
| Production server | Gunicorn |
| Hosting | Vercel or Netlify (frontend), Render (backend) |

## 3. Folder structure

```
password-analyzer/
├── frontend/
│   ├── index.html     page structure
│   ├── style.css      design
│   ├── script.js      password rules + backend status check
│   └── config.js      the backend URL (local vs deployed)
├── backend/
│   ├── app.py         Flask API
│   ├── requirements.txt
│   └── .gitignore
├── README.md
└── .gitignore
```

## 4. How the pieces work

**Frontend.** `script.js` has a list of rules. Every keystroke runs `checkPassword()` (which rules pass), `calculateStrength()` (weak/medium/strong) and `updateUI()` (colors, meter, message). The page also asks the backend `/api/health` and `/api/info` once, and shows a small status badge at the bottom.

**Flask.** `app.py` defines two routes:
- `GET /api/health` returns `{"status": "ok", "message": "Password Analyzer API is running"}`
- `GET /api/info` returns `{"name": "Password Analyzer", "version": "1.0.0"}`

**How they connect.** The browser (frontend) calls `fetch("<backend URL>/api/health")`. Because the frontend and backend live at different web addresses, the browser blocks the request unless the backend says "this frontend is allowed". That permission system is **CORS**. In `app.py`, the environment variable `FRONTEND_ORIGIN` holds the allowed frontend address. It deliberately does not use `*`, which would allow every website.

**Where the backend URL goes.** `frontend/config.js`. Locally it uses `http://127.0.0.1:5000` automatically. When deployed it uses `PRODUCTION_API_URL`, which you edit once. (A plain static site cannot read server environment variables, and this URL is public, so it is not a secret.)

## 5. Run locally (Windows)

You need Python 3.10+ and VS Code with the **Live Server** extension.

**Terminal 1: backend**
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app.py
```
Open http://127.0.0.1:5000/api/health. You should see the JSON.

If PowerShell refuses to activate the venv, run once:
`Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`

**Frontend**
In VS Code, right-click `frontend/index.html` and choose **Open with Live Server**. It opens at `http://127.0.0.1:5500/...`. The badge at the bottom should turn green ("API online").

## 6. Upload to GitHub

1. On github.com click **New repository**, name it `password-analyzer`, leave it empty (no README), click **Create**.
2. Copy the repository URL it shows you.
3. In the project's root folder run:
```bash
git init
git add .
git commit -m "Initial Password Analyzer project"
git branch -M main
git remote add origin YOUR_REPOSITORY_URL
git push -u origin main
```
`.gitignore` keeps `venv/`, `__pycache__/`, `.env` and `*.pyc` out of GitHub.

## 7. Deploy the backend on Render (do this first)

1. Sign in at render.com with GitHub.
2. **New +** -> **Web Service** -> choose your `password-analyzer` repository.
3. Fill in:
   - **Root Directory:** `backend`
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn app:app`
   - **Instance type:** Free
4. Click **Create Web Service** and wait for "Live".
5. Copy the URL, like `https://password-analyzer-abc1.onrender.com`.
6. Test it: open `https://YOUR-URL.onrender.com/api/health`. You should see the JSON.

`gunicorn app:app` means "in the file `app.py`, run the object called `app`". Gunicorn is the production server, Flask's built-in server is only for local use.

## 8. Deploy the frontend (Vercel or Netlify)

First put your backend URL into `frontend/config.js`:
```js
const PRODUCTION_API_URL = "https://YOUR-URL.onrender.com";
```
Commit and push:
```bash
git add .
git commit -m "Set production API URL"
git push
```

**Vercel:** sign in with GitHub -> **Add New Project** -> select the repository -> set **Root Directory** to `frontend` -> Framework Preset **Other** -> leave build settings empty -> **Deploy**.

**Netlify:** **Add new site** -> **Import an existing project** -> GitHub -> select the repository -> **Base directory** `frontend`, **Publish directory** `frontend`, build command empty -> **Deploy**.

Copy your live frontend URL, like `https://password-analyzer.vercel.app`.

## 9. Connect them (CORS)

Go back to Render -> your service -> **Environment** -> add:

| Key | Value |
|---|---|
| `FRONTEND_ORIGIN` | `https://password-analyzer.vercel.app` (your real frontend URL, no trailing slash) |

To allow local testing too, separate with a comma:
`https://password-analyzer.vercel.app,http://127.0.0.1:5500`

Render restarts the service. Reload your live site: the badge should turn green.

## 10. Deployment test checklist

**Frontend**
- [ ] Website opens
- [ ] Rules update as you type
- [ ] WEAK / MEDIUM / STRONG changes correctly
- [ ] Show/Hide works
- [ ] Looks right on your phone

**Backend**
- [ ] `https://YOUR-BACKEND/api/health` returns the JSON

**Connection**
- [ ] The badge at the bottom of the live site says "API online"

## 11. Common errors and fixes

| Problem | Fix |
|---|---|
| Browser console: "blocked by CORS policy" | `FRONTEND_ORIGIN` on Render must exactly match your frontend URL (`https://`, no trailing `/`). Save and wait for the restart. |
| Badge says "Server offline" on the live site | You didn't replace `YOUR-BACKEND-NAME` in `config.js`, or didn't push the change. |
| Badge stays "Connecting" for ~1 minute | Free Render servers sleep when unused. The first request wakes them. Wait, then click the badge. |
| Render build fails: "No module named app" / start fails | Root Directory must be `backend`, and Start Command must be `gunicorn app:app`. |
| Render: "gunicorn: command not found" | `gunicorn` must be listed in `backend/requirements.txt`. |
| `venv\Scripts\activate` is blocked | `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`, then try again. |
| Local badge is red | Is `python app.py` still running? Is Live Server on port 5500? (If not, add its address to `FRONTEND_ORIGIN`.) |
| Mixed content error | A https site cannot call an http backend. Use the https Render URL. |

## FINAL RUN CHECKLIST (from a fresh clone)

```bash
git clone YOUR_REPOSITORY_URL
cd password-analyzer/backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app.py
```
Then, in VS Code, open the `password-analyzer` folder, right-click `frontend/index.html` -> **Open with Live Server**.

Deployment order: push to GitHub -> deploy backend on Render -> put its URL in `frontend/config.js` and push -> deploy frontend on Vercel/Netlify -> set `FRONTEND_ORIGIN` on Render -> open the live site.
