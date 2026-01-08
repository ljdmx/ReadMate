
import { GoogleGenAI, Type } from "@google/genai";

// Initialize the GoogleGenAI client using the API key from environment variables.
const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

/**
 * Helper to clean Markdown code blocks from AI strings for safer JSON parsing.
 */
const cleanJsonString = (str: string) => {
  return str.replace(/```json/g, "").replace(/```/g, "").trim();
};

/**
 * Generic helper for obtaining text responses from a Gemini model.
 */
export const getAIResponse = async (prompt: string, model: string = 'gemini-3-flash-preview', systemInstruction?: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: model,
    contents: prompt,
    config: { systemInstruction }
  });
  return response.text;
};

/**
 * Analyzes a book's content against a specific reader intent using structured JSON output and responseSchema.
 */
export const analyzeBook = async (title: string, intent: string, lang: string, model: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: model,
    contents: `Analyze the book "${title}" for a reader with this intent: "${intent}". 
    Output in ${lang === 'zh' ? 'Chinese' : 'English'}.`,
    config: { 
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          problemSolved: { type: Type.STRING },
          limitations: { type: Type.STRING },
          audienceFit: { type: Type.STRING },
          recommendedDepth: { type: Type.STRING },
          confidence: { type: Type.INTEGER }
        },
        required: ["problemSolved", "limitations", "audienceFit", "recommendedDepth", "confidence"]
      }
    }
  });
  try { 
    return JSON.parse(cleanJsonString(response.text || "{}")); 
  } catch (e) { 
    return null; 
  }
};

/**
 * Provides assistance during reading such as simplifying or restating text blocks.
 * Now supports bookContext for smarter analysis.
 */
export const assistReading = async (text: string, action: string, lang: string, model: string, bookContext?: string) => {
  const prompt = `${bookContext ? `The following text is from the book described here: ${bookContext}\n\n` : ''}Action: ${action}. Target Text: "${text}". Provide a concise, insightful response in ${lang === 'zh' ? 'Chinese' : 'English'}.`;
  return getAIResponse(prompt, model);
};

/**
 * Generates discovery recommendations for books based on user interests and growth goals using responseSchema.
 */
export const getDiscoveryRecs = async (tags: string[], goals: string, lang: string, model: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: model,
    contents: `Based on interests: ${tags.join(', ')} and user's specific goal: "${goals}".
    Suggest 3 highly relevant books. 
    Output in ${lang === 'zh' ? 'Chinese' : 'English'}.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            author: { type: Type.STRING },
            matchScore: { type: Type.INTEGER },
            whyItMatters: { type: Type.STRING },
            utilityType: { type: Type.STRING },
            keyTakeaway: { type: Type.STRING },
            price: { type: Type.STRING }
          },
          required: ["id", "title", "author", "matchScore", "whyItMatters", "utilityType", "keyTakeaway", "price"]
        }
      }
    }
  });

  try {
    return JSON.parse(cleanJsonString(response.text || "[]"));
  } catch (e) {
    return [];
  }
};

/**
 * Refines the user's understanding of an insight by contrasting it with the author's viewpoint.
 */
export const refineInsight = async (authorView: string, myUnderstanding: string, lang: string, model: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: model,
    contents: `Author's Viewpoint: "${authorView}". 
    My Understanding: "${myUnderstanding}". 
    Refine my understanding by integrating the author's viewpoint while keeping it personal and actionable.
    Output in ${lang === 'zh' ? 'Chinese' : 'English'}.`,
    config: { 
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          refined: { type: Type.STRING }
        },
        required: ["refined"]
      }
    }
  });
  try {
    return JSON.parse(cleanJsonString(response.text || "{}"));
  } catch (e) {
    return { refined: myUnderstanding };
  }
};
