import {
  hasInvalidFillTypes,
  hasNonVisibleFills,
  hasOnlyVisibleStrokes,
  hasStyleId,
  hasValidImageStyle,
} from "./helpers";
import { Style, styles } from "./styles";

import randomizeIconSvg from "bundle-text:../randomize.svg";
import singleIconSvg from "bundle-text:../single.svg";

const ELIGIBLE_SHAPE_TYPES = [
  "RECTANGLE",
  "ELLIPSE",
  "VECTOR",
  "BOOLEAN_OPERATION",
];

const ELIGIBLE_CONTAINER_TYPES = ["INSTANCE", "FRAME", "GROUP"];

const ELIGIBLE_NODE_TYPES = [
  ...ELIGIBLE_SHAPE_TYPES,
  ...ELIGIBLE_CONTAINER_TYPES,
];

const CATEGORIES = ["Abstract", "People", "Characters", "Hypesquad", "Other"];

// create a node type that only includes the ELIGIBLE_SHAPE_TYPES
type EligibleShapeNode = Exclude<
  SceneNode,
  | GroupNode
  | SliceNode
  | ConnectorNode
  | CodeBlockNode
  | WidgetNode
  | EmbedNode
  | LinkUnfurlNode
  | MediaNode
>;

const usedStyles: Set<string> = new Set();
const styleCache = new Map<string, BaseStyle>();

let lastStyle: string | null = null;
let useSameAvatarParam: boolean = false;
let useSpecificCategoryStrParam: string | undefined;

figma.skipInvisibleInstanceChildren = true;

// Boolean option to use the same avatar for all selected nodes
figma.parameters.on("input", ({ query, key, result }) => {
  switch (key) {
    case "useSameAvatar":
      result.setSuggestions([
        {
          icon: randomizeIconSvg,
          name: "Randomize the avatar for each node",
          data: false,
        },
        {
          icon: singleIconSvg,
          name: "Use the same avatar for all nodes",
          data: true,
        },
      ]);
      break;
    case "useSpecificCategory":
      const filteredCategories = CATEGORIES.filter((category) =>
        category.toLowerCase().includes(query.toLowerCase())
      );
      result.setSuggestions(filteredCategories);
      break;
  }
});

figma.on("run", async ({ parameters }) => {
  const selection = figma.currentPage.selection.filter((node) =>
    ELIGIBLE_NODE_TYPES.includes(node.type)
  );

  // If nothing selected, show an error and close the plugin
  if (selection.length === 0) {
    figma.notify(
      `Select at least one node of the following type: ${ELIGIBLE_NODE_TYPES.join(
        ", "
      )}`,
      { error: true, timeout: 5000 }
    );
    // Close the plugin after the notification timeout
    setTimeout(() => {
      figma.closePlugin();
    }, 5000);

    return;
  }

  // Check and set the params
  // Note: Figma wasn't allowing optional chaining here
  if (parameters) {
    useSameAvatarParam = parameters.useSameAvatar;
    useSpecificCategoryStrParam = parameters.useSpecificCategory;
  }

  // Apply a random style to each selected node and close the plugin when finished
  try {
    await Promise.all(
      selection.map((node) =>
        applyRandomStyleToShapeNode(
          node,
          useSameAvatarParam,
          useSpecificCategoryStrParam
        )
      )
    );
    figma.closePlugin();
  } catch (err) {
    const error = err as Error;

    console.error("Error processing nodes:", error.message);
    figma.notify(error.message, { error: true, timeout: 5000 });

    // Close the plugin after the notification timeout
    setTimeout(() => {
      figma.closePlugin();
    }, 5000);
  }
});

// Function to get a random style key, avoiding reusing the same key
const getRandomStyle = (
  useSameAvatar?: boolean,
  useSpecificCategoryStr?: string
): string => {
  // reuse the last style if useSameAvatar is true
  if (useSameAvatar && lastStyle) {
    return lastStyle;
  }

  let style: Style;

  const eligibleStyles = useSpecificCategoryStr
    ? styles.filter((s) => s.name.includes(useSpecificCategoryStr))
    : styles;

  // If all styles have been used, reset the used styles
  if (usedStyles.size >= eligibleStyles.length) {
    usedStyles.clear();
  }

  // Get a random style key that hasn't been used yet
  do {
    style = eligibleStyles[Math.floor(Math.random() * eligibleStyles.length)];
  } while (usedStyles.has(style.key));

  // Add the selected key to the used styles set
  usedStyles.add(style.key);

  // store lastStyle for reuse
  lastStyle = style.key;

  return style.key;
};

// Function to get a style by key, caching the result for reuse (faster)
const getStyleByKeyAsync = async (styleKey: string): Promise<BaseStyle> => {
  if (styleCache.has(styleKey)) {
    return styleCache.get(styleKey)!;
  }

  const style = await figma.importStyleByKeyAsync(styleKey);
  styleCache.set(styleKey, style);
  return style;
};

// Function to apply a random style to an eligible node
const applyRandomStyleToShapeNode = async (
  node: SceneNode,
  useSameAvatar?: boolean,
  useSpecificCategoryStr?: string
): Promise<void> => {
  // If the node is an instance or a frame, process its children recursively
  if (ELIGIBLE_CONTAINER_TYPES.includes(node.type)) {
    const instanceNode = node as InstanceNode;
    await Promise.all(
      instanceNode.children.map((child) =>
        applyRandomStyleToShapeNode(
          child,
          useSameAvatar,
          useSpecificCategoryStr
        )
      )
    );
    return;
  }

  // If the node type is not supported, return early
  if (!ELIGIBLE_SHAPE_TYPES.includes(node.type)) {
    return;
  }

  // Check if the node is part of a boolean operation with a subtract operation, if so, apply the style to the parent node
  const isSubtractBooleanOperation =
    node.parent &&
    node.parent.type === "BOOLEAN_OPERATION" &&
    node.parent.booleanOperation === "SUBTRACT";

  const targetNode = isSubtractBooleanOperation ? node.parent : node;

  if (!("fillStyleId" in targetNode)) {
    return;
  }

  const shapeNode = node as EligibleShapeNode;

  if (
    hasOnlyVisibleStrokes(shapeNode) ||
    hasNonVisibleFills(shapeNode) ||
    (hasStyleId(targetNode) && hasInvalidFillTypes(shapeNode)) ||
    (hasStyleId(targetNode) &&
      !hasInvalidFillTypes(shapeNode) &&
      !hasValidImageStyle(shapeNode))
  ) {
    return;
  }

  // Try to apply a random style to the target node
  try {
    const randomStyle = getRandomStyle(useSameAvatar, useSpecificCategoryStr);
    const style = await getStyleByKeyAsync(randomStyle);
    targetNode.fillStyleId = style.id;
  } catch (error) {
    console.error("Error importing and/or applying style:", error);
  }
};
