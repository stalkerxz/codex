import { GoogleGenAI } from "@google/genai";

const apiKey = import.meta.env.VITE_GOOGLE_GENAI_KEY as string | undefined;

const client = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const generateScene = async (prompt: string) => {
  if (!client) {
    return { imageUrl: "", prompt };
  }

  const response = await client.models.generateContent({
    model: "imagen-4.0-generate-001",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });

  const image = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  const imageUrl = image ? `data:image/png;base64,${image}` : "";
  return { imageUrl, prompt };
};

export const remixPrompt = async (prompt: string) => {
  if (!client) return prompt;
  const response = await client.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `Rewrite this photography scene prompt to create a unique variation with cinematic flair: ${prompt}`,
          },
        ],
      },
    ],
  });

  return response.text ?? prompt;
};

export const magicEdit = async (prompt: string, edit: string) => {
  if (!client) return `${prompt}. ${edit}`;
  const response = await client.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `Modify this scene prompt with the user's request while keeping it photoreal: Prompt: ${prompt}. Edit: ${edit}`,
          },
        ],
      },
    ],
  });

  return response.text ?? `${prompt}. ${edit}`;
};

export const analyzePhoto = async (base64Image: string) => {
  if (!client) {
    return {
      subject: "Unknown",
      light: "Unknown",
      composition: "Unknown",
      moment: "Unknown",
      technique: "Unknown",
    };
  }

  const response = await client.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          { text: "Analyze this photo for Subject, Light, Composition, Moment, Technique." },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image,
            },
          },
        ],
      },
    ],
  });

  const text = response.text ?? "";
  return {
    subject: text,
    light: text,
    composition: text,
    moment: text,
    technique: text,
  };
};

export const searchTheory = async (query: string) => {
  if (!client) return "";
  const response = await client.models.generateContent({
    model: "gemini-2.5-flash",
    tools: [{ googleSearch: {} }],
    contents: [
      {
        role: "user",
        parts: [{ text: `Find photography theory tips for: ${query}` }],
      },
    ],
  });

  return response.text ?? "";
};
