/** Apollo search URL helpers: build US-targeted people searches and read keywords back out of pasted URLs. */

export const APOLLO_TITLES = [
  "owner",
  "director",
  "president",
  "partner",
  "ceo",
  "co-founder",
  "founder",
  "business owner",
  "general manager",
  "managing partner",
] as const;

export const APOLLO_LOCATION = "United States";

/** Build an Apollo people-search URL for the given niche keywords, filtered to United States decision-makers. */
export function buildApolloUrl(keywords: string[]): string {
  const clean = keywords.map((k) => k.trim().toLowerCase()).filter(Boolean);
  const params = new URLSearchParams();
  params.set("page", "1");
  for (const t of APOLLO_TITLES) params.append("personTitles[]", t);
  params.append("personLocations[]", APOLLO_LOCATION);
  params.append("organizationNumEmployeesRanges[]", "1,5");
  for (const k of clean) params.append("qOrganizationKeywordTags[]", k);
  params.append("includedOrganizationKeywordFields[]", "tags");
  params.append("includedOrganizationKeywordFields[]", "name");
  params.set("sortAscending", "false");
  params.set("sortByField", "[none]");
  return `https://app.apollo.io/#/people?${params.toString()}`;
}

/** Extract the niche keywords (qOrganizationKeywordTags) from a pasted Apollo search URL. */
export function parseApolloKeywords(url: string): string[] {
  const out: string[] = [];
  const re = /qOrganizationKeywordTags(?:%5B%5D|\[\])=([^&#]*)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(url)) !== null) {
    const kw = decodeURIComponent((m[1] ?? "").replace(/\+/g, " ")).trim();
    if (kw && !out.includes(kw)) out.push(kw);
  }
  return out;
}

/** True when the pasted text looks like an Apollo search link. */
export function isApolloUrl(url: string): boolean {
  return /app\.apollo\.io/i.test(url);
}
