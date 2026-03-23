import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function generateAITasks(employeeName: string, role: string, status: 'onboarding' | 'offboarding') {
  const model = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate a list of 5 essential ${status} tasks for a new employee named ${employeeName} in the role of ${role}. 
    Return the response as a JSON array of objects with 'title', 'description', and 'category' (one of: Account, Hardware, Software, Toegang, Other).`,
    config: {
      responseMimeType: "application/json",
    }
  });
  
  const result = await model;
  return JSON.parse(result.text);
}
