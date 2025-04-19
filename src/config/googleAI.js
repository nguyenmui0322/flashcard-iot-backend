import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

// Initialize the Google Generative AI with API key from .env
const apiKey = process.env.GOOGLE_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

// Get the Gemini model
export const geminiModel = genAI.getGenerativeModel({ 
  model: "gemini-2.5-flash-preview-04-17",
  generationConfig: {
    temperature: 0.7,
    topP: 0.95,
    topK: 40,
  }
});

// Function to generate content using the Gemini model
export async function generateContent(prompt) {
  try {
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating content with Gemini:", error);
    throw error;
  }
} 