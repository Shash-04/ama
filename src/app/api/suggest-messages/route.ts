import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API!);

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const prompt = `Generate three **unique, engaging, and thought-provoking** questions for an anonymous social messaging platform. 
    The questions should be formatted as a single string, separated by '||'. Avoid personal or sensitive topics, focusing on universal themes.
    Examples: 'What’s a hobby you’ve recently started?||If you could have dinner with any historical figure, who would it be?||What’s a simple thing that makes you happy?'.`;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.8, // Controls randomness
        maxOutputTokens: 400,
      },
    });

    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return new Response(text);
  } catch (error) {
    console.error("Error generating content:", error);
    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 }
    );
  }
}
