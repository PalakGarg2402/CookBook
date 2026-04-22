// ===== Cook Book — Recipe Finder =====
// Public API: TheMealDB (https://www.themealdb.com/api.php)

const API_BASE = "https://www.themealdb.com/api/json/v1/1";

// ===== State =====
let allRecipes = [];
let categories = [];
let favorites = JSON.parse(localStorage.getItem("cookbook_favorites") || "[]");
let activeTab = "all";

// ===== DOM =====
const $ = (id) => document.getElementById(id);
const recipesEl = $("recipes");
const statusEl = $("status");
const searchInput = $("searchInput");
const categoryFilter = $("categoryFilter");
const sortBy = $("sortBy");
const themeToggle = $("themeToggle");
const modal = $("modal");
const modalBody = $("modalBody");
const modalClose = $("modalClose");
const tabs = document.querySelectorAll(".tab");

// ===== Helpers =====
const setStatus = (html) => (statusEl.innerHTML = html);
const showSpinner = () => setStatus('<div class="spinner"></div>');
const clearStatus = () => setStatus("");

// Debounce — limits how often a function fires
function debounce(fn, delay = 400) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}

// ===== API Calls =====
async function fetchRecipes(query = "chicken") {
  showSpinner();
  recipesEl.innerHTML = "";
  try {
    const res = await fetch(`${API_BASE}/search.php?s=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error("Network error");
    const data = await res.json();
    allRecipes = data.meals || [];
    clearStatus();
    if (allRecipes.length === 0) {
      setStatus(`No recipes found for "${query}". Try something else.`);
    }
    render();
  } catch (err) {
    setStatus(`Couldn't load recipes. Check your connection.`);
    console.error(err);
  }
}

async function fetchCategories() {
  try {
    const res = await fetch(`${API_BASE}/categories.php`);
    const data = await res.json();
    categories = data.categories || [];
    // Populate dropdown using map (HOF)
    const options = categories
      .map((c) => `<option value="${c.strCategory}">${c.strCategory}</option>`)
      .join("");
    categoryFilter.innerHTML = '<option value="">All Categories</option>' + options;
  } catch (err) {
    console.error("Categories fetch failed:", err);
  }
}

async function fetchRecipeDetail(id) {
  try {
    const res = await fetch(`${API_BASE}/lookup.php?i=${id}`);
    const data = await res.json();
    return data.meals ? data.meals[0] : null;
  } catch (err) {
    console.error(err);
    return null;
  }
}

// ===== Render with HOFs =====
function render() {
  const query = searchInput.value.trim().toLowerCase();
  const category = categoryFilter.value;
  const sort = sortBy.value;

  // Pick base list — all OR favorites
  let list = activeTab === "favorites"
    ? favorites
    : [...allRecipes];

  // FILTER by search keyword (HOF)
  if (query && activeTab === "favorites") {
    list = list.filter((r) => r.strMeal.toLowerCase().includes(query));
  }

  // FILTER by category (HOF)
  if (category) {
    list = list.filter((r) => r.strCategory === category);
  }

  // SORT (HOF)
  if (sort === "az") {
    list = list.sort((a, b) => a.strMeal.localeCompare(b.strMeal));
  } else if (sort === "za") {
    list = list.sort((a, b) => b.strMeal.localeCompare(a.strMeal));
  } else if (sort === "category") {
    list = list.sort((a, b) =>
      (a.strCategory || "").localeCompare(b.strCategory || "")
    );
  }

  if (list.length === 0) {
    recipesEl.innerHTML = "";
    if (activeTab === "favorites") {
      setStatus("No saved recipes yet. Tap the heart on any recipe to save it.");
    } else if (!statusEl.textContent) {
      setStatus("No recipes match your filters.");
    }
    return;
  }

  clearStatus();

  // MAP to HTML (HOF)
  recipesEl.innerHTML = list
    .map((r) => {
      const isFav = favorites.some((f) => f.idMeal === r.idMeal);
      const heart = `<svg width="14" height="14" viewBox="0 0 24 24" fill="${isFav ? "currentColor" : "none"}" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
      return `
        <article class="recipe-card" data-id="${r.idMeal}">
          <div class="recipe-img-wrap">
            <img src="${r.strMealThumb}" alt="${r.strMeal}" class="recipe-img" loading="lazy" />
            <button class="fav-btn ${isFav ? "active" : ""}" data-fav="${r.idMeal}" aria-label="Save recipe">
              ${heart}
            </button>
          </div>
          <div class="recipe-body">
            <h3 class="recipe-title">${r.strMeal}</h3>
            <p class="recipe-meta">
              ${[r.strCategory, r.strArea].filter(Boolean).join(" · ")}
            </p>
          </div>
        </article>
      `;
    })
    .join("");
}

// ===== Recipe Detail Modal =====
async function openRecipe(id) {
  modal.classList.remove("hidden");
  modalBody.innerHTML = '<div class="spinner"></div>';

  // Try to find in cached list, otherwise fetch
  let recipe = allRecipes.find((r) => r.idMeal === id) ||
               favorites.find((r) => r.idMeal === id);

  // If we don't have full ingredients, fetch fresh detail
  if (!recipe || !recipe.strIngredient1) {
    recipe = await fetchRecipeDetail(id);
  }

  if (!recipe) {
    modalBody.innerHTML = "<p>⚠️ Failed to load recipe.</p>";
    return;
  }

  // Build ingredients array using HOFs (map + filter)
  const ingredients = Array.from({ length: 20 }, (_, i) => i + 1)
    .map((n) => ({
      name: recipe[`strIngredient${n}`],
      measure: recipe[`strMeasure${n}`],
    }))
    .filter((ing) => ing.name && ing.name.trim() !== "");

  const tags = (recipe.strTags || "")
    .split(",")
    .filter((t) => t.trim() !== "");

  modalBody.innerHTML = `
    <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}" class="modal-img" />
    <h2>${recipe.strMeal}</h2>
    <div class="modal-tags">
      ${recipe.strCategory ? `<span class="tag">${recipe.strCategory}</span>` : ""}
      ${recipe.strArea ? `<span class="tag">${recipe.strArea}</span>` : ""}
      ${tags.map((t) => `<span class="tag">${t.trim()}</span>`).join("")}
    </div>
    <p class="modal-section-label">Ingredients</p>
    <ul class="ingredients-list">
      ${ingredients.map((i) => `<li><span>${i.name}</span><span class="measure">${i.measure || ""}</span></li>`).join("")}
    </ul>
    <p class="modal-section-label">Instructions</p>
    <p class="instructions">${recipe.strInstructions || "No instructions available."}</p>
    ${recipe.strYoutube
      ? `<a class="youtube-link" href="${recipe.strYoutube}" target="_blank" rel="noopener">Watch on YouTube →</a>`
      : ""}
  `;
}

function closeModal() {
  modal.classList.add("hidden");
}

// ===== Favorites =====
function toggleFavorite(id) {
  const recipe = allRecipes.find((r) => r.idMeal === id) ||
                 favorites.find((r) => r.idMeal === id);
  if (!recipe) return;

  const exists = favorites.some((f) => f.idMeal === id);
  favorites = exists
    ? favorites.filter((f) => f.idMeal !== id)
    : [...favorites, recipe];

  localStorage.setItem("cookbook_favorites", JSON.stringify(favorites));
  render();
}

// ===== Theme =====
function initTheme() {
  const saved = localStorage.getItem("cookbook_theme") || "light";
  document.documentElement.setAttribute("data-theme", saved);
  themeToggle.textContent = saved === "dark" ? "☀️" : "🌙";
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("cookbook_theme", next);
  themeToggle.textContent = next === "dark" ? "☀️" : "🌙";
}

// ===== Event Listeners =====
const debouncedSearch = debounce((value) => {
  if (activeTab === "favorites") {
    render();
  } else {
    fetchRecipes(value || "chicken");
  }
}, 450);

searchInput.addEventListener("input", (e) => debouncedSearch(e.target.value));
categoryFilter.addEventListener("change", render);
sortBy.addEventListener("change", render);
themeToggle.addEventListener("click", toggleTheme);

// Tab switching
tabs.forEach((tab) =>
  tab.addEventListener("click", () => {
    tabs.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    activeTab = tab.dataset.tab;
    render();
  })
);

// Card clicks (delegated) — open detail or toggle favorite
recipesEl.addEventListener("click", (e) => {
  const favBtn = e.target.closest("[data-fav]");
  if (favBtn) {
    e.stopPropagation();
    toggleFavorite(favBtn.dataset.fav);
    return;
  }
  const card = e.target.closest(".recipe-card");
  if (card) openRecipe(card.dataset.id);
});

// Modal close
modalClose.addEventListener("click", closeModal);
modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

// ===== Init =====
initTheme();
fetchCategories();
fetchRecipes("chicken");
