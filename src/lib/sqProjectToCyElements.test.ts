import { sqProjectToCyElements } from "./sqProjectToCyElements";
import { test, describe, expect } from "vitest";
import { run, SqProject } from "@quri/squiggle-lang";

describe("sqProjectToCyElements", () => {
  test("creates node for each expression", () => {
    const code = "i = 1\nj = 2";
    expect(sqProjectToCyElements(getProject(code), code)).toEqual({
      nodes: [
        {
          data: {
            id: "i",
            line: 1,
            numValue: 1,
            value: "1",
            valueType: "single",
          },
        },
        {
          data: {
            id: "j",
            line: 2,
            numValue: 2,
            value: "2",
            valueType: "single",
          },
        },
      ],
      edges: [],
    });
  });

  test("creates edges when one variable references another", () => {
    const code = "i = 1\nj = i";
    expect(sqProjectToCyElements(getProject(code), code)).toEqual({
      nodes: [
        {
          data: {
            id: "i",
            line: 1,
            numValue: 1,
            value: "1",
            valueType: "single",
          },
        },
        {
          data: {
            id: "j",
            line: 2,
            value: "i",
            valueType: "single",
          },
        },
      ],
      edges: [
        {
          data: {
            id: "j-i",
            source: "j",
            target: "i",
          },
        },
      ],
    });
  });

  test("creates edges when one variable references another in a nested expression", () => {
    const code = "i = 1\nj = i + 1";
    expect(sqProjectToCyElements(getProject(code), code)).toEqual({
      nodes: [
        {
          data: {
            id: "i",
            line: 1,
            numValue: 1,
            value: "1",
            valueType: "single",
          },
        },
        {
          data: {
            id: "j",
            line: 2,
            value: "i + 1",
            valueType: "derived",
          },
        },
      ],
      edges: [
        {
          data: {
            id: "j-i",
            source: "j",
            target: "i",
          },
        },
      ],
    });
  });

  test("creates edges when one variable references another in a block expression", () => {
    const code = "i = 1\nj = { i + 1 }";
    expect(sqProjectToCyElements(getProject(code), code)).toEqual({
      nodes: [
        {
          data: {
            id: "i",
            line: 1,
            numValue: 1,
            value: "1",
            valueType: "single",
          },
        },
        {
          data: {
            id: "j",
            line: 2,
            value: "{ i + 1 }",
            valueType: "derived",
          },
        },
      ],
      edges: [
        {
          data: {
            id: "j-i",
            source: "j",
            target: "i",
          },
        },
      ],
    });
  });

  test("value string for node with block should contain all lines", () => {
    const code = "j = { k = 2\nk + 4 }";
    expect(sqProjectToCyElements(getProject(code), code)).toEqual({
      nodes: [
        {
          data: {
            id: "j",
            line: 1,
            value: "{ k = 2\nk + 4 }",
            valueType: "unknown",
          },
        },
        {
          data: {
            id: "k",
            line: 2,
          },
        },
      ],
      edges: [
        {
          data: {
            id: "j-k",
            source: "j",
            target: "k",
          },
        },
      ],
    });
  });

  test.skip("should get valueType for nodes created inside blocks too", () => {
    const code = "j = { k = 2\nk + 4 }";
    expect(sqProjectToCyElements(getProject(code), code)).toEqual({
      nodes: [
        {
          data: {
            id: "j",
            line: 1,
            value: "{ k = 2\nk + 4 }",
            valueType: "unknown",
          },
        },
        {
          data: {
            id: "k",
            line: 2,
            value: "2",
            valueType: "single",
          },
        },
      ],
      edges: [
        {
          data: {
            id: "j-k",
            source: "j",
            target: "k",
          },
        },
      ],
    });
  });

  test("creates nodes for variables created inside block", () => {
    const code = "i = 1\nj = { k = 2\nk + 4 }";
    expect(sqProjectToCyElements(getProject(code), code)).toEqual({
      nodes: [
        {
          data: {
            id: "i",
            line: 1,
            numValue: 1,
            value: "1",
            valueType: "single",
          },
        },
        {
          data: {
            id: "j",
            line: 2,
            value: "{ k = 2\nk + 4 }",
            valueType: "unknown",
          },
        },
        {
          data: {
            id: "k",
            line: 3,
          },
        },
      ],
      edges: [
        {
          data: {
            id: "j-k",
            source: "j",
            target: "k",
          },
        },
      ],
    });
  });

  test("stores line number in node data", () => {
    const code = "i = 1\nj = 2";
    expect(sqProjectToCyElements(getProject(code), code)).toEqual({
      nodes: [
        {
          data: {
            id: "i",
            line: 1,
            numValue: 1,
            value: "1",
            valueType: "single",
          },
        },
        {
          data: {
            id: "j",
            line: 2,
            numValue: 2,
            value: "2",
            valueType: "single",
          },
        },
      ],
      edges: [],
    });
  });

  test("a variable should be derived if it references any variables, even in a distribution", () => {
    const code = "i = 1\nj = i to 2";
    expect(sqProjectToCyElements(getProject(code), code)).toEqual({
      nodes: [
        {
          data: {
            id: "i",
            line: 1,
            numValue: 1,
            value: "1",
            valueType: "single",
          },
        },
        {
          data: {
            id: "j",
            line: 2,
            value: "i to 2",
            valueType: "derived",
          },
        },
      ],
      edges: [
        {
          data: {
            id: "j-i",
            source: "j",
            target: "i",
          },
        },
      ],
    });
  });
});

function getProject(code: string): SqProject {
  const result = run(code).result;
  if (!result.ok) {
    throw new Error(result.value.toString());
  }
  return result.value.location.project;
}
