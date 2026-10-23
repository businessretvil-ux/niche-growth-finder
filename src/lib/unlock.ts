export const UNLOCK_KEY = "niche-finder-unlocked";
export const COUPON = "appointfunnels#58";

export const PLANS = [
  {
    id: "starter",
    name: "Starter",
    credits: 100,
    price: 20,
    blurb: "For students testing their first niches.",
    features: ["100 niche analyses / month", "Apollo US lead filter for every niche", "Full Google Doc reports", "5-pillar niche verdict"],
  },
  {
    id: "pro",
    name: "Pro",
    credits: 250,
    price: 40,
    blurb: "For agencies comparing markets weekly.",
    features: ["250 niche analyses / month", "Everything in Starter", "Sub-niche keyword packs", "Priority AI speed"],
    popular: true,
  },
  {
    id: "scale",
    name: "Scale",
    credits: 500,
    price: 75,
    blurb: "For teams running outreach at volume.",
    features: ["500 niche analyses / month", "Everything in Pro", "Team sharing of reports", "Early access to new filters"],
  },
];

export function readUnlocked(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(UNLOCK_KEY) === "1" || document.cookie.includes("nf_unlocked=1");
}

export function persistUnlock() {
  window.localStorage.setItem(UNLOCK_KEY, "1");
  document.cookie = "nf_unlocked=1; max-age=31536000; path=/; SameSite=Lax";
}

export function couponValid(code: string): boolean {
  return code.trim().toLowerCase() === COUPON;
}
