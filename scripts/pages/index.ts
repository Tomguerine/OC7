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

async function getRecipes(): Promise<Recipe[]> {
  const response = await fetch("data/recipes.json");
  const data = await response.json();
  console.log("hey");
  console.log(data);
  return data;
}
async function getImage(imageUrl: string): Promise<Recipe[]> {
  const response = await fetch("data/recipes.json");
  const data = await response.json();
  console.log("hey");
  console.log(data);
  return data;
}
function createRecipeCard(recipe: Recipe): string {
  return `
    <div class="recipe-card">
      <img src="${recipe.image}" alt="${recipe.name}" class="recipe-image">
      <div class="recipe-info">

        <div class="recipe-time">${recipe.time} min</div>
        <h2 class="recipe-title">${recipe.name}</h2>
        <h3 class="recipe-ingredients-title">RECETTE</h3>
        <p class="recipe-description">${recipe.description}</p>
        <h3 class="recipe-ingredients-title">INGREDIENTS</h3>
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

function displayData(recipes: Recipe[]): void {
  const container = document.getElementById("recipe-container");
  if (container) {
    container.innerHTML = recipes.slice(0, 10).map(createRecipeCard).join("");
  }
}

async function init(): Promise<void> {
  const recipes = await getRecipes();
  displayData(recipes);
}

init();
document.addEventListener("DOMContentLoaded", init);
