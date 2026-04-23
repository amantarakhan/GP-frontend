// ── Color palette ────────────────────────────────────────────────────────────
export const COLORS = {
  brand:      "#3f7d58",
  brandDark:  "#2d5c3f",
  accent:     "#e6d3ad",
  success:    "#D1FAE5",
  sidebar:    "#1F2937",
  text:       "#687280",
  card:       "#F5F2E1",
  dashBg:     "#F7F7F2",
  appBg:      "#FCFCFD",
  dark:       "#1F2937",
};

// ── Business types ───────────────────────────────────────────────────────────
export const BUSINESS_TYPES = [
  { value: "cafe",                    label: "Café / Coffee Shop",    emoji: "☕" },
  { value: "restaurant",              label: "Restaurant",             emoji: "🍽️" },
  { value: "bakery",                  label: "Bakery",                 emoji: "🥐" },
  { value: "clothing_store",          label: "Clothing Store",         emoji: "🛍️" },
  { value: "gym",                     label: "Gym",                    emoji: "💪" },
  { value: "beauty_salon",            label: "Salon & Beauty",         emoji: "💇" },
  { value: "grocery_or_supermarket",  label: "Grocery / Supermarket",  emoji: "🛒" },
  { value: "pharmacy",                label: "Pharmacy",               emoji: "💊" },
  { value: "clinic",                  label: "Medical Clinic",         emoji: "🩺" },
  { value: "hospital",                label: "Hospital",               emoji: "🏥" },
  { value: "dentist",                 label: "Dentist",                emoji: "🦷" },
];

// ── Sub-categories per business type ─────────────────────────────────────────
export const SUBCATEGORIES = {
  cafe: [
    { value: "specialty coffee", label: "Specialty Coffee" },
    { value: "arabic coffee",    label: "Arabic Coffee" },
    { value: "cafe & desserts",  label: "Cafe & Desserts" },
    { value: "juice bar",        label: "Juice Bar" },
    { value: "bubble tea",       label: "Bubble Tea" },
    { value: "tea house",        label: "Tea House" },
  ],
  restaurant: [
    { value: "arabic",     label: "Arabic" },
    { value: "jordanian",  label: "Jordanian" },
    { value: "lebanese",   label: "Lebanese" },
    { value: "syrian",     label: "Syrian" },
    { value: "italian",    label: "Italian" },
    { value: "pizza",      label: "Pizza" },
    { value: "pasta",      label: "Pasta" },
    { value: "burgers",    label: "Burgers" },
    { value: "fast food",  label: "Fast Food" },
    { value: "american",   label: "American" },
    { value: "sushi",      label: "Sushi" },
    { value: "japanese",   label: "Japanese" },
    { value: "chinese",    label: "Chinese" },
    { value: "asian",      label: "Asian" },
    { value: "indian",     label: "Indian" },
    { value: "turkish",    label: "Turkish" },
    { value: "grills",     label: "Grills" },
    { value: "shawarma",   label: "Shawarma" },
    { value: "mandi",      label: "Mandi" },
    { value: "kebab",      label: "Kebab" },
    { value: "seafood",    label: "Seafood" },
    { value: "healthy",    label: "Healthy" },
    { value: "keto",       label: "Keto" },
    { value: "breakfast",  label: "Breakfast" },
    { value: "desserts",   label: "Desserts" },
    { value: "bakery",     label: "Bakery" },
  ],
  bakery: [],
  clothing_store: [
    { value: "clothing",          label: "Clothing" },
    { value: "women's clothing",  label: "Women's Clothing" },
    { value: "shoes",             label: "Shoes" },
    { value: "sportswear",        label: "Sportswear" },
    { value: "department store",  label: "Department Store" },
  ],
  gym: [
    { value: "mixed",  label: "Mixed (Men & Women)" },
    { value: "women",  label: "Women Only" },
    { value: "men",    label: "Men Only" },
  ],
  beauty_salon: [
    { value: "hair salon", label: "Hair Salon" },
    { value: "nail salon", label: "Nail Salon" },
    { value: "spa",        label: "Spa" },
    { value: "barber",     label: "Barber" },
  ],
  grocery_or_supermarket: [],
  pharmacy:  [],
  clinic:    [],
  hospital:  [],
  dentist:   [],
};

// ── Max scan radius per place_type (mirrors backend MAX_RADIUS exactly) ──────
export const MAX_RADIUS = {
  restaurant:             1500,
  cafe:                   1000,
  gym:                    2000,
  pharmacy:               1000,
  clinic:                 1500,
  hospital:               3000,
  supermarket:            1500,
  bakery:                 1000,
  clothing_store:          800,
  beauty_salon:           1000,
  dentist:                1500,
  grocery_or_supermarket: 1500,
};

// ── Radius labels ────────────────────────────────────────────────────────────
export const RADIUS_LABELS = [
  { max: 500,  label: "Walking" },
  { max: 1500, label: "Neighborhood" },
  { max: 3000, label: "District" },
  { max: 5000, label: "City Zone" },
];

export function getRadiusLabel(val) {
  return RADIUS_LABELS.find((r) => val <= r.max)?.label ?? "City Zone";
}

export function formatRadius(val) {
  return val < 1000 ? `${val}m` : `${(val / 1000).toFixed(1)} km`;
}

// ── Nav items ────────────────────────────────────────────────────────────────
export const NAV_ITEMS = [
  {
    id:    "dashboard",
    label: "Dashboard",
    path:  "/dashboard",
  },
  {
    id:    "scan",
    label: "New Scan",
    path:  "/scan",
    badge: null,
  },
  {
    id:    "reports",
    label: "Saved Reports",
    path:  "/reports",
    badge: null,
  },
  {
    id:    "compare",
    label: "Compare",
    path:  "/compare",
    badge: null,
  },
];

// ── Mock competitor data ─────────────────────────────────────────────────────
export const MOCK_COMPETITORS = [
  { id: 1, name: "The Green Cup",      type: "Café",       rating: 4.5, distance: "180m",  status: "high" },
  { id: 2, name: "Boulangerie Miel",   type: "Bakery",     rating: 4.2, distance: "340m",  status: "medium" },
  { id: 3, name: "Urban Roast",        type: "Café",       rating: 4.7, distance: "520m",  status: "high" },
  { id: 4, name: "Pasta e Vino",       type: "Restaurant", rating: 3.9, distance: "610m",  status: "low" },
  { id: 5, name: "Corner Deli",        type: "Retail",     rating: 4.0, distance: "720m",  status: "medium" },
  { id: 6, name: "Sakura Sushi",       type: "Restaurant", rating: 4.3, distance: "850m",  status: "medium" },
];

// ── Mock saved reports ───────────────────────────────────────────────────────
export const MOCK_REPORTS = [
  {
    id: 1,
    title:       "Downtown SF — Café Analysis",
    location:    "San Francisco, CA",
    date:        "Feb 14, 2026",
    score:       82,
    competitors: 9,
    saturation:  38,
    status:      "strong",
  },
  {
    id: 2,
    title:       "Mission District — Restaurant",
    location:    "San Francisco, CA",
    date:        "Feb 10, 2026",
    score:       61,
    competitors: 17,
    saturation:  65,
    status:      "moderate",
  },
  {
    id: 3,
    title:       "SoMa — Fitness Studio",
    location:    "San Francisco, CA",
    date:        "Feb 5, 2026",
    score:       74,
    competitors: 5,
    saturation:  29,
    status:      "strong",
  },
];