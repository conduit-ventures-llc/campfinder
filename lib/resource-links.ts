// ─── CampFinder Resource Link Intelligence ──────────────────────────────────

export interface ResourceLink {
  keywords: string[];
  name: string;
  url: string;
  description: string;
  category:
    | "finder"
    | "financial"
    | "safety"
    | "waitlist"
    | "packing"
    | "sports"
    | "arts"
    | "stem"
    | "special_needs"
    | "general";
}

export const RESOURCE_LINKS: ResourceLink[] = [
  // ─── Camp Finders ──────────────────────────────────────────────────────────
  {
    keywords: ["camp", "summer camp", "day camp", "sleepaway"],
    name: "ACA Find a Camp",
    url: "https://find.acacamps.org/",
    description: "Search the American Camp Association's directory of accredited camps",
    category: "finder",
  },
  {
    keywords: ["nearby", "close", "local"],
    name: "Google Maps Nearby Camps",
    url: "https://www.google.com/maps/search/summer+camps+near+me",
    description: "Find camps near your location with drive times",
    category: "finder",
  },
  {
    keywords: ["camp search", "find camp"],
    name: "CampNav",
    url: "https://www.campnav.com/",
    description: "Compare and filter camps by type, location, and cost",
    category: "finder",
  },

  // ─── Financial Aid ─────────────────────────────────────────────────────────
  {
    keywords: ["financial aid", "scholarship", "campership", "afford"],
    name: "ACA Financial Aid",
    url: "https://www.acacamps.org/resource-library/campership-financial-assistance",
    description: "Campership and financial assistance resources from ACA",
    category: "financial",
  },
  {
    keywords: ["scholarship", "financial help"],
    name: "Camp Scholarships",
    url: "https://www.campscholarships.com/",
    description: "Database of camp scholarship opportunities",
    category: "financial",
  },
  {
    keywords: ["free camp", "medical needs", "serious illness"],
    name: "SeriousFun Children's Network",
    url: "https://www.seriousfunnetwork.org/",
    description: "Free camps for children with serious illnesses",
    category: "financial",
  },

  // ─── Safety ────────────────────────────────────────────────────────────────
  {
    keywords: ["accredited", "ACA", "safety"],
    name: "ACA Accreditation Checker",
    url: "https://find.acacamps.org/",
    description: "Verify a camp's ACA accreditation status",
    category: "safety",
  },
  {
    keywords: ["background check", "safety check"],
    name: "National Sex Offender Registry",
    url: "https://www.nsopw.gov/",
    description: "Search the national sex offender public registry",
    category: "safety",
  },
  {
    keywords: ["health", "safety guidelines"],
    name: "CDC Camp Safety",
    url: "https://www.cdc.gov/healthy-youth-development/camps/index.html",
    description: "CDC guidelines for healthy camp environments",
    category: "safety",
  },

  // ─── Waitlist ──────────────────────────────────────────────────────────────
  {
    keywords: ["waitlist", "full", "sold out"],
    name: "Camp Experts",
    url: "https://www.campexperts.com/",
    description: "Expert help finding openings and managing waitlists",
    category: "waitlist",
  },

  // ─── Packing ───────────────────────────────────────────────────────────────
  {
    keywords: ["packing", "pack list", "what to bring"],
    name: "REI Camp Packing List",
    url: "https://www.rei.com/learn/expert-advice/family-camping-checklist.html",
    description: "Comprehensive family camp packing checklist",
    category: "packing",
  },
  {
    keywords: ["packing list"],
    name: "ACA Packing Guide",
    url: "https://www.acacamps.org/campers-families/preparing-camp/packing",
    description: "Official ACA packing recommendations",
    category: "packing",
  },

  // ─── Sports Camps ──────────────────────────────────────────────────────────
  {
    keywords: ["Nike", "sports camp", "athletic"],
    name: "Nike Sports Camps",
    url: "https://www.ussportscamps.com/",
    description: "Nike-affiliated sports camps across the country",
    category: "sports",
  },
  {
    keywords: ["Under Armour", "performance"],
    name: "Under Armour Camps",
    url: "https://www.underarmourcamps.com/",
    description: "Under Armour performance training camps",
    category: "sports",
  },
  {
    keywords: ["tech camp", "coding camp"],
    name: "iD Tech",
    url: "https://www.idtech.com/",
    description: "Technology and coding camps for kids and teens",
    category: "sports",
  },

  // ─── Arts Camps ────────────────────────────────────────────────────────────
  {
    keywords: ["arts camp", "music camp", "theater"],
    name: "Interlochen",
    url: "https://www.interlochen.org/",
    description: "Premier arts camp for music, theater, visual arts, and more",
    category: "arts",
  },
  {
    keywords: ["creative arts", "performing arts"],
    name: "Buck's Rock",
    url: "https://www.bucksrockcamp.com/",
    description: "Creative and performing arts camp experience",
    category: "arts",
  },

  // ─── STEM Camps ────────────────────────────────────────────────────────────
  {
    keywords: ["coding", "robotics", "technology", "STEM"],
    name: "iD Tech",
    url: "https://www.idtech.com/",
    description: "Coding, robotics, and STEM camps for ages 7-19",
    category: "stem",
  },
  {
    keywords: ["space", "NASA", "science camp"],
    name: "Space Camp",
    url: "https://www.spacecamp.com/",
    description: "NASA-affiliated space and science camp in Huntsville, AL",
    category: "stem",
  },
  {
    keywords: ["invention", "engineering", "STEM"],
    name: "Camp Invention",
    url: "https://www.invent.org/programs/camp-invention",
    description: "Invention and engineering programs from the National Inventors Hall of Fame",
    category: "stem",
  },

  // ─── Special Needs ─────────────────────────────────────────────────────────
  {
    keywords: ["medical", "special needs", "disability"],
    name: "SeriousFun Children's Network",
    url: "https://www.seriousfunnetwork.org/",
    description: "Free camps designed for children with serious illnesses",
    category: "special_needs",
  },
  {
    keywords: ["disability", "accessible", "inclusion"],
    name: "Easterseals Camps",
    url: "https://www.easterseals.com/our-programs/camping-recreation/",
    description: "Inclusive camping and recreation programs",
    category: "special_needs",
  },
  {
    keywords: ["autism", "ASD", "spectrum"],
    name: "Autism Speaks Summer Camps",
    url: "https://www.autismspeaks.org/summer-camps",
    description: "Camp programs designed for children on the autism spectrum",
    category: "special_needs",
  },

  // ─── General ───────────────────────────────────────────────────────────────
  {
    keywords: ["first time", "parent guide", "prepare"],
    name: "ACA Camp Parents",
    url: "https://www.acacamps.org/campers-families",
    description: "Parent resources for camp preparation and selection",
    category: "general",
  },
  {
    keywords: ["camp directory", "find camps"],
    name: "KidsCamps.com",
    url: "https://www.kidscamps.com/",
    description: "Comprehensive camp directory with reviews and filters",
    category: "general",
  },
];

/**
 * Find resources whose keywords appear in the given text.
 * Returns deduplicated results (by URL), max `limit`.
 */
export function findMatchingResources(
  text: string,
  limit = 8
): ResourceLink[] {
  const lower = text.toLowerCase();
  const scored = new Map<string, { link: ResourceLink; score: number }>();

  for (const link of RESOURCE_LINKS) {
    let score = 0;
    for (const kw of link.keywords) {
      if (lower.includes(kw.toLowerCase())) {
        score += 1;
      }
    }
    if (score > 0) {
      const existing = scored.get(link.url);
      if (!existing || score > existing.score) {
        scored.set(link.url, { link, score });
      }
    }
  }

  return Array.from(scored.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.link);
}

/**
 * Build an HTML snippet for the matched resource links.
 */
export function buildResourceLinksHtml(resources: ResourceLink[]): string {
  if (resources.length === 0) return "";

  const items = resources
    .map(
      (r) =>
        `<li class="resource-link-item">` +
        `<span class="resource-icon">\uD83D\uDD17</span>` +
        `<span><a class="resource-anchor" href="${r.url}" target="_blank" rel="noopener noreferrer">${r.name}</a>` +
        ` <span class="resource-desc">\u2014 ${r.description}</span></span>` +
        `</li>`
    )
    .join("\n");

  return (
    `<div class="resource-links-section">\n` +
    `<p class="resource-links-label">\uD83D\uDD17 Resources</p>\n` +
    `<ul class="resource-links-list">\n${items}\n</ul>\n` +
    `</div>`
  );
}
