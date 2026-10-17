/**
 * wardrobeAnalysis.js
 * Computes analytics about a user's wardrobe — category coverage, color distribution,
 * style distribution, gap detection, and must-have recommendations.
 * All computation is local — no external AI needed.
 */

// Category targets — how many items are "enough" in each category
const CATEGORY_TARGETS = {
  tops: 12,
  bottoms: 8,
  outerwear: 4,
  shoes: 5,
  dresses: 4,
  accessories: 6,
  'one-piece': 3,
};

// Occasion coverage requirements — which categories an occasion needs
const OCCASION_REQUIREMENTS = {
  casual: ['tops', 'bottoms', 'shoes'],
  formal: ['tops', 'bottoms', 'shoes', 'outerwear'],
  party: ['dresses', 'shoes', 'accessories'],
  gym: ['tops', 'bottoms', 'shoes'],
  work: ['tops', 'bottoms', 'shoes', 'outerwear'],
  date: ['dresses', 'tops', 'bottoms', 'shoes', 'accessories'],
  travel: ['tops', 'bottoms', 'outerwear', 'shoes'],
  beach: ['tops', 'bottoms', 'shoes'],
};

/**
 * Compute full wardrobe analysis.
 * @param {Array} items - Array of ClothingItem documents
 * @returns {Object}
 */
function computeWardrobeAnalysis(items) {
  const totalItems = items.length;

  // ── Category counts ──────────────────────────────────────────────────────
  const categories = {};
  for (const [key, target] of Object.entries(CATEGORY_TARGETS)) {
    categories[key] = { count: 0, target, coverage: 0, gap: false, label: formatLabel(key) };
  }
  for (const item of items) {
    const cat = item.category || 'unknown';
    if (categories[cat]) {
      categories[cat].count++;
    }
  }
  for (const cat of Object.values(categories)) {
    cat.coverage = Math.min(100, Math.round((cat.count / cat.target) * 100));
    cat.gap = cat.coverage < 60;
  }

  // ── Color distribution ───────────────────────────────────────────────────
  const colors = {};
  for (const item of items) {
    const color = (item.primaryColor || 'unknown').toLowerCase();
    colors[color] = (colors[color] || 0) + 1;
  }

  // ── Style distribution ───────────────────────────────────────────────────
  const styles = {};
  for (const item of items) {
    const style = item.style || 'unknown';
    styles[style] = (styles[style] || 0) + 1;
  }

  // ── Season distribution ──────────────────────────────────────────────────
  const seasons = {};
  for (const item of items) {
    const season = item.season || 'unknown';
    seasons[season] = (seasons[season] || 0) + 1;
  }

  // ── Occasion coverage ────────────────────────────────────────────────────
  const presentCategories = new Set(items.map((i) => i.category).filter(Boolean));
  const occasionCoverage = {};
  for (const [occasion, required] of Object.entries(OCCASION_REQUIREMENTS)) {
    const covered = required.filter((c) => presentCategories.has(c)).length;
    occasionCoverage[occasion] = {
      covered,
      required: required.length,
      percentage: Math.round((covered / required.length) * 100),
    };
  }

  // ── Missing categories ───────────────────────────────────────────────────
  const missingCategories = Object.entries(categories)
    .filter(([, data]) => data.count === 0)
    .map(([key]) => key);

  // ── Gap summary text ─────────────────────────────────────────────────────
  const gapCategories = Object.entries(categories)
    .filter(([, data]) => data.gap)
    .map(([key, data]) => ({ key, ...data }));

  // ── Dominant color analysis ──────────────────────────────────────────────
  const colorEntries = Object.entries(colors).sort((a, b) => b[1] - a[1]);
  const dominantColors = colorEntries.slice(0, 5);

  const neutralColors = ['black', 'white', 'gray', 'grey', 'beige', 'cream', 'ivory', 'navy'];
  const accentColors = colorEntries.filter(([c]) => !neutralColors.includes(c));
  const hasColorBalance = accentColors.length > 0 && dominantColors.some(([c]) => neutralColors.includes(c));

  // ── Must-have recommendations ────────────────────────────────────────────
  const recommendations = generateRecommendations({
    categories,
    colors,
    styles,
    seasons,
    occasionCoverage,
    totalItems,
    hasColorBalance,
  });

  // ── Gap summary text ─────────────────────────────────────────────────────
  let gapSummary = '';
  if (gapCategories.length === 0) {
    gapSummary = 'Your wardrobe is well-balanced across all categories.';
  } else {
    const gapNames = gapCategories.map((g) => `${g.label} (${g.count}/${g.target})`).join(', ');
    gapSummary = `Your wardrobe is low on: ${gapNames}. `;
    if (recommendations.length > 0) {
      gapSummary += `Consider adding ${recommendations.slice(0, 2).map((r) => r.name).join(' and ')} to unlock more outfit combinations.`;
    }
  }

  return {
    totalItems,
    categories,
    colors,
    styles,
    seasons,
    occasionCoverage,
    missingCategories,
    gapCategories,
    recommendations,
    gapSummary,
    dominantColors,
    hasColorBalance,
  };
}

/**
 * Generate must-have item recommendations based on wardrobe gaps.
 */
function generateRecommendations({ categories, colors, styles, seasons, occasionCoverage, totalItems, hasColorBalance }) {
  const recs = [];

  // Check category gaps
  const categoryRecs = {
    tops: { name: 'Versatile plain t-shirt', reason: 'Foundation of any casual outfit', priority: 'High' },
    bottoms: { name: 'Well-fitted dark jeans', reason: 'Works across casual and smart-casual occasions', priority: 'High' },
    outerwear: { name: 'Neutral blazer or jacket', reason: 'Elevates any outfit and adds warmth', priority: 'Medium' },
    shoes: { name: 'White or neutral sneakers', reason: 'Pairs with nearly every casual outfit', priority: 'High' },
    dresses: { name: 'Versatile midi dress', reason: 'Covers date, party, and casual occasions', priority: 'Medium' },
    accessories: { name: 'Simple leather belt', reason: 'Finishes formal and smart-casual looks', priority: 'Low' },
    'one-piece': { name: 'Classic jumpsuit', reason: 'Effortless one-item outfit for many occasions', priority: 'Low' },
  };

  for (const [cat, data] of Object.entries(categories)) {
    if (data.gap && categoryRecs[cat]) {
      recs.push(categoryRecs[cat]);
    }
  }

  // Check color gaps
  const colorsList = Object.keys(colors).map((c) => c.toLowerCase());
  if (!colorsList.some((c) => ['black', 'navy', 'charcoal'].includes(c))) {
    recs.push({ name: 'Dark neutral bottom (black or navy)', reason: 'Anchors outfit combinations', priority: 'High' });
  }
  if (!colorsList.includes('white')) {
    recs.push({ name: 'White top', reason: 'Pairs with every color in your wardrobe', priority: 'High' });
  }

  // Check for formal gap
  const formalOccasion = occasionCoverage.formal;
  if (formalOccasion && formalOccasion.percentage < 60) {
    recs.push({ name: 'Formal shirt and trousers', reason: 'Needed to cover formal and work occasions', priority: 'High' });
  }

  // Check for summer/winter gap
  const summerItems = Object.entries(seasons).find(([s]) => s === 'summer');
  const winterItems = Object.entries(seasons).find(([s]) => s === 'winter');
  if (!summerItems || summerItems[1] < 2) {
    recs.push({ name: 'Light linen or cotton shirt', reason: 'Needed for warm-weather occasions', priority: 'Medium' });
  }
  if (!winterItems || winterItems[1] < 2) {
    recs.push({ name: 'Warm sweater or knitwear', reason: 'Needed for cold-weather layering', priority: 'Medium' });
  }

  // Deduplicate and limit
  const seen = new Set();
  return recs.filter((r) => {
    if (seen.has(r.name)) return false;
    seen.add(r.name);
    return true;
  }).slice(0, 8);
}

function formatLabel(key) {
  return key.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

module.exports = { computeWardrobeAnalysis };
