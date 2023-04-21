import { EligibleShapeNode } from "./types";

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
