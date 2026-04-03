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
  { value: "cafe",        label: "Café / Coffee Shop",   emoji: "☕" },
  { value: "restaurant",  label: "Restaurant",            emoji: "🍽️" },
  { value: "bakery",      label: "Bakery",                emoji: "🥐" },
  { value: "retail",      label: "Retail Store",          emoji: "🛍️" },
  { value: "gym",         label: "Gym",        emoji: "💪" },
  { value: "salon",       label: "Salon & Beauty",        emoji: "💇" },
  { value: "medical",     label: "Medical / Dental",      emoji: "🏥" },
  { value: "grocery",     label: "Grocery / Supermarket", emoji: "🛒" },
];

// ── Sub-categories per business type ─────────────────────────────────────────
export const SUBCATEGORIES = {
  cafe: [
    { value: "specialty",   label: "Specialty / Artisan Coffee" },
    { value: "casual",      label: "Casual Coffee Shop" },
    { value: "coworking",   label: "Co-working Café" },
    { value: "dessert",     label: "Dessert & Coffee" },
    { value: "bookshop",    label: "Bookshop Café" },
  ],
  restaurant: [
    { value: "italian",     label: "Italian" },
    { value: "sushi",       label: "Sushi / Japanese" },
    { value: "fastfood",    label: "Fast Food" },
    { value: "arabic",      label: "Arabic / Levantine" },
    { value: "indian",      label: "Indian" },
    { value: "chinese",     label: "Chinese" },
    { value: "mexican",     label: "Mexican" },
    { value: "burgers",     label: "Burgers & Grills" },
    { value: "seafood",     label: "Seafood" },
    { value: "vegan",       label: "Vegan / Vegetarian" },
    { value: "steakhouse",  label: "Steakhouse" },
    { value: "pizza",       label: "Pizza" },
  ],
  bakery: [
    { value: "artisan",     label: "Artisan Bread" },
    { value: "pastry",      label: "Pastry & Croissants" },
    { value: "cakes",       label: "Custom Cakes" },
    { value: "glutenfree",  label: "Gluten-Free" },
  ],
  retail: [
    { value: "fashion",     label: "Fashion & Clothing" },
    { value: "electronics", label: "Electronics" },
    { value: "homegoods",   label: "Home Goods" },
    { value: "books",       label: "Books & Stationery" },
    { value: "gifts",       label: "Gifts & Accessories" },
    { value: "sports",      label: "Sports & Outdoors" },
  ],
  gym: [
    { value: "mixed",       label: "Mixed (Men & Women)" },
    { value: "women",  label: "Women Only" },
    { value: "men",    label: "Men Only" },
    { value: "yoga",        label: "Yoga / Pilates Studio" },
    { value: "crossfit",    label: "CrossFit / Functional" },
    { value: "martial",     label: "Martial Arts" },
    { value: "swimming",    label: "Swimming" },
  ],
  salon: [
    { value: "mixed",       label: "Mixed (Men & Women)" },
    { value: "women_only",  label: "Women Only" },
    { value: "men_only",    label: "Barbershop / Men Only" },
    { value: "nails",       label: "Nails & Spa" },
    { value: "kids",        label: "Kids Hair Salon" },
  ],
  medical: [
    { value: "dental",      label: "Dental Clinic" },
    { value: "gp",          label: "General Practice" },
    { value: "dermatology", label: "Dermatology" },
    { value: "pediatric",   label: "Pediatric" },
    { value: "physio",      label: "Physiotherapy" },
    { value: "ophthalmology",label: "Ophthalmology" },
    { value: "pharmacy",    label: "Pharmacy" },
  ],
  grocery: [
    { value: "supermarket",  label: "Full Supermarket" },
    { value: "minimart",     label: "Mini Mart / Corner Store" },
    { value: "organic",      label: "Organic & Health Foods" },
    { value: "butcher",      label: "Butcher / Meat Shop" },
    { value: "fruits",       label: "Fruits & Vegetables" },
  ],
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