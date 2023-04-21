import { FigmaDataStyles, FigmaStyleData, Style } from "./types";
import { fallbackStyles } from "./styles";

const CACHE_TTL = 5 * 60 * 1000;
const API_URL = `https://api.figma.com/v1/files/${process.env.FIGMA_LIBRARY_FILE_KEY}`;

const isFillStyle = ([_, style]: [string, FigmaStyleData]) =>
  style.styleType === "FILL";

const toStyle = ([_, style]: [string, FigmaStyleData]): Style => ({
  key: style.key,
  name: style.name,
});

async function isCacheValid(): Promise<boolean> {
  const cachedData = await figma.clientStorage.getAsync("fetchedStyles");
  if (!cachedData) return false;
  return new Date().getTime() - cachedData.timestamp < CACHE_TTL;
}

async function fetchStylesFromLibrary(): Promise<{
  styles: Style[];
  version: string;
} | null> {
  try {
    const response = await fetch(API_URL, {
      method: "GET",
      headers: {
        "X-FIGMA-TOKEN": process.env.FIGMA_API_KEY!,
      },
    });

    if (!response.ok) {
      console.error(
        `Error fetching styles from library: ${response.status} ${response.statusText}`
      );
      return null;
    }

    const data = await response.json();

    if (!data.styles) {
      console.error("Error fetching styles from library: No styles found");
      return null;
    }

    const styles: Style[] = Object.entries(data.styles as FigmaDataStyles)
      .filter(isFillStyle)
      .map(toStyle);

    return { styles, version: data.version };
  } catch (err) {
    const error = err as Error;
    console.error(`Error fetching styles from library: ${error.message}`);
    return null;
  }
}

export async function getStylesAsync(): Promise<Style[]> {
  let styles: Style[];

  try {
    if (await isCacheValid()) {
      const cachedData = await figma.clientStorage.getAsync("fetchedStyles");
      styles = cachedData.styles;
      console.log("Styles fetched from localStorage");
    } else {
      const data = await fetchStylesFromLibrary();

      if (data) {
        // If data was fetched successfully, store it in localStorage with the timestamp
        await figma.clientStorage.setAsync("fetchedStyles", {
          styles: data.styles,
          version: data.version,
          timestamp: new Date().getTime(),
        });
        styles = data.styles;
        console.log("Styles fetched from library");
      } else {
        const cachedData = await figma.clientStorage.getAsync("fetchedStyles");
        styles = cachedData ? cachedData.styles : fallbackStyles;
        console.log(
          "Styles fetched from " + (cachedData ? "localStorage" : "fallback")
        );
      }
    }
  } catch (error) {
    console.error(
      "Error accessing client storage, styles fetched from fallback:",
      error
    );
    styles = fallbackStyles;
  }

  return styles;
}
