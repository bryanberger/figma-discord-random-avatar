import { EligibleInstanceNode, EligibleShapeNode, Style } from "./types";
import { countEligibleNodes, isEligibleShapeNode, sleep } from "./helpers";
import { getStylesAsync } from "./styleFetch";
import { generateAvatarAsync } from "./openai";

import randomizeIconSvg from "bundle-text:../randomize.svg";
import singleIconSvg from "bundle-text:../single.svg";
import {
  ELIGIBLE_CONTAINER_TYPES,
  ELIGIBLE_NODE_TYPES,
  ELIGIBLE_SHAPE_TYPES,
} from "./constants";

const usedStyles: Set<string> = new Set();
const styleCache = new Map<string, BaseStyle>();

let useSameAvatar: boolean = false;
let category: string | undefined;
let customPrompt: string | undefined;
let styles: Style[] = [];
let categories: string[] = [];
let customPrompts: string[] = [];

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
        const categoryRegex = new RegExp(process.env.STYLE_CATEGORY_REGEX!);

        styles = await getStylesAsync();
        categories = [
          ...new Set(
            styles.map(
              (style) => (categoryRegex.exec(style.name) || [])[1] || ""
            )
          ),
        ];
      }

      const categorySuggestions = categories
        .filter((category) =>
          category.toLowerCase().includes(query.toLowerCase())
        )
        .map((category) => ({
          name: category,
          data: category,
        }));

      result.setSuggestions(categorySuggestions);
      break;

    case "useCustomPrompt":
      if (customPrompts.length === 0) {
        const cachedData: string[] = await figma.clientStorage.getAsync(
          "savedCustomPrompts"
        );

        customPrompts = cachedData || [];
      }

      const customPromptSuggestions = customPrompts
        .filter((prompt) => prompt.toLowerCase().includes(query.toLowerCase()))
        .map((prompt) => ({
          name: prompt,
          data: prompt,
        }));

      if (query.length > 0) {
        customPromptSuggestions.unshift({
          name: query,
          data: query,
        });
      }

      result.setSuggestions(customPromptSuggestions);
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
    useSameAvatar = parameters.useSameAvatar;
    category = parameters.useSpecificCategory;
    customPrompt = parameters.useCustomPrompt;

    if (customPrompt) {
      // set in local storage so we can use it later
      const data = await figma.clientStorage.getAsync("savedCustomPrompts");
      if (data) {
        // don't add duplicates, but sort by most recently used
        const index = data.indexOf(customPrompt);
        if (index > -1) {
          data.splice(index, 1);
        }
        data.unshift(customPrompt);
        await figma.clientStorage.setAsync("savedCustomPrompts", data);
      } else {
        await figma.clientStorage.setAsync("savedCustomPrompts", [
          customPrompt,
        ]);
      }
    }
  }

  // Apply a random style to each selected node and close the plugin when finished
  try {
    if (customPrompt) {
      const avatarData: string[] | null = await generateAvatarAsync(
        customPrompt,
        useSameAvatar ? 1 : countEligibleNodes(selection) // rough estimate of number of eligible nodes in the selection
      );

      if (!avatarData) {
        figma.notify(`Failed to generate avatars using AI.`, {
          error: true,
          timeout: 5000,
        });
        await sleep(5000);
        figma.closePlugin();
      } else {
        // KLUDGE: we kind of hijack the styles array and use all the same existing code to utilize openai generated avatars
        styles = avatarData.map((data) => ({
          name: "noop", // we don't use this for custom prompt avatars
          key: data,
        }));
      }
    }

    // Get styles on run too
    if (styles.length === 0) {
      styles = await getStylesAsync();
    }

    // Begin the process of applying random styles to the selected nodes
    const initialRandomStyleKey = getRandomStyle(category);

    await Promise.all(
      selection.map((node) => {
        const randomStyleKey = useSameAvatar
          ? initialRandomStyleKey
          : getRandomStyle(category);
        return applyStyleToShapeNode(node, randomStyleKey);
      })
    );
    // }
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

const getRandomStyle = (categoryStr?: string): string => {
  let style: Style;

  let eligibleStyles =
    categoryStr && !customPrompt
      ? styles.filter((s) => s.name.includes(categoryStr))
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
      `No eligible styles found for category: "${categoryStr}", try running without a category.`
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

function processNode(node: SceneNode) {
  if (!ELIGIBLE_SHAPE_TYPES.includes(node.type)) {
    return;
  }

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

  return targetNode;
}

// Function to apply a random style to an eligible node
const applyStyleToShapeNode = async (
  node: SceneNode,
  styleKey: string
): Promise<void> => {
  // If the node is an instance, frame, or group, process its children recursively
  if (ELIGIBLE_CONTAINER_TYPES.includes(node.type)) {
    const instanceNode = node as EligibleInstanceNode;
    await Promise.all(
      instanceNode.children.map((childNode) => {
        const newStyleKey = useSameAvatar ? styleKey : getRandomStyle(category);
        return applyStyleToShapeNode(childNode, newStyleKey);
      })
    );
    return;
  }

  // Try to apply a random style or the generated avatar to the target node
  try {
    const targetNode = processNode(node);

    if (!targetNode) {
      return;
    }

    if (customPrompt) {
      const uint8array = new Uint8Array(Buffer.from(styleKey, "base64")); // convert base64 strin from openai to uint8array
      const image = figma.createImage(uint8array);

      (targetNode as EligibleShapeNode).fills = [
        { type: "IMAGE", imageHash: image.hash, scaleMode: "FILL" },
      ];
    } else {
      const style = await getStyleByKeyAsync(styleKey);
      targetNode.fillStyleId = style.id;
    }
  } catch (error) {
    console.error("Error importing and/or applying style:", error);
  }
};
