import { describe, expect, it } from "vitest";
import { buildApolloUrl, isApolloUrl, parseApolloKeywords } from "./apollo";

const SAMPLE =
  "https://app.apollo.io/?_gl=1*f1a0lf#/people?page=1&personTitles[]=owner&personTitles[]=director&personLocations[]=United%20States&organizationNumEmployeesRanges[]=1%2C5&qOrganizationKeywordTags[]=excavation%20services&qOrganizationKeywordTags[]=excavation&qOrganizationKeywordTags[]=excavators&qOrganizationKeywordTags[]=land%20excavation&qOrganizationKeywordTags[]=drainage%20solutions&includedOrganizationKeywordFields[]=tags&sortAscending=false&sortByField=%5Bnone%5D";

describe("parseApolloKeywords", () => {
  it("extracts every keyword tag from a pasted Apollo URL", () => {
    expect(parseApolloKeywords(SAMPLE)).toEqual([
      "excavation services",
      "excavation",
      "excavators",
      "land excavation",
      "drainage solutions",
    ]);
  });

  it("returns an empty list for non-Apollo text", () => {
    expect(parseApolloKeywords("roofing contractors")).toEqual([]);
  });
});

describe("buildApolloUrl", () => {
  it("always targets the United States", () => {
    const url = buildApolloUrl(["roofing"]);
    expect(url).toContain(`personLocations${encodeURIComponent("[]")}=United+States`);
  });

  it("includes every keyword as an organization keyword tag", () => {
    const url = buildApolloUrl(["Roofing", "roof repair"]);
    expect(parseApolloKeywords(url)).toEqual(["roofing", "roof repair"]);
  });

  it("includes decision-maker titles", () => {
    const url = buildApolloUrl(["roofing"]);
    expect(url).toContain("personTitles");
    expect(url).toContain("owner");
  });
});

describe("isApolloUrl", () => {
  it("recognizes Apollo links", () => {
    expect(isApolloUrl(SAMPLE)).toBe(true);
    expect(isApolloUrl("https://google.com")).toBe(false);
  });
});
