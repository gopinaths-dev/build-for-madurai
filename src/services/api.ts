import { GoogleGenAI, Type, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const API_BASE_URL = ((import.meta as any).env.VITE_API_BASE_URL || "").replace(/\/$/, "");

export const api = {
  getLeaderboard: async () => {
    const res = await fetch(`${API_BASE_URL}/api/leaderboard`);
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
              text: "You are a friendly 'Eco Teacher' (a kind Tamil Akka) for kids in Madurai. Analyze this image of waste. \n" +
                    "1. Identify what the item is.\n" +
                    "2. Classify it as 'bio' (makkum kuppai), 'plastic' (makkatha kuppai), or 'invalid'.\n" +
                    "3. Provide a warm, encouraging message in simple Tamil-English (Hinglish) for the UI text.\n" +
                    "4. Explain WHY it belongs there and give a small future tip.\n" +
                    "5. CRITICAL: Provide a 'tamilSpeechText' field. This should be a natural, conversational Tamil script (Madurai flavor) that a kind elder sister would say. Use simple words. Example: 'Super pa! Idhu banana peel ah? Idhu mannula seekiram kalandhurum. Adhunaala idhai green bin-la podanum sariya?'. Avoid formal Tamil.\n" +
                    "Return ONLY a JSON object with: category, message, score, educationalTip, and tamilSpeechText.",
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
              educationalTip: { type: Type.STRING },
              tamilSpeechText: { type: Type.STRING },
            },
            required: ["category", "message", "score", "educationalTip", "tamilSpeechText"],
          },
        },
      });

      return JSON.parse(response.text || "{}");
    } catch (e) {
      console.error("Gemini API Error:", e);
      return { 
        category: "invalid", 
        message: "Oops! My AI brain is a bit tired. Please try again in a moment! 🌟", 
        score: 0,
        educationalTip: "Try taking a clearer photo!",
        tamilSpeechText: "Kanna, oru thadava thirumba try pannunga!"
      };
    }
  },
  generateSpeech: async (text: string) => {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Say this warmly and cheerfully in Tamil like a kind elder sister (Tamil Akka): ${text}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });
      return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    } catch (e) {
      console.error("Speech Generation Error:", e);
      return null;
    }
  },
  recordScore: async (analysisResult: any, studentName: string) => {
    const res = await fetch(`${API_BASE_URL}/api/score`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...analysisResult, studentName }),
    });
    return res.json();
  }
};
