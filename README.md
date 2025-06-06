# 💰 HabiSave — Build Smarter Saving Habits

HabiSave is a lightweight, goal-based personal finance tool built for Gen Z and Millennials who want a simple, social, and rewarding way to save money. 🎯

---

## 🚀 Quick Walkthrough

This repository contains two main branches:

- **`main`** — the source code for the HabiSave project.
- **`gh-pages`** — used only for hosting the deployed version of the app via [**GitHub Pages**](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages) (It's safe to ignore this branch).

---

## 🖥️ How to Use

### ✅ Recommended: Use Online

You can try the live app directly here, it's hosted via [**GitHub Pages**](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages):
👉 [**Visit HabiSave**](https://khanhngo22.github.io/HabiSave/)

---

### 🛠️ Alternative: Run Locally

Clone the repository and install dependencies:

```bash
git clone https://github.com/khanhngo22/HabiSave.git
cd habisave
npm install
npm start
```
Local setup requires Node.js and npm. This also involves Tailwind CSS configuration and route handling. For a hassle-free experience, the hosted link is recommended.

## 🗂️ Basic File Structure

The core structure of the app lives inside the `src/` folder:

``` bash
src/
├── App.jsx
│   └── Contains the main routing logic and renders individual page components.
│
├── index.js
│   └── React entry point — mounts <App /> into the DOM.
│
└── components/
    ├── Dashboard.jsx
    │   └── Renders user goals, friends list, and charts (statistics, progress).
    │
    ├── Login.jsx
    │   └── Displays login form; handles authentication logic and session management.
    │
    ├── Signup.jsx
    │   └── Provides account creation form; stores new user data in localStorage.
    │
    ├── Welcome.jsx
    │   └── Landing page with navigation links to Login, Signup, and Pricing.
    │
    ├── Pricing.jsx
    │   └── Shows pricing plans, features comparison, and upgrade buttons.
    │
    └── Payment.jsx
        └── Lets users select a payment method and complete a mock checkout process.
```

Other files (e.g. styles, config files) support layout, responsiveness, and routing. You can safely ignore them unless customizing Tailwind or deployment behavior.

## 💡 Developer Notes

When running the app online (via [**GitHub Pages**](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)), please keep in mind:

- **Do not refresh the page directly** — [**GitHub Pages**](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages) doesn’t support proper route resolution for single-page apps (SPAs), so a manual refresh on subpages like `/dashboard` or `/signup` will result in a blank page. Always navigate using in-app buttons or links.
- **Data is stored using `localStorage`** — This is sufficient for an MVP or demo version, enabling persistent sessions and goal tracking without requiring a backend or database.

## 🔧 Tech Stack

- [React](https://create-react-app.dev/) (with hooks + router)
- [Tailwind CSS](https://tailwindcss.com/)

## License

This project is for educational and demonstration purposes only.
