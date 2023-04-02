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

      // Check if node already exists in graph
      if (!nodes.find((n) => n.data.id === variableName)) {
        nodes.push({
          data: {
            id: variableName,
          },
        });
      }

      // Find other nodes that this node depends on
      const dependencies = findRefsRecursively(statement.value);

      // Create nodes for an dependencies that don't already exist
      for (const dependency of dependencies) {
        if (!nodes.find((n) => n.data.id === dependency)) {
          nodes.push({
            data: {
              id: dependency,
            },
          });
        }
      }

      for (const dependency of dependencies) {
        edges.push({
          data: {
            id: `${variableName}-${dependency}`,
            source: variableName,
            target: dependency,
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
  const refs: string[] = [];

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
    refs.push(value.value);
  }

  return refs;
}
