type Photographer = {
  name: string;
  id: number;
  city: string;
  country: string;
  tagline: string;
  price: number;
  portrait: string;
};

function photographerTemplate(data: Photographer) {
  const { name, portrait, city, country, tagline, price, id } = data;
  const picture = `assets/photographers/${portrait}`;

  function getUserCardDOM(): HTMLElement {
    const article = document.createElement("article");
    article.classList.add("photographer-card");

    const link = document.createElement("a");
    link.setAttribute("href", `photographer.html?id=${id}`);
    link.setAttribute("aria-label", `Aller à la page du photographe ${name}`);
    link.classList.add("photographer-link");

    const img = document.createElement("img");
    img.setAttribute("src", picture);
    img.setAttribute("alt", name);
    img.classList.add("photographer-img");

    const h2 = document.createElement("h2");
    h2.textContent = name;
    h2.classList.add("photographer-name");

    const pLocation = document.createElement("p");
    pLocation.textContent = `${city}, ${country}`;
    pLocation.classList.add("photographer-location");

    const pTagline = document.createElement("p");
    pTagline.textContent = tagline;
    pTagline.classList.add("photographer-tagline");

    const pPrice = document.createElement("p");
    pPrice.textContent = `${price}€/jour`;
    pPrice.classList.add("photographer-price");

    // On place l'image et le h2 dans le lien pour que l'ensemble soit cliquable
    link.appendChild(img);
    link.appendChild(h2);

    // On ajoute le lien et les infos supplémentaires dans l'article
    article.appendChild(link);
    article.appendChild(pLocation);
    article.appendChild(pTagline);
    article.appendChild(pPrice);
    link.setAttribute("href", `./photographer.html?id=${id}`);

    return article;
  }

  return { name, picture, getUserCardDOM };
}

export { photographerTemplate, Photographer };
