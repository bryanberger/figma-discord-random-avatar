import { EligibleInstanceNode, EligibleShapeNode, Style } from "./types";
import { isEligibleShapeNode, sleep } from "./helpers";
import { getStylesAsync } from "./styleFetch";
import randomizeIconSvg from "bundle-text:../randomize.svg";
import singleIconSvg from "bundle-text:../single.svg";

const ELIGIBLE_SHAPE_TYPES = [
  "RECTANGLE",
  "ELLIPSE",
  "VECTOR",
  "BOOLEAN_OPERATION",
];

const ELIGIBLE_CONTAINER_TYPES = ["COMPONENT", "INSTANCE", "FRAME", "GROUP"];

const ELIGIBLE_NODE_TYPES = [
  ...ELIGIBLE_SHAPE_TYPES,
  ...ELIGIBLE_CONTAINER_TYPES,
];

const usedStyles: Set<string> = new Set();
const styleCache = new Map<string, BaseStyle>();

let useSameAvatarParam: boolean = false;
let useSpecificCategoryStrParam: string | undefined;
let styles: Style[] = [];
let categories: string[] = [];

figma.skipInvisibleInstanceChildren = true;

// Boolean option to use the same avatar for all selected nodes
figma.parameters.on("input", async ({ query, key, result }) => {
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
      if (categories.length === 0) {
        // Get styles from the avatar library via the Figma API, localstorage, or hardcoded fallbacks
        // Generate categories dynamically from the Styles, uses Set to remove duplicates
        styles = await getStylesAsync();

        const categoryRegex = new RegExp(process.env.STYLE_CATEGORY_REGEX!);
        categories = Array.from(
          new Set(
            styles.map((style) => {
              const match = categoryRegex.exec(style.name);
              return match ? match[1] : "";
            })
          )
        );
      }

      // Set results
      result.setSuggestions(
        categories
          .filter((category) =>
            category.toLowerCase().includes(query.toLowerCase())
          )
          .map((category) => ({
            name: category,
            data: category,
          }))
      );
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
      `Select at least one node of type: ${ELIGIBLE_NODE_TYPES.join(", ")}`,
      { error: true, timeout: 5000 }
    );
    // Close the plugin after the notification timeout
    await sleep(5000);
    figma.closePlugin();
  }

  // Check and set the params
  // Note: Figma wasn't allowing optional chaining here
  if (parameters) {
    useSameAvatarParam = parameters.useSameAvatar;
    useSpecificCategoryStrParam = parameters.useSpecificCategory;
  }

  // Apply a random style to each selected node and close the plugin when finished
  try {
    // Get styles on run too
    if (styles.length === 0) {
      styles = await getStylesAsync();
    }

    // Begin the process of applying random styles to the selected nodes
    const initialRandomStyleKey = getRandomStyle(useSpecificCategoryStrParam);
    await Promise.all(
      selection.map((node) => {
        const randomStyleKey = useSameAvatarParam
          ? initialRandomStyleKey
          : getRandomStyle(useSpecificCategoryStrParam);
        return applyRandomStyleToShapeNode(node, randomStyleKey);
      })
    );

    // Close the plugin when done
    figma.closePlugin();
  } catch (err) {
    const error = err as Error;

    console.error("Error processing nodes:", error.message);
    figma.notify(error.message, { error: true, timeout: 5000 });

    // Close the plugin after the notification timeout
    await sleep(5000);
    figma.closePlugin();
  }
});

const getRandomStyle = (useSpecificCategoryStr?: string): string => {
  let style: Style;

  let eligibleStyles = useSpecificCategoryStr
    ? styles.filter((s) => s.name.includes(useSpecificCategoryStr))
    : styles;

  // If all styles have been used, reset the used styles
  if (usedStyles.size >= eligibleStyles.length) {
    usedStyles.clear();
  }

  // Get a random style key that hasn't been used yet
  if (eligibleStyles.length > 0) {
    do {
      style = eligibleStyles[Math.floor(Math.random() * eligibleStyles.length)];
    } while (usedStyles.has(style.key));

    // Add the selected key to the used styles set
    usedStyles.add(style.key);

    return style.key;
  } else {
    throw new Error(
      `No eligible styles found for category: "${useSpecificCategoryStr}", try running without a category.`
    );
  }
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
  styleKey: string
): Promise<void> => {
  // If the node is an instance, frame, or group, process its children recursively
  if (ELIGIBLE_CONTAINER_TYPES.includes(node.type)) {
    const instanceNode = node as EligibleInstanceNode;
    await Promise.all(
      instanceNode.children.map((childNode) => {
        const newRandomStyleKey = useSameAvatarParam
          ? styleKey
          : getRandomStyle(useSpecificCategoryStrParam);
        return applyRandomStyleToShapeNode(childNode, newRandomStyleKey);
      })
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

  if (!isEligibleShapeNode(node as EligibleShapeNode, targetNode)) {
    return;
  }

  // Try to apply a random style to the target node
  try {
    const style = await getStyleByKeyAsync(styleKey);
    targetNode.fillStyleId = style.id;
  } catch (error) {
    console.error("Error importing and/or applying style:", error);
  }
};
