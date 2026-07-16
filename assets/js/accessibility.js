document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-accordion]").forEach((accordion) => {
    accordion.addEventListener("click", (event) => {
      const button = event.target.closest("button");
      if (!button) return;
      const item = button.closest(".accordion-item");
      const isOpen = item.classList.toggle("is-open");
      button.setAttribute("aria-expanded", String(isOpen));
    });
  });

  document.querySelectorAll("[data-validate-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      const invalid = [...form.querySelectorAll("[required]")].filter((field) => !field.value.trim());
      const summary = form.querySelector("[data-error-summary]");
      if (invalid.length) {
        event.preventDefault();
        summary.textContent = "Please complete the required fields before sending.";
        invalid[0].focus();
      } else {
        event.preventDefault();
        summary.textContent = "Prototype only: this form shows the intended Shopify contact flow.";
      }
    });
  });
});
