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

async function getRecipes(): Promise<Recipe[]> {
  const response = await fetch("data/recipes.json");
  const data = await response.json();
  return data;
}

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

async function displayData(recipes: Recipe[]): Promise<void> {
  const container = document.getElementById("recipe-container");
  if (!container) return;

  // Afficher uniquement les 10 premières recettes
  const recipeCards = await Promise.all(
    recipes.slice(0, 10).map(createRecipeCard)
  );
  container.innerHTML = recipeCards.join("");
}

/* --- Extraction des valeurs uniques pour les selectors --- */
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

/* --- Création d'un selector générique --- */
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

  button.addEventListener("click", (e) => {
    e.stopPropagation();
    selectorContainer.classList.toggle("open");
    if (selectorContainer.classList.contains("open")) {
      searchInput.focus();
    }
  });

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

  clearButton.addEventListener("click", (e) => {
    e.stopPropagation();
    searchInput.value = "";
    clearButton.style.display = "none";
    list.querySelectorAll("li").forEach((li) => {
      li.style.display = "flex";
    });
    searchInput.focus();
  });

  document.addEventListener("click", (e) => {
    if (!selectorContainer.contains(e.target as Node)) {
      selectorContainer.classList.remove("open");
    }
  });

  return selectorContainer;
}

/* --- Mise à jour des tags sélectionnés --- */
/* Les tags affichent le type et la valeur.
   Le type est stocké dans un attribut data-type pour le filtrage. */
function updateSelectedTags(type: string, value: string): void {
  const tagContainer = document.querySelector(".selected-tags");
  if (tagContainer) {
    const tag = document.createElement("div");
    tag.classList.add("tag");
    tag.setAttribute("data-type", type.toLowerCase());
    tag.innerHTML = `
      <span class="tag-type">${type}</span>: <span class="tag-value">${value}</span>
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

/* --- Version fonctionnelle de la recherche --- */
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

/* --- Version impérative (moins performante) de la recherche --- */
function performSearchImperative(): void {
  const mainSearchInput = document.getElementById(
    "search-recipe"
  ) as HTMLInputElement;
  const searchText = mainSearchInput
    ? mainSearchInput.value.toLowerCase().trim()
    : "";

  // Récupération des tags sélectionnés
  const tagElements = document.querySelectorAll(".selected-tags .tag");
  const selectedFilters: { type: string; value: string }[] = [];
  for (let i = 0; i < tagElements.length; i++) {
    const tag = tagElements[i] as HTMLElement;
    const type = tag.getAttribute("data-type") || "";
    const valueElement = tag.querySelector(".tag-value");
    const value = valueElement
      ? valueElement.textContent?.toLowerCase().trim() || ""
      : "";
    if (value) {
      selectedFilters.push({ type, value });
    }
  }

  const filteredRecipes: Recipe[] = [];
  for (let i = 0; i < allRecipes.length; i++) {
    const recipe = allRecipes[i];
    let matches = false;

    // Vérification du champ de recherche principal
    if (searchText) {
      if (
        recipe.name.toLowerCase().indexOf(searchText) !== -1 ||
        recipe.description.toLowerCase().indexOf(searchText) !== -1
      ) {
        matches = true;
      } else {
        for (let j = 0; j < recipe.ingredients.length; j++) {
          if (
            recipe.ingredients[j].ingredient
              .toLowerCase()
              .indexOf(searchText) !== -1
          ) {
            matches = true;
            break;
          }
        }
        if (
          !matches &&
          recipe.appliance.toLowerCase().indexOf(searchText) !== -1
        ) {
          matches = true;
        }
        if (!matches) {
          for (let k = 0; k < recipe.ustensils.length; k++) {
            if (recipe.ustensils[k].toLowerCase().indexOf(searchText) !== -1) {
              matches = true;
              break;
            }
          }
        }
      }
    } else {
      matches = true; // Si aucun texte saisi, considérer la recette comme candidate
    }

    // Appliquer les filtres via les tags
    if (matches) {
      for (let f = 0; f < selectedFilters.length; f++) {
        const filter = selectedFilters[f];
        if (filter.type === "ingrédients" || filter.type === "ingrédient") {
          let found = false;
          for (let j = 0; j < recipe.ingredients.length; j++) {
            if (
              recipe.ingredients[j].ingredient
                .toLowerCase()
                .indexOf(filter.value) !== -1
            ) {
              found = true;
              break;
            }
          }
          if (!found) {
            matches = false;
            break;
          }
        } else if (filter.type === "appareils" || filter.type === "appareil") {
          if (recipe.appliance.toLowerCase().indexOf(filter.value) === -1) {
            matches = false;
            break;
          }
        } else if (
          filter.type === "ustensiles" ||
          filter.type === "ustensile"
        ) {
          let found = false;
          for (let k = 0; k < recipe.ustensils.length; k++) {
            if (
              recipe.ustensils[k].toLowerCase().indexOf(filter.value) !== -1
            ) {
              found = true;
              break;
            }
          }
          if (!found) {
            matches = false;
            break;
          }
        }
      }
    }

    if (matches) {
      filteredRecipes.push(recipe);
    }
  }

  displayData(filteredRecipes);
}

/* --- Fonction de recherche principale --- */
function performSearch(): void {
  if (useImperativeSearch) {
    performSearchImperative();
  } else {
    performSearchFunctional();
  }
}

/* --- Initialisation globale ---
   Récupère les recettes, les stocke globalement, affiche 10 recettes, et crée les selectors.
   Ajoute également un écouteur sur le champ principal pour lancer la recherche à la saisie.
*/
async function init(): Promise<void> {
  allRecipes = await getRecipes();
  displayData(allRecipes);

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

  const mainSearchInput = document.getElementById(
    "search-recipe"
  ) as HTMLInputElement;
  if (mainSearchInput) {
    mainSearchInput.addEventListener("input", () => {
      performSearch();
    });
  }
}

document.addEventListener("DOMContentLoaded", init);
