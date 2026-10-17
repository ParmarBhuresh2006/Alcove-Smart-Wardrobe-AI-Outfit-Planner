/**
 * packingService.js
 * Generates a smart packing list for a trip based on the user's wardrobe,
 * number of days, and planned occasions.
 * All logic is local — no external AI.
 */

// How many items of each type to pack per N days
function getPackingQuantity(category, days) {
  const rules = {
    tops:       Math.min(Math.ceil(days * 0.8), 8),
    bottoms:    Math.min(Math.ceil(days * 0.5), 5),
    outerwear:  Math.min(2, days > 3 ? 2 : 1),
    shoes:      Math.min(Math.ceil(days / 3), 3),
    dresses:    Math.min(Math.ceil(days * 0.3), 3),
    accessories:Math.min(2, 2),
    'one-piece':Math.min(1, 1),
  };
  return rules[category] || 1;
}

// Occasion priority — which occasions need which categories
const OCCASION_PRIORITY = {
  casual:  ['tops', 'bottoms', 'shoes'],
  dinner:  ['dresses', 'tops', 'bottoms', 'shoes', 'accessories'],
  beach:   ['tops', 'bottoms', 'shoes'],
  formal:  ['tops', 'bottoms', 'shoes', 'outerwear', 'accessories'],
  gym:     ['tops', 'bottoms', 'shoes'],
  party:   ['dresses', 'tops', 'bottoms', 'shoes', 'accessories'],
};

/**
 * Generate packing list from wardrobe and trip details.
 * @param {Object} params
 * @param {Array}  params.wardrobe  - Array of ClothingItem objects
 * @param {number} params.days      - Trip duration in days
 * @param {Array}  params.occasions - Array of occasion strings
 * @returns {Array} packingList
 */
function generatePackingList({ wardrobe, days, occasions }) {
  if (!wardrobe || wardrobe.length === 0) return [];

  const normOccasions = (occasions || ['casual']).map((o) => o.toLowerCase());

  // Determine needed categories based on occasions
  const neededCategories = new Set(['tops', 'bottoms', 'shoes']); // always needed
  for (const occ of normOccasions) {
    const cats = OCCASION_PRIORITY[occ] || OCCASION_PRIORITY.casual;
    for (const cat of cats) neededCategories.add(cat);
  }

  // Group wardrobe by category
  const byCategory = {};
  for (const item of wardrobe) {
    const cat = item.category || 'unknown';
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(item);
  }

  // Build packing list
  const packingList = [];
  for (const category of neededCategories) {
    const items = byCategory[category] || [];
    if (items.length === 0) continue;

    const qty = getPackingQuantity(category, days);
    // Sort by wornCount ascending (prefer less-worn items for variety)
    const sorted = items.sort((a, b) => (a.wornCount || 0) - (b.wornCount || 0));

    for (let i = 0; i < Math.min(qty, sorted.length); i++) {
      const item = sorted[i];
      packingList.push({
        clothingItemId: item._id || item.id,
        name: item.name || `${item.subType || item.category}`,
        category: item.category,
        imageUrl: item.imageUrl || null,
        quantity: 1,
        packed: false,
        isCustom: false,
      });
    }
  }

  return packingList;
}

module.exports = { generatePackingList };
