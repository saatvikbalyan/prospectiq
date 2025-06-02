import { NextResponse } from "next/server"
import OpenAI from "openai"

// This is a server-side file, so process.env.OPENAI_API_KEY is accessible
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const GPT_MODEL = "gpt-4o" // Or your preferred model

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OpenAI API key not configured on server." }, { status: 500 })
  }

  try {
    const { icpName, systemPrompt } = await request.json()

    if (!icpName || !systemPrompt) {
      return NextResponse.json({ error: "Missing icpName or systemPrompt" }, { status: 400 })
    }

    const assistant = await openai.beta.assistants.create({
      name: `ICP Assistant - ${icpName}`,
      instructions: systemPrompt,
      model: GPT_MODEL,
    })

    return NextResponse.json({ assistantId: assistant.id }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating OpenAI assistant via API route:", error)
    return NextResponse.json({ error: error.message || "Failed to create assistant" }, { status: 500 })
  }
}
