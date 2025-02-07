// src/utils/contactForm.ts

function displayModal(): void {
  const modal = document.getElementById("contact_modal")!;
  modal.setAttribute("aria-hidden", "false");
  modal.style.display = "flex"; // S'assure que la modale est visible
  document.body.style.overflow = "hidden"; // Empêche le scroll de la page en arrière-plan
}

function closeModal(): void {
  const modal = document.getElementById("contact_modal")!;
  modal.setAttribute("aria-hidden", "true");
  modal.style.display = "none"; // Cache la modale
  document.body.style.overflow = "auto"; // Rétablit le scroll
}
export { displayModal, closeModal };
