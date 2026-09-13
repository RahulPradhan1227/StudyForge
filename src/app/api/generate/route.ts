import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error("GEMINI_API_KEY is missing from environment variables.");
      return NextResponse.json(
        { error: "Server configuration error: API key is missing." },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const subject = formData.get("subject") as string | null;
    const examGoal = formData.get("examGoal") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString("base64");

    const prompt = `
You are an expert academic tutor. Your task is to generate three components based STRICTLY AND ONLY on the provided lecture material:
1. Exam-focused revision notes.
2. A 2-Minute Quick Revision sheet.
3. A 5-question multiple-choice practice quiz.

Context:
- Subject/Course: ${subject || "Not specified"}
- Exam Goal: ${examGoal || "General exam preparation"}

CRITICAL RULES:
1. DO NOT invent facts, definitions, or outside information.
2. If information for a specific section is not present in the source, explicitly state "Not covered in source material."
3. Base everything ONLY on the provided document.

Structure Requirements for 'notes':
Use Markdown. Include these exact sections:
## Topic Overview
## Key Concepts
## Important Definitions
## Exam-Focused Points
## Concept Relationships
## Likely Exam Questions

Structure Requirements for 'quickRevision':
Use Markdown. Keep it extremely brief and high-yield. Include these exact sections:
## ⚡ Must Know Concepts
## 📌 Formulas / Key Facts
## 🎯 Exam Focus
## ⚠️ Common Mistakes

Structure Requirements for 'quiz':
Must be exactly 5 questions. Each question must have exactly 4 options.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: base64Data,
                mimeType: file.type,
              },
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            notes: {
              type: Type.STRING,
              description: "Full exam-focused revision notes in Markdown format",
            },
            quickRevision: {
              type: Type.STRING,
              description: "Concise 2-minute revision sheet in Markdown format",
            },
            quiz: {
              type: Type.ARRAY,
              description: "List of exactly 5 multiple choice questions",
              items: {
                type: Type.OBJECT,
                properties: {
                  question: {
                    type: Type.STRING,
                    description: "The text of the question",
                  },
                  options: {
                    type: Type.ARRAY,
                    description: "Exactly 4 possible options for the answer",
                    items: {
                      type: Type.STRING,
                    },
                  },
                  correctAnswerIndex: {
                    type: Type.INTEGER,
                    description: "The 0-based index (0, 1, 2, or 3) of the correct option in the options array",
                  },
                  explanation: {
                    type: Type.STRING,
                    description: "A short explanation of why the answer is correct",
                  },
                },
                required: ["question", "options", "correctAnswerIndex", "explanation"],
              },
            },
          },
          required: ["notes", "quickRevision", "quiz"],
        },
      },
    });

    if (!response.text) {
      throw new Error("No response text from Gemini");
    }

    const result = JSON.parse(response.text);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error generating study material:", error);
    
    // Handle 429 Quota Exhausted gracefully
    if (error.status === 429 || (error.message && error.message.includes("429"))) {
      return NextResponse.json(
        { error: "AI generation quota is temporarily unavailable. Please try again after the quota resets." },
        { status: 429 }
      );
    }
    // Handle 503 Overloaded
    if (error.status === 503 || (error.message && error.message.includes("503"))) {
      return NextResponse.json(
        { error: "The AI model is currently experiencing high demand. Please wait a moment and try again." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate study material. " + error.message },
      { status: 500 }
    );
  }
}
