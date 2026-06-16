/**
 * Synonym dictionary for product search.
 *
 * Maps a canonical term → array of variant terms users might search for.
 * Covers English ↔ Indonesian, abbreviations, and common misspellings
 * so "notebook" maps to "laptop", "PC" maps to "komputer", etc.
 *
 * Each KEY should be a term from the PRODUCT_KEYWORDS list in chatService.js.
 * Each VALUE is an array of alternate terms that mean the same thing.
 */
const SYNONYM_MAP = {
  // ── Computing & Electronics ──
  laptop: ["notebook", "ultrabook", "chromebook", "netbook", "macbook", "thinkpad", "zenbook", "matebook", "ideapad", "pavilion", "envy", "spectre", "surface pro", "vaio", "legion", "predator", "rog", "tuf", "inspiron", "xps", "latitude", "thinkbook", "gram", "swift", "vivobook", "expertbook"],
  komputer: ["computer", "pc", "desktop", "all-in-one", "workstation"],
  computer: ["komputer", "pc", "desktop", "all-in-one", "workstation"],
  smartphone: ["hp", "handphone", "ponsel", "android", "smart phone", "iphone", "galaxy", "redmi", "poco", "realme", "oppo", "vivo", "infinix", "techno"],
  hp: ["smartphone", "handphone", "ponsel", "android", "telpon"],
  handphone: ["smartphone", "hp", "ponsel", "android"],
  phone: ["smartphone", "hp", "handphone", "ponsel"],
  tablet: ["ipad", "tab", "table", "tablet pc", "galaxy tab", "surface", "kindle", "matepad", "lenovo tab"],
  gaming: ["game", "gamer", "console", "playstation", "nintendo", "xbox"],

  // ── Fashion ──
  sepatu: ["shoes", "sneakers", "loafers", "boots", "sandal", "slip-on", "kasual", "air max", "ultraboost", "converse", "vans", "reebok", "new balance", "nike", "adidas"],
  shoes: ["sepatu", "sneakers", "loafers", "boots", "sandal"],
  sneakers: ["sepatu", "shoes", "kets", "olahraga"],
  baju: ["clothes", "pakaian", "atasan", "blouse", "kaos", "kemeja"],
  clothes: ["baju", "pakaian", "atasan"],
  kaos: ["t-shirt", "kemeja", "baju"],
  kemeja: ["shirt", "baju", "kaos"],
  dress: ["gaun", "rok", "gown"],
  tas: ["bag", "backpack", "ransel", "tote", "slingbag", "selempang"],
  bag: ["tas", "backpack", "ransel", "tote", "slingbag"],
  jam: ["watch", "arloji", "jam tangan", "rolex", "casio", "seiko", "fossil", "smartwatch", "apple watch", "g-shock"],
  watch: ["jam", "arloji", "jam tangan", "rolex", "casio", "seiko", "fossil", "smartwatch", "apple watch", "g-shock"],

  // ── Beauty & Fragrance ──
  parfum: ["fragrance", "wewangian", "perfume", "minyak wangi", "body mist"],
  fragrance: ["parfum", "wewangian", "perfume", "minyak wangi"],
  makeup: ["make-up", "cosmetics", "riasan", "lipstik", "foundation"],
  skincare: ["skin care", "perawatan kulit", "serum", "moisturizer", "sunscreen"],
  kecantikan: ["beauty", "cantik", "makeup", "skincare"],

  // ── Home & Furniture ──
  furniture: ["perabot", "meubel", "furnitur", "sofa", "lemari"],
  meja: ["table", "desk", "meja kerja"],
  kursi: ["chair", "bangku", "sofa"],

  // ── Sports & Accessories ──
  olahraga: ["sports", "gym", "fitness", "yoga", "lari", "sepeda"],
  sports: ["olahraga", "gym", "fitness"],
  aksesoris: ["accessories", "asesoris", "perlengkapan"],
  accessories: ["aksesoris", "asesoris", "perlengkapan"],

  // ── Vehicles ──
  mobil: ["car", "mobil", "kendaraan", "sedan", "suv", "mpv"],
  motor: ["motorcycle", "sepeda motor", "vespa", "matic", "bebek", "honda", "yamaha", "kawasaki", "suzuki", "ducati", "bmw motor", "harley", "triumph", "ktm"],

  // ── Electronics (general) ──
  elektronik: ["electronics", "gadget", "digital", "elektrik"],
  electronics: ["elektronik", "gadget", "digital"],

  // ── Brand abbreviations / variants ──
  macbook: ["mac book", "macbook pro", "macbook air", "apple macbook"],
  iphone: ["ip", "apple iphone"],
  samsung: ["samsung galaxy", "galaxy"],
  xiaomi: ["mi", "redmi", "poco", "xiaomi mi"],
};

// ── Reverse map: synonym → canonical keyword(s) ────────────────────
// Built lazily from SYNONYM_MAP so "notebook" → ["laptop"],
// "pc" → ["komputer", "computer"], "arloji" → ["jam", "watch"].
let _reverseMap = null;
const getReverseMap = () => {
  if (_reverseMap) return _reverseMap;
  _reverseMap = {};
  for (const [canonical, variants] of Object.entries(SYNONYM_MAP)) {
    for (const variant of variants) {
      if (!_reverseMap[variant]) _reverseMap[variant] = [];
      _reverseMap[variant].push(canonical);
    }
  }
  return _reverseMap;
};

/**
 * Expand a list of terms with their synonyms — both forward (canonical → variants)
 * AND reverse (variant → canonical → its variants).
 *
 * This means raw query tokens like "notebook" or "arloji" (which are synonym VALUES,
 * not keys in SYNONYM_MAP) also get fully expanded.
 *
 * @param {string[]} terms - Array of search terms (canonical keywords and/or raw tokens)
 * @returns {string[]} Deduplicated array of all expanded terms
 *
 * @example
 * expandKeywords(["laptop"])
 * // → ["laptop", "notebook", "ultrabook", "chromebook", "netbook"]
 *
 * expandKeywords(["notebook", "nike"])
 * // → ["notebook", "laptop", "ultrabook", "chromebook", "netbook", "nike"]
 * //    ("notebook" reverse-maps to "laptop", which then expands to its synonyms)
 *
 * expandKeywords(["arloji"])
 * // → ["arloji", "jam", "watch", "jam tangan"]
 * //    ("arloji" reverse-maps to both "jam" and "watch")
 */
const expandKeywords = (terms) => {
  if (!terms || !Array.isArray(terms) || terms.length === 0) {
    return terms || [];
  }

  const expanded = new Set(terms);
  const reverse = getReverseMap();

  for (const term of terms) {
    // 1. Forward: term is a canonical key → add its synonyms
    const synonyms = SYNONYM_MAP[term];
    if (synonyms) {
      for (const syn of synonyms) expanded.add(syn);
    }

    // 2. Reverse: term is a synonym of some canonical → add that canonical + its synonyms
    const canonicals = reverse[term];
    if (canonicals) {
      for (const canonical of canonicals) {
        expanded.add(canonical);
        const moreSynonyms = SYNONYM_MAP[canonical];
        if (moreSynonyms) {
          for (const syn of moreSynonyms) expanded.add(syn);
        }
      }
    }
  }

  return [...expanded];
};

/**
 * Reverse synonym lookup: find which keywords are "mentioned" in the message,
 * either directly OR through one of their synonyms.
 *
 * @param {string} message - The user's message
 * @param {string[]} keywordList - List of canonical keywords to check
 * @returns {string[]} Matched canonical keywords
 *
 * @example
 * // SYNONYM_MAP.laptop includes "notebook"
 * detectKeywordsViaSynonyms("cari notebook murah", ["laptop", "baju"])
 * // → ["laptop"]
 */
const detectKeywordsViaSynonyms = (message, keywordList) => {
  if (!message || !keywordList || keywordList.length === 0) return [];
  const msg = message.toLowerCase();
  const matched = [];

  for (const kw of keywordList) {
    // Direct match
    if (msg.includes(kw)) {
      matched.push(kw);
      continue;
    }
    // Synonym match: check if any variant of this keyword appears in the message
    const synonyms = SYNONYM_MAP[kw];
    if (synonyms && Array.isArray(synonyms)) {
      for (const syn of synonyms) {
        if (msg.includes(syn)) {
          matched.push(kw);
          break;
        }
      }
    }
  }
  return matched;
};

module.exports = {
  SYNONYM_MAP,
  expandKeywords,
  detectKeywordsViaSynonyms,
};
