# 🔮 Foresight Engine
### AI-Powered Sales Prediction & Warehouse Management System

---

## TECH STACK
- **Frontend** — React 18 + Recharts + DM Sans font
- **Backend** — Node.js + Express + Multer
- **AI / ML** — Python + Scikit-learn (Random Forest + Linear Regression)
- **Database** — MongoDB + Mongoose

---

## ✅ INSTALL THESE FIRST (one-time only)

1. **Node.js** → https://nodejs.org (click LTS)
2. **Python 3.8+** → https://python.org
3. **MongoDB Community** → https://www.mongodb.com/try/download/community
4. **Git** → https://git-scm.com/downloads
5. **VS Code** → https://code.visualstudio.com

---

## 🚀 RUNNING THE PROJECT

### Step 1 — Open in VS Code
File → Open Folder → select `foresight-engine` → Open
Press **Ctrl + `** to open the terminal

### Step 2 — Install Python libraries (do once)
```
pip install scikit-learn pandas numpy
```

### Step 3 — Install backend packages
```
cd backend
npm install
```

### Step 4 — Install frontend packages (open NEW terminal with + button)
```
cd frontend
npm install
```

### Step 5 — Start the project (2 terminals needed)

**Terminal 1 — Backend:**
```
cd backend
node server.js
```
You should see: `Server running at http://localhost:5000` ✅

**Terminal 2 — Frontend:**
```
cd frontend
npm start
```
Browser opens at `http://localhost:3000` ✅

---

## 🧪 TESTING THE APP

1. Go to **Warehouse** page → Click "Add Product" → Add "Papaya" with 28 units, threshold 50
2. You'll see the orange ⚡ warning banner appear immediately
3. Go to **AI Prediction** → Upload `sample_data.csv` → Click Run
4. See revenue forecast, charts, fast/slow products
5. Go to **Stock Log** → See all transaction history

---

## 📤 PUSHING TO GITHUB — FULL STEP-BY-STEP

### PART A — Create a GitHub account (if you don't have one)
1. Go to https://github.com
2. Click "Sign up" → enter your email, password, username
3. Verify your email

### PART B — Create a new repository on GitHub
1. After logging in, click the **+** icon (top right) → "New repository"
2. Repository name: `foresight-engine`
3. Description: `AI-powered sales prediction and warehouse management system`
4. Select **Public** (so interviewers can see it)
5. ❌ Do NOT check "Add a README file" (we already have one)
6. Click **"Create repository"**
7. You'll see a page with commands — keep this page open

### PART C — Set up Git on your computer
Open VS Code terminal (Ctrl + `) and type these one by one:

**Tell Git who you are (do this once ever):**
```
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
```
Replace with your actual name and GitHub email.

### PART D — Push the project to GitHub
Make sure you are in the `foresight-engine` folder in terminal:
```
cd foresight-engine
```
If you're already inside a subfolder, go back:
```
cd ..
```

Now run these commands ONE BY ONE:

```
git init
```
(Initializes Git in your project folder)

```
git add .
```
(Stages all files — the dot means "everything")

```
git commit -m "Initial commit: Foresight Engine v1.0"
```
(Saves a snapshot with a message)

```
git branch -M main
```
(Renames branch to main)

```
git remote add origin https://github.com/YOUR_USERNAME/foresight-engine.git
```
⚠️ Replace YOUR_USERNAME with your actual GitHub username

```
git push -u origin main
```
(Uploads everything to GitHub)

It will ask for your GitHub username and password.
For password — use a **Personal Access Token** not your actual password:
1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token" → check "repo" → Generate
3. Copy the token and paste it as your password

### PART E — Verify it worked
1. Go to https://github.com/YOUR_USERNAME/foresight-engine
2. You should see all your files there! 🎉

### PART F — Future updates (after you make changes)
Every time you change code and want to update GitHub:
```
git add .
git commit -m "describe what you changed"
git push
```

---

## 🎤 INTERVIEW EXPLANATION

> "Foresight Engine is a full-stack AI-powered Warehouse and Sales Prediction System.
> The frontend is built in React with a custom design system using violet and orange as
> semantic colors — violet for brand actions, orange for urgent warnings.
> The backend is Node.js/Express with MongoDB for persistent storage of products and
> stock transactions. The AI module uses Python's scikit-learn — specifically Random Forest
> Regression and Linear Regression — to forecast next month's revenue and units from
> historical CSV data. The system also cross-references AI predictions against live warehouse
> stock levels and triggers real-time alerts when predicted demand exceeds available inventory."

**Key things to know:**
- Random Forest = ensemble of 100 decision trees → more accurate than single tree
- Linear Regression = baseline model used for cross-validation
- R² score = model accuracy metric (1.0 = perfect fit)
- REST API = GET/POST/PATCH/DELETE endpoints for full CRUD
- Train/Test split = 80% training, 20% testing
- MongoDB = NoSQL → stores products (schema) + transactions (log)
