import { ELIGIBLE_CONTAINER_TYPES, ELIGIBLE_SHAPE_TYPES } from "./constants";
import { EligibleInstanceNode, EligibleShapeNode } from "./types";

export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function hasOnlyVisibleStrokes(node: SceneNode): boolean {
  if (!("strokes" in node) || !("fills" in node)) {
    return false;
  }

  const hasVisibleStrokes = node.strokes.some((stroke) => stroke.visible);
  const hasNoVisibleFills =
    node.fills === figma.mixed || node.fills.every((fill) => !fill.visible);

  return hasVisibleStrokes && hasNoVisibleFills;
}

export function hasNonVisibleFills(node: SceneNode): boolean {
  return (
    "fills" in node &&
    (node.fills === figma.mixed || node.fills.every((fill) => !fill.visible))
  );
}

export function hasStyleId(node: SceneNode): boolean {
  return "fillStyleId" in node && !!node.fillStyleId;
}

export function hasInvalidFillTypes(node: SceneNode): boolean {
  return (
    "fills" in node &&
    (node.fills === figma.mixed ||
      node.fills.every(
        (fill: Paint) => fill.type !== "SOLID" && fill.type !== "IMAGE"
      ))
  );
}

export function hasValidImageStyle(node: SceneNode): boolean {
  return (
    "fills" in node &&
    Array.isArray(node.fills) &&
    node.fills.some((fill) => fill.type === "IMAGE")
  );
}

// function to loop over selection recursively and count the number of eligible nodes
export function countEligibleNodes(nodes: readonly SceneNode[]): number {
  let count = 0;

  nodes.forEach((node) => {
    if (ELIGIBLE_SHAPE_TYPES.includes(node.type)) {
      count += 1;
    } else if (ELIGIBLE_CONTAINER_TYPES.includes(node.type)) {
      const instanceNode = node as EligibleInstanceNode;
      count += countEligibleNodes(instanceNode.children);
    }
  });

  return count;
}

// If any of the ineligible conditions are present, the node is not eligible.
export function isEligibleShapeNode(
  node: EligibleShapeNode,
  targetNode: SceneNode
): boolean {
  return (
    !hasOnlyVisibleStrokes(node) &&
    !hasNonVisibleFills(node) &&
    (!hasStyleId(targetNode) || !hasInvalidFillTypes(node)) &&
    (!hasStyleId(targetNode) || hasValidImageStyle(node))
  );
}
