/******************************************************
 * Interface et variables globales
 ******************************************************/
export interface Recipe {
  id: number;
  image: string;
  name: string;
  servings: number;
  ingredients: {
    ingredient: string;
    quantity?: number | string;
    unit?: string;
  }[];
  time: number;
  description: string;
  appliance: string;
  ustensils: string[];
}

// Variable globale pour stocker toutes les recettes
let allRecipes: Recipe[] = [];

// Choix de la version de l'algorithme de recherche
// true => Version impérative (moins performante)
// false => Version fonctionnelle (optimisée)
const useImperativeSearch = true;

/******************************************************
 * Fonctions d'accès aux données
 ******************************************************/
// Récupère la liste de recettes depuis un fichier JSON
async function getRecipes(): Promise<Recipe[]> {
  const response = await fetch("data/recipes.json");
  const data = await response.json();
  return data;
}

// Tente de charger une image ; en cas d'erreur, renvoie une image de fallback
async function getImage(imageUrl: string): Promise<string> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error("Image not found");
    }
    return imageUrl;
  } catch (error) {
    console.error("Error fetching image:", error);
    return "placeholder.jpg";
  }
}

/******************************************************
 * Création d’une carte de recette (HTML)
 ******************************************************/
async function createRecipeCard(recipe: Recipe): Promise<string> {
  const imageUrl = await getImage(recipe.image);
  return `
    <div class="recipe-card">
      <img src="data/photo/${recipe.image}" alt="${recipe.name}" class="recipe-image">
      <div class="recipe-info">
        <div class="recipe-time">${recipe.time} min</div>
        <h2 class="recipe-title">${recipe.name}</h2>
        <h3 class="recipe-ingredients-title">RECETTE</h3>
        <p class="recipe-description">${recipe.description}</p>
        <h3 class="recipe-ingredients-title">INGRÉDIENTS</h3>
        <ul class="recipe-ingredients">
          ${recipe.ingredients
            .map(
              (ingredient) =>
                `<li>${ingredient.ingredient} <strong>${ingredient.quantity ?? ""} ${ingredient.unit ?? ""}</strong></li>`
            )
            .join("")}
        </ul>
      </div>
    </div>
  `;
}

/******************************************************
 * Affichage des données (mise à jour de la page)
 ******************************************************/
async function displayData(recipes: Recipe[]): Promise<void> {
  const container = document.getElementById("recipe-container");
  if (!container) return;

  // Génération des cartes de recette
  const recipeCards = await Promise.all(recipes.map(createRecipeCard));
  container.innerHTML = recipeCards.join("");

  // Mettre à jour le compteur de recettes
  const countElement = document.getElementById("recipe-count");
  if (countElement) {
    countElement.textContent = `${recipes.length} recettes`;
  }
}

/******************************************************
 * Extraction de valeurs uniques (pour les sélecteurs)
 ******************************************************/
function extractUniqueIngredients(recipes: Recipe[]): string[] {
  const ingredientsSet = new Set<string>();
  recipes.forEach((recipe) => {
    recipe.ingredients.forEach((item) => {
      ingredientsSet.add(item.ingredient.toLowerCase());
    });
  });
  return Array.from(ingredientsSet).sort();
}

function extractUniqueAppliances(recipes: Recipe[]): string[] {
  const appliancesSet = new Set<string>();
  recipes.forEach((recipe) => {
    appliancesSet.add(recipe.appliance.toLowerCase());
  });
  return Array.from(appliancesSet).sort();
}

function extractUniqueUstensils(recipes: Recipe[]): string[] {
  const ustensilsSet = new Set<string>();
  recipes.forEach((recipe) => {
    recipe.ustensils.forEach((utensil) => {
      ustensilsSet.add(utensil.toLowerCase());
    });
  });
  return Array.from(ustensilsSet).sort();
}

/******************************************************
 * Création d’un selector générique
 ******************************************************/
function createSelector(title: string, items: string[]): HTMLElement {
  const selectorContainer = document.createElement("div");
  selectorContainer.className = "selector-container";

  const button = document.createElement("button");
  button.className = "selector-button";
  button.innerHTML = `${title} <i class="fa fa-chevron-down"></i>`;
  selectorContainer.appendChild(button);

  const dropdown = document.createElement("div");
  dropdown.className = "selector-dropdown";
  selectorContainer.appendChild(dropdown);

  const searchContainer = document.createElement("div");
  searchContainer.className = "selector-search-container";
  dropdown.appendChild(searchContainer);

  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.placeholder = `Rechercher ${title.toLowerCase()}`;
  searchInput.className = "selector-search";
  searchContainer.appendChild(searchInput);

  const clearButton = document.createElement("button");
  clearButton.className = "selector-clear";
  clearButton.textContent = "X";
  clearButton.style.display = "none";
  searchContainer.appendChild(clearButton);

  const list = document.createElement("ul");
  list.className = "selector-list";
  items.forEach((item) => {
    const li = document.createElement("li");
    li.className = "selector-item";
    li.textContent = item;
    list.appendChild(li);

    // Lors du clic sur un item, on ajoute un tag
    li.addEventListener("click", (e) => {
      e.stopPropagation();
      const selectedValue = li.textContent || "";
      updateSelectedTags(title, selectedValue);
      selectorContainer.classList.remove("open");
      searchInput.value = "";
      list.querySelectorAll("li").forEach((li) => {
        li.style.display = "flex";
      });
    });
  });
  dropdown.appendChild(list);

  // Gestion de l’ouverture / fermeture du dropdown
  button.addEventListener("click", (e) => {
    e.stopPropagation();
    selectorContainer.classList.toggle("open");
    if (selectorContainer.classList.contains("open")) {
      searchInput.focus();
    }
  });

  // Filtrage des items du dropdown au fur et à mesure de la saisie
  searchInput.addEventListener("input", () => {
    const filterValue = searchInput.value.toLowerCase();
    const itemsList = list.querySelectorAll("li");
    itemsList.forEach((li) => {
      if (li.textContent?.toLowerCase().includes(filterValue)) {
        li.style.display = "flex";
      } else {
        li.style.display = "none";
      }
    });
    clearButton.style.display = filterValue ? "block" : "none";
  });

  // Bouton X pour vider le champ de recherche
  clearButton.addEventListener("click", (e) => {
    e.stopPropagation();
    searchInput.value = "";
    clearButton.style.display = "none";
    list.querySelectorAll("li").forEach((li) => {
      li.style.display = "flex";
    });
    searchInput.focus();
  });

  // Fermer le dropdown si on clique ailleurs
  document.addEventListener("click", (e) => {
    if (!selectorContainer.contains(e.target as Node)) {
      selectorContainer.classList.remove("open");
    }
  });

  return selectorContainer;
}

/******************************************************
 * Mise à jour des tags sélectionnés
 ******************************************************/
function updateSelectedTags(type: string, value: string): void {
  const tagContainer = document.querySelector(".selected-tags");
  if (tagContainer) {
    const tag = document.createElement("div");
    tag.classList.add("tag");
    tag.setAttribute("data-type", type.toLowerCase());
    tag.innerHTML = `
      <span class="tag-value">${value}</span>
      <button class="remove-tag">X</button>
    `;
    tag.querySelector(".remove-tag")?.addEventListener("click", (e) => {
      e.stopPropagation();
      tag.remove();
      performSearch();
    });
    tagContainer.appendChild(tag);
    performSearch();
  }
}

/******************************************************
 * Recherche fonctionnelle (version optimisée)
 ******************************************************/
function performSearchFunctional(): void {
  const mainSearchInput = document.getElementById(
    "search-recipe"
  ) as HTMLInputElement;
  const searchText = mainSearchInput
    ? mainSearchInput.value.toLowerCase().trim()
    : "";
  const tagElements = document.querySelectorAll(".selected-tags .tag");
  const selectedFilters: { type: string; value: string }[] = [];
  tagElements.forEach((tag) => {
    const type = tag.getAttribute("data-type") || "";
    const valueElement = tag.querySelector(".tag-value");
    const value = valueElement
      ? valueElement.textContent?.toLowerCase().trim() || ""
      : "";
    if (value) {
      selectedFilters.push({ type, value });
    }
  });

  let filteredRecipes = allRecipes;
  if (searchText) {
    filteredRecipes = filteredRecipes.filter((recipe) => {
      return (
        recipe.name.toLowerCase().includes(searchText) ||
        recipe.description.toLowerCase().includes(searchText) ||
        recipe.ingredients.some((ing) =>
          ing.ingredient.toLowerCase().includes(searchText)
        ) ||
        recipe.appliance.toLowerCase().includes(searchText) ||
        recipe.ustensils.some((ut) => ut.toLowerCase().includes(searchText))
      );
    });
  }

  selectedFilters.forEach((filter) => {
    if (filter.type === "ingrédients" || filter.type === "ingrédient") {
      filteredRecipes = filteredRecipes.filter((recipe) =>
        recipe.ingredients.some((ing) =>
          ing.ingredient.toLowerCase().includes(filter.value)
        )
      );
    } else if (filter.type === "appareils" || filter.type === "appareil") {
      filteredRecipes = filteredRecipes.filter((recipe) =>
        recipe.appliance.toLowerCase().includes(filter.value)
      );
    } else if (filter.type === "ustensiles" || filter.type === "ustensile") {
      filteredRecipes = filteredRecipes.filter((recipe) =>
        recipe.ustensils.some((ut) => ut.toLowerCase().includes(filter.value))
      );
    }
  });

  displayData(filteredRecipes);
}

/******************************************************
 * Fonction de recherche principale (choix de la version)
 ******************************************************/
function performSearch(): void {
  performSearchFunctional();
}

/******************************************************
 * Initialisation globale
 ******************************************************/
async function init(): Promise<void> {
  // 1) Charger les recettes
  allRecipes = await getRecipes();

  // 2) Afficher les recettes initiales
  displayData(allRecipes);

  // 3) Construire les sélecteurs (ingrédients, appareils, ustensiles)
  const ingredients = extractUniqueIngredients(allRecipes);
  const appliances = extractUniqueAppliances(allRecipes);
  const ustensils = extractUniqueUstensils(allRecipes);

  const ingredientsSelector = createSelector("Ingrédients", ingredients);
  const appliancesSelector = createSelector("Appareils", appliances);
  const ustensilsSelector = createSelector("Ustensiles", ustensils);

  const selectorsContainer = document.getElementById("selectors-container");
  if (selectorsContainer) {
    selectorsContainer.appendChild(ingredientsSelector);
    selectorsContainer.appendChild(appliancesSelector);
    selectorsContainer.appendChild(ustensilsSelector);
  }

  // 4) Gestion de la recherche principale au fil de la saisie
  const mainSearchInput = document.getElementById(
    "search-recipe"
  ) as HTMLInputElement;
  if (mainSearchInput) {
    mainSearchInput.addEventListener("input", () => {
      performSearch();
    });
  }
}

// Lancement une fois que le DOM est chargé
document.addEventListener("DOMContentLoaded", init);
