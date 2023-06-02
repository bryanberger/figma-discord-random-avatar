// We are severely rate limited by only 50 images per minute. If multiple designers use this one API key we will hit that limit very quickly
// The env vars are used to limit the number of images we generate per batch and the number of batches (requests) we make at once

const IMAGE_GENERATION_ENDPOINT =
  "https://api.openai.com/v1/images/generations";

export async function generateAvatarAsync(prompt: string, n: number = 1) {
  // if process env vars are not set, throw an error
  if (
    !process.env.OPENAI_API_KEY ||
    !process.env.OPENAI_MAX_REQUESTS ||
    !process.env.OPENAI_MAX_IMAGES_PER_BATCH
  ) {
    throw new Error("OPENAI vars not set");
  }

  if (!prompt) {
    return null;
  }

  // TODO: Get more clever with prompt guidance
  const modifiedPrompt = `${prompt}, realistic`.trim();

  try {
    // Array to store the promises for each API request
    const apiRequests = [];

    const batchSize = Math.min(
      n,
      Number(process.env.OPENAI_MAX_IMAGES_PER_BATCH)
    );
    const numBatches = Math.min(
      Number(process.env.OPENAI_MAX_REQUESTS),
      Math.ceil(n / batchSize)
    );

    console.log("n:", n, "batchSize:", batchSize, "numBatches:", numBatches);

    // Make parallel requests for each batch
    for (let i = 0; i < numBatches; i++) {
      const responsePromise = fetch(IMAGE_GENERATION_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          prompt: modifiedPrompt,
          n: batchSize,
          size: "256x256",
          response_format: "b64_json",
          user: "figma-discord-random-avatar",
        }),
      });

      apiRequests.push(responsePromise);
    }

    // Wait for all API requests to complete
    const responses = await Promise.all(apiRequests);

    // Process the responses and extract the avatar data
    const avatars: string[] = [];
    for (const response of responses) {
      if (!response.ok) {
        // check error code
        switch (response.status) {
          case 500:
            throw new Error(
              "API request failed, internal server error on openai"
            );

          case 429:
            throw new Error(
              "API request failed, we are being rate limited by openai"
            );
          case 401:
            throw new Error(
              "API request failed, invalid authentication/api key"
            );
          default:
            throw new Error(
              `API request failed, unknown error code from openai ${response.status}`
            );
        }
      }

      const responseData = await response.json();

      if (!responseData.data) {
        console.error(responseData);
        throw new Error("Invalid response data");
      }
      avatars.push(
        ...responseData.data.map(
          (imageData: { b64_json: string }) => imageData.b64_json
        )
      );
    }
    return avatars;
  } catch (error) {
    console.error(error);
    return null;
  }
}
