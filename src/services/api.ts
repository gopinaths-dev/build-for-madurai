import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const api = {
  getLeaderboard: async () => {
    const res = await fetch("/api/leaderboard");
    return res.json();
  },
  analyzeWasteImage: async (base64Data: string) => {
    try {
      // Remove data:image/jpeg;base64, prefix
      const data = base64Data.split(',')[1];
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: data,
              },
            },
            {
              text: "Analyze this image of waste. Determine if it is 'bio' (biodegradable like food, leaves), 'plastic' (recyclable plastic), or 'invalid' (not waste or mixed/unclear). Return ONLY a JSON object with keys: category (bio|plastic|invalid), message (a friendly encouraging message in Tamil-English mix for a kid), and score (20 for bio/plastic, -10 for invalid).",
            },
          ],
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING },
              message: { type: Type.STRING },
              score: { type: Type.NUMBER },
            },
            required: ["category", "message", "score"],
          },
        },
      });

      return JSON.parse(response.text || "{}");
    } catch (e) {
      console.error("Gemini API Error:", e);
      return { 
        category: "invalid", 
        message: "Oops! My AI brain is a bit tired. Please try again in a moment! 🌟", 
        score: 0 
      };
    }
  },
  recordScore: async (analysisResult: any, studentName: string) => {
    const res = await fetch("/api/score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...analysisResult, studentName }),
    });
    return res.json();
  }
};
