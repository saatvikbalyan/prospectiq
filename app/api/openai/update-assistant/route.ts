import { NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const GPT_MODEL = "gpt-4o"

export async function PUT(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OpenAI API key not configured on server." }, { status: 500 })
  }

  try {
    const { assistantId, icpName, systemPrompt } = await request.json()

    if (!assistantId || !icpName || !systemPrompt) {
      return NextResponse.json({ error: "Missing assistantId, icpName, or systemPrompt" }, { status: 400 })
    }

    const updatedAssistant = await openai.beta.assistants.update(assistantId, {
      name: `ICP Assistant - ${icpName}`,
      instructions: systemPrompt,
      model: GPT_MODEL,
    })

    return NextResponse.json({ assistantId: updatedAssistant.id }, { status: 200 })
  } catch (error: any) {
    console.error("Error updating OpenAI assistant via API route:", error)
    return NextResponse.json({ error: error.message || "Failed to update assistant" }, { status: 500 })
  }
}
