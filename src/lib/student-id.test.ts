import { describe, it, expect } from "vitest";
import { studentIdValid } from "./unlock";
describe("student id", () => {
  it("accepts 5312323", () => expect(studentIdValid(" 5312323 ")).toBe(true));
  it("rejects others", () => expect(studentIdValid("5312324")).toBe(false));
});
