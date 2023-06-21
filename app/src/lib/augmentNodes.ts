import { Node as ReactFlowNode } from "reactflow";
import { NodeLocation } from "api";

/**
 * Receives the nodes before they are passed to react flow
 * and augments them with persistent and client side data
 * - node location
 * - selected
 */
export function augmentNodes(
  nodes: ReactFlowNode[],
  nodeLocation: NodeLocation,
  selectedNodes: string[]
) {
  return nodes.map((node) => {
    let n = {
      ...node,
      selected: selectedNodes.includes(node.id),
    };
    if (nodeLocation[node.id]) {
      return {
        ...n,
        position: {
          x: nodeLocation[n.id].x,
          y: nodeLocation[n.id].y,
        },
      };
    }
    return n;
  });
}
