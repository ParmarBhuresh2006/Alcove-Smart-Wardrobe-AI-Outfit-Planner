// Mock wardrobe / outfit data for the design-first prototype

export const CATEGORIES = [
  { key: 'tops', label: 'Tops', count: 24, target: 30 },
  { key: 'bottoms', label: 'Bottoms', count: 12, target: 20 },
  { key: 'outerwear', label: 'Outerwear', count: 6, target: 8 },
  { key: 'shoes', label: 'Shoes', count: 9, target: 12 },
  { key: 'dresses', label: 'Dresses', count: 4, target: 10 },
  { key: 'accessories', label: 'Accessories', count: 15, target: 15 },
];

export const WARDROBE_ITEMS = [
  {
    id: 'w1',
    name: 'Ivory Knit Sweater',
    category: 'Tops',
    color: 'Ivory',
    pattern: 'Knit',
    status: 'available',
    wornCount: 12,
    lastWorn: '3 days ago',
    image: 'https://images.unsplash.com/photo-1621198059871-0d5f9b449233?crop=entropy&cs=srgb&fm=jpg&w=800&q=80',
  },
  {
    id: 'w2',
    name: 'Striped Linen Shirt',
    category: 'Tops',
    color: 'Blue',
    pattern: 'Striped',
    status: 'available',
    wornCount: 7,
    lastWorn: '1 week ago',
    image: 'https://images.unsplash.com/photo-1761896898277-5141377f2a12?crop=entropy&cs=srgb&fm=jpg&w=800&q=80',
  },
  {
    id: 'w3',
    name: 'Vintage Denim',
    category: 'Bottoms',
    color: 'Indigo',
    pattern: 'Solid',
    status: 'laundry',
    wornCount: 22,
    lastWorn: 'yesterday',
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?crop=entropy&cs=srgb&fm=jpg&w=800&q=80',
  },
  {
    id: 'w4',
    name: 'Oat Cardigan',
    category: 'Outerwear',
    color: 'Oat',
    pattern: 'Solid',
    status: 'available',
    wornCount: 5,
    lastWorn: '2 weeks ago',
    image: 'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?crop=entropy&cs=srgb&fm=jpg&w=800&q=80',
  },
  {
    id: 'w5',
    name: 'Runner Sneakers',
    category: 'Shoes',
    color: 'White',
    pattern: 'Solid',
    status: 'available',
    wornCount: 30,
    lastWorn: 'today',
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?crop=entropy&cs=srgb&fm=jpg&w=800&q=80',
  },
  {
    id: 'w6',
    name: 'Pastel Sweatshirt',
    category: 'Tops',
    color: 'Pink',
    pattern: 'Solid',
    status: 'available',
    wornCount: 4,
    lastWorn: '5 days ago',
    image: 'https://images.pexels.com/photos/9594422/pexels-photo-9594422.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    id: 'w7',
    name: 'Wool Overcoat',
    category: 'Outerwear',
    color: 'Camel',
    pattern: 'Solid',
    status: 'available',
    wornCount: 3,
    lastWorn: 'last month',
    image: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?crop=entropy&cs=srgb&fm=jpg&w=800&q=80',
  },
  {
    id: 'w8',
    name: 'Silk Slip Dress',
    category: 'Dresses',
    color: 'Champagne',
    pattern: 'Solid',
    status: 'available',
    wornCount: 2,
    lastWorn: '3 weeks ago',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?crop=entropy&cs=srgb&fm=jpg&w=800&q=80',
  },
];

export const OCCASIONS = ['Casual', 'Formal', 'Gym', 'Party', 'Work', 'Date'];

export const TODAY_OUTFIT = {
  title: "Today's Look",
  subtitle: 'Casual · 18°C · Overcast',
  items: [WARDROBE_ITEMS[0], WARDROBE_ITEMS[2], WARDROBE_ITEMS[4]],
};

export const OUTFIT_SUGGESTION = {
  rationale:
    "Layering the Oat Cardigan over your Ivory Knit balances warmth with the crisp 18°C forecast, while Vintage Denim keeps the palette grounded. Runner Sneakers finish it off casual — perfect for a coffee-to-studio kind of day.",
  items: [WARDROBE_ITEMS[3], WARDROBE_ITEMS[0], WARDROBE_ITEMS[2], WARDROBE_ITEMS[4]],
};

export const CALENDAR_ENTRIES = {
  3: WARDROBE_ITEMS[0],
  7: WARDROBE_ITEMS[3],
  11: WARDROBE_ITEMS[7],
  14: WARDROBE_ITEMS[1],
  18: WARDROBE_ITEMS[6],
  22: WARDROBE_ITEMS[5],
  25: WARDROBE_ITEMS[4],
  28: WARDROBE_ITEMS[2],
};

export const GAP_SUMMARY =
  "Your wardrobe leans heavily on Tops and Accessories but is critically short on Dresses (4/10) and Bottoms (12/20). Consider adding two tailored trousers and a versatile midi dress — both would unlock ~14 new outfit combinations across your Casual and Formal occasions.";

export const WARDROBES = [
  { id: 'home', name: 'Home', items: 68, primary: true },
  { id: 'hostel', name: 'Hostel', items: 22 },
  { id: 'travel', name: 'Travel Capsule', items: 12 },
];
