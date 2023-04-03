import { ElementsDefinition, NodeDefinition, EdgeDefinition } from "cytoscape";
import { SqProject } from "@quri/squiggle-lang";
import { NodeLetStatement } from "./types";
import { AnyPeggyNode } from "@quri/squiggle-lang/dist/src/ast/peggyHelpers";

/**
 * Converts compiled squiggle code to nodes and edges
 */
export function squiggleToGraph(sq: SqProject): ElementsDefinition {
  const nodes: NodeDefinition[] = [];
  const edges: EdgeDefinition[] = [];

  const items = sq["items"];
  const program = items.get("main");
  const statements = program.rawParse.value.statements;

  for (const statement of statements) {
    if (isLetStatement(statement)) {
      const variableName = statement.variable.value;
      const line = statement.variable.location.start.line;

      // Check if node already exists in graph
      if (!nodes.find((n) => n.data.id === variableName)) {
        nodes.push({
          data: {
            id: variableName,
            line,
          },
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
}

function isLetStatement(node: any): node is NodeLetStatement {
  return node.type === "LetStatement";
}
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
