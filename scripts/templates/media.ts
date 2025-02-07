import { Media } from "../pages/photographer";

// Mappage entre les noms des photographes et leurs dossiers
export const photographerFolderMap: { [key: string]: string } = {
  "Mimi Keel": "Mimi",
  "Ellie-Rose Wilkens": "Ellie Rose",
  "Tracy Galindo": "Tracy",
  "Nabeel Bradford": "Nabeel",
  "Rhode Dubois": "Rhode",
  //eslint-disable-next-line
  "Marcel Nikolic": "Marcel",
};

export function mediaTemplate(
  media: Media,
  photographerName: string
): HTMLElement {
  const article = document.createElement("article");
  article.classList.add("media-card");

  // Récupérer le nom du dossier à partir du mappage
  const folderName = photographerFolderMap[photographerName];
  if (!folderName) {
    console.error(
      `Dossier non trouvé pour le photographe : ${photographerName}`
    );
    return article; // Retourne un élément vide si le dossier est introuvable
  }

  const basePath = `/assets/galerie/${folderName}`;

  let mediaElement: HTMLImageElement | HTMLVideoElement | null = null;

  // Générer l'élément média
  if (media.image) {
    mediaElement = document.createElement("img");
    mediaElement.setAttribute("src", `${basePath}/${media.image}`);
    mediaElement.setAttribute("alt", media.title);
    mediaElement.setAttribute("aria-label", `Image titled ${media.title}`);
  } else if (media.video) {
    mediaElement = document.createElement("video");
    mediaElement.setAttribute("src", `${basePath}/${media.video}`);
    mediaElement.setAttribute("controls", "true");
    mediaElement.setAttribute("aria-label", `Video titled ${media.title}`);
  }

  if (mediaElement) {
    mediaElement.classList.add("media");
    article.appendChild(mediaElement);
  }

  // Conteneur des informations du média
  const mediaInfo = document.createElement("div");
  mediaInfo.classList.add("media-info");

  // Titre du média
  const title = document.createElement("h3");
  title.textContent = media.title;
  title.style.color = "var(--color-primary)";
  mediaInfo.appendChild(title);

  // Conteneur des likes
  const likeContainer = document.createElement("div");
  likeContainer.classList.add("like-container");

  // Affichage des likes
  const likeCount = document.createElement("span");
  likeCount.textContent = media.likes.toString();
  likeCount.style.color = "var(--color-primary)";
  likeContainer.appendChild(likeCount);

  // Bouton "like"
  const likeButton = document.createElement("button");
  likeButton.setAttribute("aria-label", "Like this media");
  likeButton.classList.add("like-button");
  likeButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-heart">
      <path d="M20.8 4.6c-1.6-1.5-4.2-1.5-5.8 0l-1 1-1-1c-1.6-1.5-4.2-1.5-5.8 0s-1.5 4.2 0 5.8l7 6.8 7-6.8c1.5-1.6 1.5-4.2 0-5.8z"></path>
    </svg>
  `;
  likeButton.addEventListener("click", () => {
    media.likes++;
    likeCount.textContent = media.likes.toString(); // Met à jour les likes
  });
  likeContainer.appendChild(likeButton);

  // Ajouter les informations et les likes dans la carte
  mediaInfo.appendChild(likeContainer);
  article.appendChild(mediaInfo);

  return article;
}
