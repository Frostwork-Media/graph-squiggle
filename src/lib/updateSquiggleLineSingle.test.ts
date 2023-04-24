import { describe, test, expect } from "vitest";

import {
  updateSquiggleLineSingle,
  updateSquiggleLineDistribution,
} from "./updateSquiggleLineSingle";

describe("updateSquiggleLineSingle", () => {
  test("should update the value of a variable", () => {
    const code = `x = 1`;
    const expected = `x = 2`;

    const actual = updateSquiggleLineSingle(code, 1, 2);

    expect(actual).toBe(expected);
  });
});

describe("updateSquiggleLineDistribution", () => {
  test("should update the value of a distribution", () => {
    const code = `x = 1 to 2`;
    const expected = `x = 2 to 3`;

    const actual = updateSquiggleLineDistribution(code, 1, 2, 3);

    expect(actual).toBe(expected);
  });

  test("should work when numbers have decimals", () => {
    const code = `x = 1.1 to 2.2`;
    const expected = `x = 2.2 to 3.3`;

    const actual = updateSquiggleLineDistribution(code, 1, 2.2, 3.3);

    expect(actual).toBe(expected);
  });

  test("should work when decimal numbers have no leading zero", () => {
    const code = `x = .1 to .2`;
    const expected = `x = 0.2 to 0.3`;

    const actual = updateSquiggleLineDistribution(code, 1, 0.2, 0.3);

    expect(actual).toBe(expected);
  });
});
