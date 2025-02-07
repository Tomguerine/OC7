import { Photographer } from "./photographer";

export function photographerHeaderTemplate(
  photographer: Photographer
): HTMLElement {
  // Créer le conteneur principal
  const container = document.createElement("div");
  container.classList.add("photographer-header");

  // Bloc d'informations
  const infoDiv = document.createElement("div");
  infoDiv.classList.add("info");

  const h2 = document.createElement("h2");
  h2.textContent = photographer.name;

  const pLocation = document.createElement("p");
  pLocation.textContent = `${photographer.city}, ${photographer.country}`;
  pLocation.classList.add("location");

  const pTagline = document.createElement("p");
  pTagline.textContent = photographer.tagline;
  pTagline.classList.add("tagline");

  infoDiv.appendChild(h2);
  infoDiv.appendChild(pLocation);
  infoDiv.appendChild(pTagline);

  // Portrait
  const portrait = document.createElement("img");
  portrait.setAttribute("src", `assets/photographers/${photographer.portrait}`);
  portrait.setAttribute("alt", `Portrait de ${photographer.name}`);
  portrait.classList.add("portrait");

  // Bouton "Contactez-moi"
  const contactBtn = document.createElement("button");
  contactBtn.textContent = "Contactez-moi";
  contactBtn.classList.add("contact-button");

  // Ajouter tous les éléments au conteneur principal
  container.appendChild(infoDiv);
  container.appendChild(contactBtn);
  container.appendChild(portrait);

  return container;
}
