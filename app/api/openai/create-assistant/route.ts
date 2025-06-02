import { NextResponse } from "next/server"
import OpenAI from "openai"

// This is a server-side file, so process.env.OPENAI_API_KEY is accessible
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const GPT_MODEL = "gpt-4o" // Or your preferred model

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    console.error("OpenAI API key not configured on server.") // Log server-side
    return NextResponse.json({ error: "OpenAI API key not configured on server." }, { status: 500 })
  }

  try {
    const { icpName, systemPrompt } = await request.json()

    if (!icpName || !systemPrompt) {
      return NextResponse.json({ error: "Missing icpName or systemPrompt" }, { status: 400 })
    }

    console.log(`API Route: Creating assistant for ICP: ${icpName}`) // Add log
    const assistant = await openai.beta.assistants.create({
      name: `ICP Assistant - ${icpName}`,
      instructions: systemPrompt,
      model: GPT_MODEL,
    })
    console.log(`API Route: Assistant created with ID: ${assistant.id}`) // Add log

    return NextResponse.json({ assistantId: assistant.id }, { status: 201 })
  } catch (error: any) {
    // Log the detailed error on the server
    console.error("Error creating OpenAI assistant in API route:", error)

    // Ensure a JSON response is sent for errors
    let errorMessage = "Failed to create assistant due to an internal server error."
    if (error instanceof OpenAI.APIError) {
      errorMessage = error.message // Use specific OpenAI error message if available
    } else if (error.message) {
      errorMessage = error.message
    }

    return NextResponse.json(
      { error: errorMessage, details: error.toString() }, // Include more details if helpful
      { status: 500 },
    )
  }
}
