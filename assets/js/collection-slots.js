window.COLLECTION_SLOTS = [
  "4:00-4:25",
  "4:25-4:50",
  "4:50-5:15",
  "5:15-5:40",
  "5:40-6:00",
];

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-slot-select]").forEach((select) => {
    if (select.children.length > 1) return;
    window.COLLECTION_SLOTS.forEach((slot) => {
      const option = document.createElement("option");
      option.value = slot;
      option.textContent = slot;
      select.append(option);
    });
  });
});
