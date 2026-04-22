# 🍳 Cook Book — Recipe Finder

A lightweight, responsive web app to discover recipes from around the world. Search by name, filter by category, sort, save favorites, and view full ingredients & cooking instructions — all in a clean light/dark UI.

> Built as a vanilla **HTML / CSS / JavaScript** project demonstrating public-API integration and array higher-order functions.

---

## 🌐 Live Demo

Open `index.html` in any modern browser, or deploy the folder to GitHub Pages / Netlify / Vercel.

---

## 🎯 Project Purpose

Cook Book helps users quickly find recipes for any ingredient or dish they have in mind. It pulls real-time data from a public recipe database and presents it in a friendly, mobile-first interface with interactive features like favorites, dark mode, and detailed recipe views.

---

## 🔌 API Used

**[TheMealDB](https://www.themealdb.com/api.php)** — a free, open recipe database. No API key required.

Endpoints used:
| Purpose | Endpoint |
|---|---|
| Search recipes by name | `/search.php?s={query}` |
| List all categories | `/categories.php` |
| Get full recipe by ID | `/lookup.php?i={id}` |

---

## ✨ Features

- 🔍 **Search** recipes by keyword (with debouncing — no API spam!)
- 🍽 **Filter** results by category (Beef, Chicken, Dessert, Vegan, etc.)
- 🔤 **Sort** alphabetically (A→Z, Z→A) or by category
- ❤️ **Favorites** — save recipes locally with `localStorage`
- 🌙 **Dark / Light mode** toggle (preference saved)
- 📖 **Recipe detail modal** with ingredients, instructions & YouTube link
- 📱 **Fully responsive** — mobile, tablet & desktop
- ⏳ **Loading spinner** & graceful error handling

All searching, filtering, and sorting use **array higher-order functions** (`map`, `filter`, `sort`, `find`, `some`) — no `for`/`while` loops.

---

## 🛠 Technologies

- **HTML5** — semantic markup
- **CSS3** — custom properties (theming), Grid & Flexbox, responsive design
- **Vanilla JavaScript (ES6+)** — `fetch`, async/await, HOFs, debouncing
- **TheMealDB API** — recipe data
- **localStorage** — persisting favorites & theme

No frameworks, no build step — just open and run.

---

## 📁 Project Structure

```
cook-book/
├── index.html      # Markup & layout
├── style.css       # Styling, theming, responsiveness
├── script.js       # API logic, HOFs, interactivity
└── README.md       # You are here
```

---

## 🚀 Setup & Run

1. **Clone the repository**
   ```bash
   git clone https://github.com/<your-username>/cook-book.git
   cd cook-book
   ```

2. **Open in browser**
   ```bash
   open index.html        # macOS
   # or simply double-click index.html
   ```

3. **(Optional) Use a local server** for best results:
   ```bash
   npx serve .
   # or
   python3 -m http.server 8000
   ```

That's it — no install, no build.

---

## 📦 Deployment

Deploy in seconds with any static-site host:

- **GitHub Pages** — push to a repo → Settings → Pages → Deploy from branch
- **Netlify** — drag & drop the folder onto [app.netlify.com/drop](https://app.netlify.com/drop)
- **Vercel** — `vercel` in the project folder

---

## 🧠 Higher-Order Functions Used

| HOF | Where it's used |
|---|---|
| `map` | Rendering recipe cards, building ingredient list, populating categories |
| `filter` | Search filtering on favorites, category filtering, removing empty ingredients |
| `sort` | A→Z, Z→A, and category sorting |
| `find` | Locating a recipe by ID for the modal |
| `some` | Checking if a recipe is already in favorites |

---

## 💡 Bonus Features Implemented

- ✅ **Debouncing** on the search input (450ms)
- ✅ **Loading indicator** during API calls
- ✅ **Local Storage** for favorites & theme preference
- ✅ **Graceful error handling** for failed requests

---

## 📝 License

MIT — free to use and modify.

---

Made with ❤️ and a lot of ☕ using [TheMealDB](https://www.themealdb.com/).
