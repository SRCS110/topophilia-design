// Single source of truth for the site chrome (nav, footer, legal links).
// Edit here, then run `node tools/chrome.mjs` to stamp every page.
export const site = {
  name: "Topophilia Design Studio",
  domain: "https://www.topophiliadesign.com",
  serviceArea: "Interior and wardrobe design studio in Santa Rosa, serving Sonoma County and the greater Bay Area.",
  navLeft: [
    { label: "Interiors", href: "/interiors" },
    { label: "Wardrobe", href: "/wardrobe" },
    { label: "Sourcing", href: "/the-collector" }
  ],
  navRight: [
    { label: "Studio", href: "/about" },
    { label: "Journal", href: "/journal" }
  ],
  cta: { label: "Enquire", href: "/contact" },
  footer: {
    columns: [
      {
        title: "Services",
        links: [
          { label: "Interior design", href: "/interiors" },
          { label: "Wardrobe design", href: "/wardrobe" },
          { label: "The Collector: sourcing", href: "/the-collector" },
          { label: "The Tailor: fit", href: "/the-tailor" },
          { label: "The Builder: the plan", href: "/the-builder" }
        ]
      },
      {
        title: "Studio",
        links: [
          { label: "About", href: "/about" },
          { label: "Portfolio", href: "/portfolio" },
          { label: "Journal", href: "/journal" },
          { label: "Enquire", href: "/contact" }
        ]
      }
    ],
    // Mandatory legal links. Do not remove.
    legal: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Accessibility", href: "/accessibility" }
    ]
  },
  // Pages included in sitemap.xml (path, file)
  pages: [
    ["/", "index.html"],
    ["/interiors", "interiors.html"],
    ["/wardrobe", "wardrobe.html"],
    ["/the-collector", "the-collector.html"],
    ["/the-tailor", "the-tailor.html"],
    ["/the-builder", "the-builder.html"],
    ["/portfolio", "portfolio.html"],
    ["/about", "about.html"],
    ["/journal", "journal.html"],
    ["/contact", "contact.html"],
    ["/privacy", "privacy.html"],
    ["/terms", "terms.html"],
    ["/accessibility", "accessibility.html"]
  ],
  // Pages stamped with chrome but kept out of the sitemap
  extraPages: ["thank-you.html", "404.html"]
};
