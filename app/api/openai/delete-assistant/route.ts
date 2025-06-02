import { NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function DELETE(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OpenAI API key not configured on server." }, { status: 500 })
  }

  try {
    const { assistantId } = await request.json()

    if (!assistantId) {
      return NextResponse.json({ error: "Missing assistantId" }, { status: 400 })
    }

    await openai.beta.assistants.del(assistantId)

    return NextResponse.json({ success: true, message: "Assistant deleted successfully" }, { status: 200 })
  } catch (error: any) {
    console.error("Error deleting OpenAI assistant via API route:", error)
    return NextResponse.json({ error: error.message || "Failed to delete assistant" }, { status: 500 })
  }
}
