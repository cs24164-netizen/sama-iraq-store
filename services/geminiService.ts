
import { GoogleGenAI, Type } from "@google/genai";
import { Product } from "../types";

// Initialize the GoogleGenAI client using process.env.API_KEY directly as specified in guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAIRecommendations = async (userHistory: string, products: Product[]): Promise<string[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `بناءً على تاريخ التصفح التالي للعميل: "${userHistory}"، من بين هذه المنتجات: ${JSON.stringify(products.map(p => ({id: p.id, name: p.name, category: p.category})))}، ما هي أفضل 3 منتجات ترشحها له؟ أجب فقط بمصفوفة من معرفات (ID) المنتجات بتنسيق JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    // Accessing .text property directly as per the correct extraction method
    const result = JSON.parse(response.text || "[]");
    return result;
  } catch (error) {
    console.error("AI Recommendation error:", error);
    return [];
  }
};

export const getSmartSearchSuggestions = async (query: string): Promise<string[]> => {
  if (!query || query.length < 2) return [];
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `اقترح 5 كلمات بحث شائعة في متجر إلكترونيات وملابس بالعراق تبدأ بـ أو تتعلق بـ: "${query}". أجب فقط بمصفوفة JSON من النصوص.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    // Accessing .text property directly
    return JSON.parse(response.text || "[]");
  } catch (error) {
    return [];
  }
};
