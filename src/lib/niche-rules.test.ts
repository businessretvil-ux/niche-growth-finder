import { describe, expect, it } from "vitest";
import { judgeNiche } from "./niche-rules";

describe("judgeNiche", () => {
  it("rejects a niche with ticket under $2,500", () => {
    expect(judgeNiche(2499, true).good).toBe(false);
  });
  it("accepts a growing niche at exactly $2,500", () => {
    expect(judgeNiche(2500, true).good).toBe(true);
  });
  it("rejects a high-ticket niche that is not growing", () => {
    expect(judgeNiche(10000, false).good).toBe(false);
  });
});
