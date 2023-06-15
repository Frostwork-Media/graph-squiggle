import {
  ElementsDefinition,
  NodeDefinition,
  EdgeDefinition,
  NodeDataDefinition,
} from "cytoscape";
import { SqProject } from "@quri/squiggle-lang";
import { NodeLetStatement, SquiggleVariableValue } from "./types";
import { AnyPeggyNode } from "@quri/squiggle-lang/dist/src/ast/peggyHelpers";
import { getTextFromLocationRange } from "./getTextFromLocationRange";

/**
 * Converts compiled squiggle code to cytosacpe elements
 */
export function sqProjectToCyElements(
  sq: SqProject,
  code: string
): ElementsDefinition {
  const nodes: NodeDefinition[] = [];
  const edges: EdgeDefinition[] = [];

  const items = sq["items"];
  const program = items.get("main");
  const statements = program.rawParse.value.statements;

  for (const statement of statements) {
    if (isLetStatement(statement)) {
      const variableName = statement.variable.value;
      const line = statement.variable.location.start.line;
      const value = getTextFromLocationRange(statement.value.location, code);

      const data: NodeDataDefinition = {
        id: variableName,
        line,
        value,
      };

      let valueType: SquiggleVariableValue = "unknown";
      if (
        statement.value.type === "Block" &&
        statement.value.statements.length === 1
      ) {
        if (statement.value.statements[0].type !== "Call") {
          valueType = "single";
          if (
            statement.value.statements[0].type === "Float" ||
            statement.value.statements[0].type === "Integer"
          ) {
            data.numValue = statement.value.statements[0].value;
          }
        } else {
          if (
            statement.value.statements[0].fn.type === "Identifier" &&
            statement.value.statements[0].args.length === 2 &&
            statement.value.statements[0].fn.value ===
              "credibleIntervalToDistribution" &&
            // and every arg is a float or integer
            statement.value.statements[0].args.every((arg) => {
              return arg.type === "Float" || arg.type === "Integer";
            })
          ) {
            valueType = "distribution";

            // add lower to data
            if (
              statement.value.statements[0].args[0].type === "Float" ||
              statement.value.statements[0].args[0].type === "Integer"
            ) {
              data.numLower = statement.value.statements[0].args[0].value;
            }

            // add upper to date
            if (
              statement.value.statements[0].args[1].type === "Float" ||
              statement.value.statements[0].args[1].type === "Integer"
            ) {
              data.numUpper = statement.value.statements[0].args[1].value;
            }
          } else {
            valueType = "derived";
          }
        }
      }

      data.valueType = valueType;

      // Check if node already exists in graph
      if (!nodes.find((n) => n.data.id === variableName)) {
        nodes.push({
          data,
        });
      }

      // Find other nodes that this node depends on
      const dependencies = findRefsRecursively(statement.value);

      // Create nodes for an dependencies that don't already exist
      for (const dependency of dependencies) {
        if (!nodes.find((n) => n.data.id === dependency.variable)) {
          nodes.push({
            data: {
              id: dependency.variable,
              line: dependency.line,
            },
          });
        }
      }

      for (const dependency of dependencies) {
        edges.push({
          data: {
            id: `${variableName}-${dependency.variable}`,
            source: variableName,
            target: dependency.variable,
          },
        });
      }
    }
  }

  return { nodes, edges };

  /**
   * Recursively finds all references to other nodes
   */
  function findRefsRecursively(value: AnyPeggyNode) {
    const refs: { variable: string; line: number }[] = [];

    if ("statements" in value) {
      for (const statement of value.statements) {
        refs.push(...findRefsRecursively(statement));
      }
    }

    if ("args" in value) {
      for (const arg of value.args) {
        refs.push(...findRefsRecursively(arg));
      }
    }

    if (value.type === "Identifier") {
      refs.push({
        variable: value.value,
        line: value.location.start.line,
      });
    }

    return refs;
  }
}

function isLetStatement(node: any): node is NodeLetStatement {
  return node.type === "LetStatement";
}
