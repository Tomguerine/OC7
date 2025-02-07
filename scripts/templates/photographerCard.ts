type Photographer = {
  name: string;
  id: number;
  city: string;
  country: string;
  tagline: string;
  price: number;
  portrait: string;
};

export function photographerTemplate(data: Photographer) {
  const { name, portrait, city, country, tagline, price, id } = data;
  const picture = `assets/photographers/${portrait}`;

  function getUserCardDOM(): HTMLElement {
    const article = document.createElement("article");
    article.classList.add("photographer-card");

    const link = document.createElement("a");
    link.setAttribute("href", `photographer.html?id=${id}`);
    link.setAttribute("aria-label", `Go to photographer ${name} page`);
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

    // Append elements
    link.appendChild(img);
    link.appendChild(h2);
    article.appendChild(link);
    article.appendChild(pLocation);
    article.appendChild(pTagline);
    article.appendChild(pPrice);

    return article;
  }

  return { name, picture, getUserCardDOM };
}
