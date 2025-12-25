
import { GoogleGenAI } from "@google/genai";

export async function describeFractalView(x: number, y: number, zoom: number) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `You are a mathematical tour guide. The user is currently exploring the Mandelbrot set at these coordinates: 
  Real (X): ${x}
  Imaginary (Y): ${y}
  Zoom Scale: ${zoom} (smaller is deeper)

  Provide a poetic, brief (2-3 sentences) description of what a user might see in this fractal landscape. 
  Mention geometric terms like cardioids, bulbs, spirals, or filaments if appropriate. 
  Be engaging and scientific.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "The complexity here is infinite. The deeper you go, the more patterns emerge from the chaos.";
  }
}
