import { photographerHeaderTemplate } from "../templates/photographerHeader.js";
import { mediaTemplate, photographerFolderMap } from "../templates/media.js";
import { closeModal, displayModal } from "../utils/contactForm.js";

type Photographer = {
  name: string;
  id: number;
  city: string;
  country: string;
  tagline: string;
  price: number;
  portrait: string;
};

export type Media = {
  id: number;
  photographerId: number;
  title: string;
  image?: string;
  video?: string;
  likes: number;
  date?: string;
};

const urlParams = new URLSearchParams(window.location.search);
const photographerId = urlParams.get("id");

let currentMediaList: Media[] = [];
let currentMediaIndex = 0;
// Store the current photographer's name for media paths
let currentPhotographerName = "";

// Create the sorting section
function createSortSection(): HTMLElement {
  const sortSection = document.createElement("div");
  sortSection.classList.add("sort-section");

  const sortButton = document.createElement("button");
  sortButton.textContent = "Trier par";

  const sortMenu = document.createElement("ul");
  sortMenu.classList.add("sort-menu");

  const options = ["Popularité", "Date", "Titre"];
  options.forEach((option) => {
    const li = document.createElement("li");
    li.textContent = option;

    li.addEventListener("click", () => {
      console.log(`Sorted by: ${option}`);
      sortMedia(option);
      sortMenu.classList.remove("open");
    });

    sortMenu.appendChild(li);
  });

  const closeMenu = document.createElement("span");
  closeMenu.classList.add("close-menu");
  closeMenu.textContent = "▲";
  closeMenu.addEventListener("click", () => sortMenu.classList.remove("open"));
  sortMenu.appendChild(closeMenu);

  sortButton.addEventListener("click", () => sortMenu.classList.toggle("open"));

  sortSection.appendChild(sortButton);
  sortSection.appendChild(sortMenu);

  return sortSection;
}

// Sort media by criteria
function sortMedia(criteria: string) {
  const gallery = document.querySelector(".photographer-gallery")!;
  const mediaCards = Array.from(
    gallery.querySelectorAll(".media-card")
  ) as HTMLElement[];

  const sortedCards = mediaCards.sort((a, b) => {
    const likesA = parseInt(
      a.querySelector(".like-container span")!.textContent!
    );
    const likesB = parseInt(
      b.querySelector(".like-container span")!.textContent!
    );

    const titleA = a.querySelector("h3")!.textContent!;
    const titleB = b.querySelector("h3")!.textContent!;

    if (criteria === "Popularité") {
      return likesB - likesA;
    } else if (criteria === "Date") {
      const dateA = new Date(a.getAttribute("data-date")!);
      const dateB = new Date(b.getAttribute("data-date")!);
      return dateB.getTime() - dateA.getTime();
    } else if (criteria === "Titre") {
      return titleA.localeCompare(titleB);
    }

    return 0;
  });

  gallery.innerHTML = "";
  sortedCards.forEach((card) => gallery.appendChild(card));

  // Update the currentMediaList to reflect the new order
  const updatedMediaList: Media[] = [];
  sortedCards.forEach((card) => {
    const mediaId = parseInt(card.getAttribute("data-id")!);
    const mediaItem = currentMediaList.find((m) => m.id === mediaId);
    if (mediaItem) updatedMediaList.push(mediaItem);
  });
  currentMediaList = updatedMediaList;
}

// Handle form submit
function handleFormSubmit(event: Event): void {
  event.preventDefault();

  const form = document.getElementById("contact-form") as HTMLFormElement;
  const formData = new FormData(form);

  console.log("Form data:");
  for (let [key, value] of formData.entries()) {
    console.log(`${key}: ${value}`);
  }

  closeModal();
}

// Create lightbox
function createLightbox() {
  const lightbox = document.createElement("div");
  lightbox.classList.add("lightbox");
  lightbox.setAttribute("role", "dialog");
  lightbox.setAttribute("aria-label", "Image closeup view");
  lightbox.setAttribute("aria-hidden", "true");
  lightbox.innerHTML = `
    <div class="lightbox-content">
      <button class="lightbox-close" aria-label="Close lightbox">&times;</button>
      <button class="lightbox-prev" aria-label="Previous media">&#10094;</button>
      <div class="lightbox-media-container"></div>
      <p class="lightbox-title"></p>
      <button class="lightbox-next" aria-label="Next media">&#10095;</button>
    </div>
  `;
  document.body.appendChild(lightbox);

  const closeButton = lightbox.querySelector(
    ".lightbox-close"
  ) as HTMLButtonElement;
  const prevButton = lightbox.querySelector(
    ".lightbox-prev"
  ) as HTMLButtonElement;
  const nextButton = lightbox.querySelector(
    ".lightbox-next"
  ) as HTMLButtonElement;

  closeButton.addEventListener("click", closeLightbox);
  prevButton.addEventListener("click", showPreviousMedia);
  nextButton.addEventListener("click", showNextMedia);

  document.addEventListener("keydown", (e) => {
    const isLightboxOpen = lightbox.getAttribute("aria-hidden") === "false";
    if (!isLightboxOpen) return;

    if (e.key === "Escape") {
      closeLightbox();
    } else if (e.key === "ArrowLeft") {
      showPreviousMedia();
    } else if (e.key === "ArrowRight") {
      showNextMedia();
    }
  });
}

function openLightbox(index: number) {
  const lightbox = document.querySelector(".lightbox")!;
  lightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  currentMediaIndex = index;
  displayLightboxMedia(currentMediaIndex);
}

function closeLightbox() {
  const lightbox = document.querySelector(".lightbox")!;
  lightbox.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "auto";
}

function showNextMedia() {
  currentMediaIndex = (currentMediaIndex + 1) % currentMediaList.length;
  displayLightboxMedia(currentMediaIndex);
}

function showPreviousMedia() {
  currentMediaIndex =
    (currentMediaIndex - 1 + currentMediaList.length) % currentMediaList.length;
  displayLightboxMedia(currentMediaIndex);
}

/// repetition
function displayLightboxMedia(index: number) {
  const mediaItem = currentMediaList[index];
  const container = document.querySelector(".lightbox-media-container")!;
  const titleElement = document.querySelector(".lightbox-title")!;
  container.innerHTML = "";
  const folderName = photographerFolderMap[currentPhotographerName];

  if (mediaItem.image) {
    const img = document.createElement("img");
    // Use the photographer name in the path
    img.src = `assets/galerie/${folderName}/${mediaItem.image}`;
    img.setAttribute("aria-label", mediaItem.title);
    img.alt = mediaItem.title;
    container.appendChild(img);
  } else if (mediaItem.video) {
    const video = document.createElement("video");
    video.controls = true;
    video.setAttribute("aria-label", mediaItem.title);
    const source = document.createElement("source");
    // Use the photographer name in the path
    source.src = `assets/galerie/${folderName}/${mediaItem.video}`;
    source.type = "video/mp4";
    video.appendChild(source);
    container.appendChild(video);
  }

  titleElement.textContent = mediaItem.title;
}

async function init() {
  if (!photographerId) {
    console.error("No photographer ID found in URL");
    return;
  }

  const response = await fetch("data/photographers.json");
  const data = await response.json();
  const { photographers, media } = data;

  const selectedPhotographer: Photographer = photographers.find(
    (p: Photographer) => p.id === parseInt(photographerId)
  );

  if (selectedPhotographer) {
    currentPhotographerName = selectedPhotographer.name; // Store the photographer name globally

    const mainContainer = document.querySelector("main")!;

    // Add the photographer header
    const photographerHeader = photographerHeaderTemplate(selectedPhotographer);
    mainContainer.insertBefore(photographerHeader, mainContainer.firstChild);

    // Add sorting section
    const sortSection = createSortSection();
    mainContainer.insertBefore(
      sortSection,
      mainContainer.querySelector(".photographer-gallery")
    );

    // Add media gallery
    const gallery = document.createElement("div");
    gallery.classList.add("photographer-gallery");
    mainContainer.appendChild(gallery);

    const photographerMedia = media.filter(
      (m: Media) => m.photographerId === selectedPhotographer.id
    );

    // Stocke la liste courante de médias
    currentMediaList = photographerMedia;

    // ---- AJOUT : Génération de la galerie avec navigation clavier ----
    photographerMedia.forEach((mediaItem: Media, index: number) => {
      const mediaCard = mediaTemplate(mediaItem, selectedPhotographer.name);
      mediaCard.setAttribute("data-id", mediaItem.id.toString());

      if (mediaItem.date) {
        mediaCard.setAttribute("data-date", mediaItem.date);
      }

      // Récupère l'élément cliquable (img ou video) et le rend focusable
      const clickableElement = mediaCard.querySelector(
        "img, video"
      ) as HTMLElement | null;
      if (clickableElement) {
        // Rendez l'élément focusable
        clickableElement.tabIndex = 0;
        // Indique qu'il se comporte comme un bouton
        clickableElement.setAttribute("role", "button");

        // Clic souris => ouvre la lightbox
        clickableElement.addEventListener("click", () => {
          openLightbox(index);
        });

        // Navigation clavier => Entrée ou Espace
        clickableElement.addEventListener("keydown", (event: KeyboardEvent) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openLightbox(index);
          }
        });
      }

      gallery.appendChild(mediaCard);
    });
    // ---- FIN AJOUT ----

    // Contact modal
    document.querySelector(".contact-button")!.addEventListener("click", () => {
      displayModal();
      const modalPhotographerName = document.querySelector(
        ".modal-photographer-name"
      )!;
      modalPhotographerName.textContent = selectedPhotographer.name;
    });

    document
      .getElementById("modal-close")!
      .addEventListener("click", closeModal);

    document
      .getElementById("contact-form")!
      .addEventListener("submit", handleFormSubmit);

    // Bottom-right info section
    const bottomInfo = document.createElement("div");
    bottomInfo.classList.add("bottom-right-info");
    bottomInfo.innerHTML = `
      <span class="likes-info">
        <span class="likes-count">124</span>
        <svg class="heart-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20.8 4.6c-1.6-1.5-4.2-1.5-5.8 0l-1 1-1-1c-1.6-1.5-4.2-1.5-5.8 0s-1.5 4.2 0 5.8l7 6.8 7-6.8c1.5-1.6 1.5-4.2 0-5.8z"></path>
        </svg>
      </span>
      <span class="daily-price">${selectedPhotographer.price}€/jour</span>
    `;
    document.body.appendChild(bottomInfo);

    // Create Lightbox
    createLightbox();
  } else {
    console.error("Photographer not found for ID:", photographerId);
  }
}

init();
