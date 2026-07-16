window.STORE_CONFIG = {
  brandName: "Jake's Bakes",
  tagline: "Because everyone deserves a proper cookie.",
  locationShort: "Barnsley, South Yorkshire",
  logoLine: "Brown butter cookies · Barnsley",
  baseBoxPrice: 15.99,
  premiumBoxPrice: 18.49,
  premiumUpgrade: 2.5,
  cookiesPerBox: 6,
  cookieWeightGrams: 80,
  weeklyBoxLimit: 25,
  preorderOpening: "Friday 9:00am",
  preorderDurationHours: 48,
  collectionAddress: "[COLLECTION ADDRESS OR AREA]",
  collectionDate: "[COLLECTION DATE]",
  collectionWindowStart: "[COLLECTION WINDOW START]",
  collectionWindowEnd: "[COLLECTION WINDOW END]",
  businessEmail: "[BUSINESS EMAIL]",
  instagramUrl: "[INSTAGRAM URL]",
  tiktokUrl: "[TIKTOK URL]",
  flavours: [
    {
      id: "chocolate-chip",
      name: "Brown Butter Chocolate Chip",
      shortName: "Chocolate Chip",
      premium: false,
      image: "assets/images/flavour-chocolate-chip.webp",
      description:
        "The one that started it all. A thick brown-butter cookie packed with chocolate, baked until golden at the edges and soft through the middle.",
    },
    {
      id: "oreo",
      name: "Brown Butter Oreo",
      shortName: "Oreo",
      premium: true,
      image: "assets/images/flavour-oreo.webp",
      description:
        "Our brown-butter base loaded with Oreo pieces, finished with a creamy drizzle and plenty of chocolatey biscuit crunch.",
    },
    {
      id: "biscoff",
      name: "Brown Butter Biscoff",
      shortName: "Biscoff",
      premium: true,
      image: "assets/images/flavour-biscoff.webp",
      description:
        "A warm brown-butter cookie filled with caramelised Biscoff flavour, topped with a smooth drizzle and a little biscuit crumb.",
    },
  ],
};

window.formatMoney = (value) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(value);

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-brand]").forEach((node) => {
    node.textContent = window.STORE_CONFIG.brandName;
  });
  document.querySelectorAll("[data-tagline]").forEach((node) => {
    node.textContent = window.STORE_CONFIG.tagline;
  });
  document.querySelectorAll("[data-location]").forEach((node) => {
    node.textContent = window.STORE_CONFIG.locationShort;
  });
});
