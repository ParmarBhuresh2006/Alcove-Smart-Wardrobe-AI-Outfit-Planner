/**
 * recommendationEngine.js
 * Generates outfit recommendations from a user's wardrobe.
 *
 * ALL logic is local — no external AI. Uses:
 * - Color compatibility matrix
 * - Style compatibility rules
 * - Weather suitability rules
 * - Occasion suitability rules
 * - Season suitability rules
 */

// ─── Color compatibility matrix ───────────────────────────────────────────────
// For each color, list colors it pairs well with
const COLOR_COMPAT = {
  black:    ['white', 'gray', 'grey', 'blue', 'red', 'beige', 'cream', 'ivory', 'yellow', 'green', 'navy', 'purple', 'pink', 'camel', 'champagne'],
  white:    ['black', 'navy', 'blue', 'gray', 'grey', 'beige', 'brown', 'green', 'red', 'yellow', 'pink', 'purple', 'camel', 'indigo'],
  gray:     ['black', 'white', 'navy', 'blue', 'pink', 'red', 'yellow', 'purple', 'brown'],
  grey:     ['black', 'white', 'navy', 'blue', 'pink', 'red', 'yellow', 'purple', 'brown'],
  navy:     ['white', 'gray', 'grey', 'beige', 'cream', 'yellow', 'red', 'light blue', 'camel'],
  blue:     ['white', 'gray', 'grey', 'beige', 'brown', 'navy', 'black', 'yellow', 'camel'],
  indigo:   ['white', 'cream', 'beige', 'gray', 'camel', 'oat'],
  red:      ['black', 'white', 'navy', 'gray', 'grey', 'beige'],
  green:    ['white', 'beige', 'brown', 'black', 'gray', 'camel', 'cream'],
  yellow:   ['navy', 'white', 'black', 'gray', 'blue'],
  orange:   ['navy', 'white', 'black', 'brown', 'beige'],
  purple:   ['white', 'gray', 'black', 'beige', 'cream'],
  pink:     ['white', 'gray', 'navy', 'black', 'beige', 'ivory', 'pastel'],
  brown:    ['beige', 'white', 'blue', 'cream', 'gray', 'camel'],
  beige:    ['brown', 'navy', 'white', 'black', 'camel', 'cream', 'blue', 'green'],
  cream:    ['navy', 'brown', 'camel', 'black', 'blue', 'beige'],
  ivory:    ['navy', 'black', 'brown', 'camel', 'indigo', 'blue'],
  camel:    ['white', 'navy', 'black', 'brown', 'beige', 'cream', 'ivory', 'blue'],
  oat:      ['white', 'navy', 'black', 'brown', 'beige', 'cream', 'indigo', 'blue'],
  champagne:['black', 'navy', 'white', 'silver', 'gray'],
  maroon:   ['white', 'beige', 'gray', 'black', 'camel'],
  teal:     ['white', 'black', 'navy', 'gray', 'beige'],
  pastel:   ['white', 'pink', 'cream', 'gray', 'navy'],
};

// Neutral colors that pair with almost everything
const NEUTRAL_COLORS = new Set(['black', 'white', 'gray', 'grey', 'navy', 'beige', 'cream', 'ivory', 'camel', 'oat']);

// ─── Style compatibility ──────────────────────────────────────────────────────
const STYLE_COMPAT = {
  casual:    ['casual', 'sporty', 'streetwear', 'minimal'],
  formal:    ['formal', 'business', 'minimal'],
  sporty:    ['sporty', 'casual', 'streetwear'],
  streetwear:['streetwear', 'casual', 'sporty'],
  business:  ['business', 'formal', 'minimal', 'smart-casual'],
  party:     ['party', 'formal', 'minimal'],
  minimal:   ['minimal', 'casual', 'formal', 'business'],
  vintage:   ['vintage', 'casual', 'streetwear'],
  traditional:['traditional', 'formal'],
  unknown:   ['casual', 'formal', 'sporty', 'streetwear', 'business', 'party', 'minimal', 'vintage', 'traditional', 'unknown'],
};

// ─── Occasion → preferred style ──────────────────────────────────────────────
const OCCASION_STYLE = {
  casual:    ['casual', 'sporty', 'streetwear', 'minimal', 'vintage'],
  college:   ['casual', 'sporty', 'streetwear', 'minimal'],
  gym:       ['sporty'],
  office:    ['business', 'formal', 'minimal'],
  work:      ['business', 'formal', 'minimal', 'smart-casual'],
  interview: ['formal', 'business'],
  formal:    ['formal', 'business'],
  wedding:   ['formal', 'party'],
  party:     ['party', 'formal', 'minimal'],
  date:      ['party', 'minimal', 'casual'],
  travel:    ['casual', 'sporty', 'minimal'],
  beach:     ['casual', 'sporty'],
  festival:  ['casual', 'streetwear', 'vintage'],
  shopping:  ['casual', 'streetwear', 'minimal'],
  dinner:    ['formal', 'party', 'minimal'],
};

// ─── Season → temperature ranges ─────────────────────────────────────────────
const SEASON_TEMP = {
  summer: { min: 25, max: 45 },
  spring: { min: 15, max: 25 },
  autumn: { min: 10, max: 20 },
  winter: { min: -5, max: 15 },
  'all-year': { min: -10, max: 50 },
};

// ─── Category role in an outfit ───────────────────────────────────────────────
// Each complete outfit needs a top layer, bottom layer, and footwear
const OUTFIT_ROLES = {
  required: {
    top: ['tops', 'outerwear', 'one-piece', 'dresses'],
    bottom: ['bottoms', 'one-piece', 'dresses'],
    shoes: ['shoes'],
  },
  optional: ['accessories'],
};

// ─── Main recommendation function ────────────────────────────────────────────

/**
 * Generate outfit recommendations from the user's wardrobe.
 * @param {Object} params
 * @param {Array}  params.wardrobe - Array of ClothingItem objects
 * @param {string} params.occasion - Occasion string
 * @param {Object} params.weather  - { temperature, condition, humidity, rain }
 * @param {string} params.location - Location string
 * @param {number} params.count    - How many outfits to return
 * @returns {Array} Array of outfit recommendations sorted by score
 */
function generateOutfitRecommendations({ wardrobe, occasion, weather, location, count = 3 }) {
  const normalizedOccasion = normalizeOccasion(occasion);
  const temp = weather?.temperature ?? null;

  // Filter wardrobe by weather/season suitability
  const suitableItems = wardrobe.filter((item) => isSeasonallySuitable(item, temp));

  // Separate items by role
  const tops = suitableItems.filter((i) => OUTFIT_ROLES.required.top.includes(i.category));
  const bottoms = suitableItems.filter((i) => ['bottoms'].includes(i.category));
  const onePieces = suitableItems.filter((i) => ['one-piece', 'dresses'].includes(i.category));
  const shoes = suitableItems.filter((i) => i.category === 'shoes');
  const accessories = wardrobe.filter((i) => i.category === 'accessories');

  const combinations = [];

  // ── Approach 1: top + bottom + shoes ─────────────────────────────────────
  const topItems = tops.filter((i) => !['one-piece', 'dresses'].includes(i.category));
  for (const top of topItems) {
    for (const bottom of bottoms) {
      for (const shoe of shoes) {
        const items = [top, bottom, shoe];
        const score = scoreOutfit({ items, occasion: normalizedOccasion, weather, accessories });
        if (score.total >= 30) { // minimum threshold
          const accessory = pickBestAccessory(accessories, items, normalizedOccasion);
          const outfitItems = accessory ? [...items, accessory] : items;
          combinations.push({ items: outfitItems, ...score });
        }
      }
    }
  }

  // ── Approach 2: one-piece / dress + shoes ─────────────────────────────────
  for (const piece of onePieces) {
    for (const shoe of shoes) {
      const items = [piece, shoe];
      const score = scoreOutfit({ items, occasion: normalizedOccasion, weather, accessories });
      if (score.total >= 30) {
        const accessory = pickBestAccessory(accessories, items, normalizedOccasion);
        const outfitItems = accessory ? [...items, accessory] : items;
        combinations.push({ items: outfitItems, ...score });
      }
    }
  }

  if (combinations.length === 0) return [];

  // Sort by score, deduplicate, return top N
  const sorted = combinations.sort((a, b) => b.total - a.total);
  const unique = deduplicateOutfits(sorted);

  return unique.slice(0, count).map((outfit, idx) => ({
    id: `outfit-${idx + 1}`,
    name: generateOutfitName(outfit, normalizedOccasion, weather),
    items: outfit.items,
    score: outfit.total,
    scoreBreakdown: {
      weather: outfit.weather,
      occasion: outfit.occasion,
      color: outfit.color,
      style: outfit.style,
      season: outfit.season,
    },
    reasons: outfit.reasons,
    occasion: normalizedOccasion,
  }));
}

// ─── Scoring ─────────────────────────────────────────────────────────────────

function scoreOutfit({ items, occasion, weather, accessories }) {
  const reasons = [];
  let weatherScore = 0;
  let occasionScore = 0;
  let colorScore = 0;
  let styleScore = 0;
  let seasonScore = 0;

  // ── Weather score (30 points) ─────────────────────────────────────────────
  const temp = weather?.temperature ?? null;
  const condition = (weather?.condition || '').toLowerCase();
  const isRainy = weather?.rain === true || condition.includes('rain');

  if (temp !== null) {
    const allSuitable = items.every((i) => isSeasonallySuitable(i, temp));
    if (allSuitable) {
      weatherScore += 20;
      if (temp > 25) reasons.push('Suitable for warm weather');
      else if (temp < 15) reasons.push('Suitable for cool weather');
      else reasons.push('Suitable for mild weather');
    }

    // Penalize heavy outerwear in heat
    const hasHeavyOuterwear = items.some((i) => i.category === 'outerwear' && i.season === 'winter');
    if (temp > 28 && hasHeavyOuterwear) weatherScore -= 10;

    // Reward layering when it's cool
    const hasOuterwear = items.some((i) => i.category === 'outerwear');
    if (temp < 18 && hasOuterwear) {
      weatherScore += 10;
      reasons.push('Good layering for cooler temperatures');
    }
  } else {
    weatherScore = 20; // neutral when no weather data
  }
  weatherScore = Math.max(0, Math.min(30, weatherScore));

  // ── Occasion score (25 points) ─────────────────────────────────────────────
  const preferredStyles = OCCASION_STYLE[occasion] || OCCASION_STYLE.casual;
  const matchingStyles = items.filter((i) => preferredStyles.includes(i.style));
  const styleMatchRatio = items.length > 0 ? matchingStyles.length / items.length : 0;
  occasionScore = Math.round(styleMatchRatio * 20);

  if (matchingStyles.length > 0) {
    reasons.push(`Appropriate for ${capitalise(occasion)}`);
  }

  // Bonus: formality match
  const needsFormal = ['interview', 'formal', 'office', 'work', 'wedding'].includes(occasion);
  const needsCasual = ['gym', 'beach', 'casual', 'college'].includes(occasion);
  const hasFormal = items.some((i) => i.formality === 'formal' || i.formality === 'smart-casual');
  const hasCasual = items.some((i) => i.formality === 'casual');

  if (needsFormal && hasFormal) { occasionScore += 5; reasons.push('Formal attire for the occasion'); }
  if (needsCasual && hasCasual) { occasionScore += 5; reasons.push('Casual and comfortable'); }
  occasionScore = Math.min(25, occasionScore);

  // ── Color score (20 points) ────────────────────────────────────────────────
  const colors = items.map((i) => (i.primaryColor || 'unknown').toLowerCase()).filter((c) => c !== 'unknown');
  if (colors.length >= 2) {
    let colorMatches = 0;
    let totalPairs = 0;
    for (let i = 0; i < colors.length; i++) {
      for (let j = i + 1; j < colors.length; j++) {
        totalPairs++;
        if (colorsAreCompatible(colors[i], colors[j])) colorMatches++;
      }
    }
    const colorRatio = totalPairs > 0 ? colorMatches / totalPairs : 0;
    colorScore = Math.round(colorRatio * 20);
    if (colorRatio > 0.6) reasons.push('Colors complement each other well');
  } else {
    colorScore = 14; // neutral with single color
  }
  colorScore = Math.min(20, colorScore);

  // ── Style score (15 points) ────────────────────────────────────────────────
  const styles = items.map((i) => i.style || 'unknown');
  const dominantStyle = getMostCommon(styles);
  const compatStyles = STYLE_COMPAT[dominantStyle] || STYLE_COMPAT.unknown;
  const styleCompatCount = styles.filter((s) => compatStyles.includes(s) || s === dominantStyle).length;
  styleScore = Math.round((styleCompatCount / styles.length) * 15);
  if (styleCompatCount === styles.length) reasons.push('Consistent style combination');
  styleScore = Math.min(15, styleScore);

  // ── Season score (10 points) ───────────────────────────────────────────────
  const seasonScores = items.map((i) => getSeasonScore(i, weather));
  seasonScore = Math.round(seasonScores.reduce((s, v) => s + v, 0) / seasonScores.length);
  seasonScore = Math.min(10, seasonScore);

  const total = Math.round(weatherScore + occasionScore + colorScore + styleScore + seasonScore);

  return { total, weather: weatherScore, occasion: occasionScore, color: colorScore, style: styleScore, season: seasonScore, reasons };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isSeasonallySuitable(item, temperature) {
  if (temperature === null) return true;
  const season = item.season || 'all-year';
  const range = SEASON_TEMP[season] || SEASON_TEMP['all-year'];
  return temperature >= range.min - 5 && temperature <= range.max + 5;
}

function getSeasonScore(item, weather) {
  if (!weather?.temperature) return 8;
  const temp = weather.temperature;
  const season = item.season || 'all-year';
  const range = SEASON_TEMP[season] || SEASON_TEMP['all-year'];
  const inRange = temp >= range.min && temp <= range.max;
  return inRange ? 10 : 5;
}

function colorsAreCompatible(colorA, colorB) {
  if (colorA === colorB) return false; // same color is boring, not incompatible
  if (NEUTRAL_COLORS.has(colorA) || NEUTRAL_COLORS.has(colorB)) return true;
  const compatList = COLOR_COMPAT[colorA] || [];
  return compatList.includes(colorB);
}

function pickBestAccessory(accessories, outfitItems, occasion) {
  if (accessories.length === 0) return null;
  const outfitColors = outfitItems.map((i) => (i.primaryColor || '').toLowerCase());
  const compatAccessory = accessories.find((a) => {
    const ac = (a.primaryColor || '').toLowerCase();
    return outfitColors.some((oc) => colorsAreCompatible(oc, ac) || NEUTRAL_COLORS.has(ac));
  });
  return compatAccessory || null;
}

function deduplicateOutfits(outfits) {
  const seen = new Set();
  return outfits.filter((o) => {
    const key = o.items.map((i) => i._id?.toString() || i.id).sort().join('-');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function getMostCommon(arr) {
  const freq = {};
  for (const v of arr) freq[v] = (freq[v] || 0) + 1;
  return Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] || 'unknown';
}

function normalizeOccasion(occasion) {
  const raw = (occasion || 'casual').toLowerCase().trim();
  const MAP = {
    'casual outing': 'casual',
    'office work': 'work',
    'job interview': 'interview',
    'business casual': 'work',
    'formal meeting': 'formal',
    'shopping trip': 'shopping',
    'coffee': 'casual',
    'lunch': 'casual',
    'brunch': 'casual',
    'workout': 'gym',
    'exercise': 'gym',
    'running': 'gym',
    'evening dinner': 'dinner',
    'night out': 'party',
    'club': 'party',
    'wedding reception': 'wedding',
    'university': 'college',
    'school': 'college',
    'class': 'college',
  };
  return MAP[raw] || raw;
}

function capitalise(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function generateOutfitName(outfit, occasion, weather) {
  const temp = weather?.temperature;
  const names = {
    casual: 'The Everyday Look',
    formal: 'The Sharp Statement',
    party: 'The Night Out',
    gym: 'The Active Set',
    work: 'The Work Ready',
    office: 'The Office Ensemble',
    interview: 'The First Impression',
    date: 'The Date Night',
    travel: 'The Traveller',
    beach: 'The Beach Day',
    wedding: 'The Wedding Guest',
    college: 'The Campus Look',
    dinner: 'The Dinner Look',
    festival: 'The Festival Fit',
  };
  let name = names[occasion] || 'The Curated Look';
  if (temp !== null) {
    if (temp > 28) name += ' (Summer Edit)';
    else if (temp < 12) name += ' (Winter Layers)';
  }
  return name;
}

module.exports = { generateOutfitRecommendations };
