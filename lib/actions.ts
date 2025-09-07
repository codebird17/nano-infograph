"use server"

import { GoogleGenerativeAI } from "@google/generative-ai"
import { GoogleGenAI } from "@google/genai"
import type { InfographicData } from "@/types/infographic"

type TranscriptResult = {
  success: boolean
  transcript?: string
  error?: string
  title?: string
  videoId?: string
  detectedLanguage?: string
}

const INFOGRAPHIC_PROMPT = `
You are an expert information designer. Based on the following video transcript, please perform two tasks:
1. Generate a concise, easy-to-read summary of the key points, concepts, and conclusions. The summary should be well-structured and capture the essence of the content.
2. Create a visually appealing and informative infograph that visualizes these key points. The infograph should have a clear title, use relevant icons or simple graphics, and present the information in a structured and engaging way (e.g., using columns, flowcharts, or distinct sections). Ensure the design is modern, clean, and easy to understand.

Return both the text summary and the generated image.

Transcript:
---
{{TRANSCRIPT}}
---
`

const SUMMARY_PROMPT = `
You are an expert content summarizer. Please analyze the following video transcript and create a concise, well-structured summary that:

1. Captures the main topic and key themes
2. Highlights the most important points and conclusions
3. Organizes information in a logical flow
4. Uses clear, engaging language
5. Maintains the essential information while being significantly shorter than the original

The summary should be optimized for AI image generation, so focus on:
- Visual concepts and key ideas
- Clear structure with distinct sections
- Concrete details that can be visualized
- Main themes that would work well in an infograph

Keep the summary between 200-500 words, well-organized with clear headings or bullet points.

Transcript:
---
{{TRANSCRIPT}}
---

Please provide only the summary, formatted in a clear and structured way.`

const INFOGRAPHIC_PROMPT_GENERATOR = `
You are an expert infograph designer and prompt engineer. Based on the following video transcript, create a detailed, specific prompt that will be used to generate a beautiful infograph image.

Your prompt should:
1. Identify the main topic and 3-5 key points from the transcript
2. Suggest a clear visual hierarchy and layout structure
3. Specify visual elements like icons, charts, or diagrams that would enhance understanding
4. Include color suggestions that match the content theme
5. Ensure the infograph would be informative, engaging, and easy to read

Format your response as a clear, detailed prompt that an AI image generator can use to create a professional infograph. Focus on making it visual, structured, and informative.

Transcript:
---
{{TRANSCRIPT}}
---

Generate a comprehensive infograph creation prompt:`

/**
 * Extract video ID from various YouTube URL formats
 */
function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) {
      return match[1]
    }
  }
  
  return null
}

/**
 * Validate YouTube URL format
 */
function isValidYouTubeUrl(url: string): boolean {
  return extractVideoId(url) !== null
}

/**
 * Clean and format transcript text
 */
function cleanTranscriptText(text: string): string {
  if (!text) return ""
  
  // Remove excessive whitespace
  text = text.replace(/\s+/g, ' ')
  
  // Remove special characters that might cause issues
  text = text.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\xff]/g, '')
  
  // Strip leading/trailing whitespace
  return text.trim()
}

/**
 * Build a prioritized list of transcript API endpoints to try across environments
 * - Browser (Vercel/Prod): use relative /api/transcript
 * - Server (Vercel): use https://VERCEL_URL/api/transcript
 * - Configured PYTHON_API_URL (absolute): ${PYTHON_API_URL}/transcript
 * - Local dev fallback: http://localhost:8001/transcript
 */
function resolveTranscriptApiCandidates(): string[] {
  const candidates: string[] = []
  const isBrowser = typeof window !== 'undefined'
  const configuredApiUrl = process.env.PYTHON_API_URL
  const vercelUrl = process.env.VERCEL_URL

  // 1) In the browser, relative path to same origin works on Vercel
  if (isBrowser) {
    candidates.push('/api/transcript')
  }

  // 2) Explicit configuration
  if (configuredApiUrl) {
    if (configuredApiUrl.startsWith('/api')) {
      candidates.push('/api/transcript')
    } else if (configuredApiUrl.startsWith('http')) {
      candidates.push(`${configuredApiUrl.replace(/\/$/, '')}/transcript`)
    }
  }

  // 3) On Vercel server runtime, construct absolute URL
  if (!isBrowser && (process.env.VERCEL === '1' || !!vercelUrl)) {
    const absoluteBase = vercelUrl ? `https://${vercelUrl}` : ''
    if (absoluteBase) candidates.push(`${absoluteBase}/api/transcript`)
  }

  // 4) Local dev fallback
  candidates.push('http://localhost:8001/transcript')

  // De-duplicate while preserving order
  return Array.from(new Set(candidates))
}

/**
 * Fetch YouTube video transcript via Python API
 */
export async function fetchYoutubeTranscript(url: string, maxLength: number = 50000): Promise<TranscriptResult> {
  try {
    console.log("Starting YouTube transcript fetch for URL:", url)
    
    // Validate URL
    if (!isValidYouTubeUrl(url)) {
      return {
        success: false,
        error: "Invalid YouTube URL format. Please provide a valid YouTube video URL."
      }
    }
    
    // Extract video ID for logging
    const videoId = extractVideoId(url)
    console.log("Extracted video ID:", videoId)
    
    // Try multiple endpoints with a timeout to improve resiliency across environments
    const candidates = resolveTranscriptApiCandidates()
    console.log('Transcript API candidates:', candidates)

    const payload = JSON.stringify({ url, max_length: maxLength, language: 'en' })
    const timeoutMs = Number(process.env.TRANSCRIPT_FETCH_TIMEOUT_MS || 15000)

    let lastError: unknown = null
    for (const endpoint of candidates) {
      try {
        console.log('Attempting endpoint:', endpoint)
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), timeoutMs)
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          signal: controller.signal,
        })
        clearTimeout(timeout)

        if (!response.ok) {
          const errorText = await response.text().catch(() => '')
          console.warn('Endpoint responded with non-OK:', response.status, errorText)
          lastError = new Error(`API request failed: ${response.status} ${response.statusText}`)
          continue
        }

        const result = await response.json()
        console.log('Transcript API response meta:', {
          success: result.success,
          hasTranscript: !!result.transcript,
          transcriptLength: result.transcript?.length || 0,
          error: result.error,
        })

        if (!result.success) {
          lastError = new Error(result.error || 'Failed to fetch transcript from Python API')
          continue
        }

        if (!result.transcript) {
          lastError = new Error('No transcript returned from Python API')
          continue
        }

        console.log('Transcript processed successfully, final length:', result.transcript.length)
        return {
          success: true,
          transcript: result.transcript,
          videoId: result.video_id || videoId,
          detectedLanguage: result.detected_language || 'en',
          title: result.title,
        }
      } catch (err) {
        lastError = err
        const isAbort = err instanceof Error && err.name === 'AbortError'
        console.warn('Endpoint attempt failed:', endpoint, isAbort ? 'timeout' : err)
        continue
      }
    }

    // If all candidates failed
    return {
      success: false,
      error:
        lastError instanceof Error
          ? `Transcript service error: ${lastError.message}`
          : 'Transcript service is temporarily unavailable. For local development, start the Python server with \"cd python-api && python3 main.py\".',
    }
    
  } catch (error) {
    console.error("Error calling Python API for YouTube transcript:", error)
    
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        success: false,
        error: "Transcript service is temporarily unavailable. This feature requires a backend service to fetch YouTube transcripts. For local development, start the Python server with 'cd python-api && python3 main.py'."
      }
    }
    
    return {
      success: false,
      error: `Failed to fetch transcript: ${error instanceof Error ? error.message : "Unknown error"}`
    }
  }
}

/**
 * Generate a summary from YouTube video transcript
 */
export async function summarizeTranscript(transcript: string): Promise<{ success: boolean; summary?: string; error?: string }> {
  try {
    console.log("Starting transcript summarization")
    console.log("Transcript length:", transcript?.length || 0)

    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable not set")
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    })

    const fullPrompt = SUMMARY_PROMPT.replace("{{TRANSCRIPT}}", transcript)
    console.log("Generated summary prompt length:", fullPrompt.length)

    const textResult = await model.generateContent([fullPrompt])
    const textResponse = await textResult.response
    const summary = textResponse.text()

    console.log("Successfully generated summary")
    console.log("Summary length:", summary?.length || 0)

    return {
      success: true,
      summary: summary || "Summary could not be generated. Please try again."
    }

  } catch (error) {
    console.error("Error generating summary:", error)
    return {
      success: false,
      error: `Failed to generate summary: ${error instanceof Error ? error.message : "Unknown error"}`
    }
  }
}

/**
 * Generate an infographic prompt from YouTube video transcript
 */
export async function generateInfographicPrompt(transcript: string): Promise<{ success: boolean; prompt?: string; error?: string }> {
  try {
    console.log("Starting infograph prompt generation")
    console.log("Transcript length:", transcript?.length || 0)

    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable not set")
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    })

    const fullPrompt = INFOGRAPHIC_PROMPT_GENERATOR.replace("{{TRANSCRIPT}}", transcript)
    console.log("Generated infograph prompt generator length:", fullPrompt.length)

    const textResult = await model.generateContent([fullPrompt])
    const textResponse = await textResult.response
    const prompt = textResponse.text()

    console.log("Successfully generated infograph prompt")
    console.log("Prompt length:", prompt?.length || 0)

    return {
      success: true,
      prompt: prompt || "Infograph prompt could not be generated. Please try again."
    }

  } catch (error) {
    console.error("Error generating infograph prompt:", error)
    return {
      success: false,
      error: `Failed to generate infograph prompt: ${error instanceof Error ? error.message : "Unknown error"}`
    }
  }
}

/**
 * Generate infographic from prompt with style options using Gemini 2.5 Flash Image
 */
export async function generateInfographicFromPrompt(
  prompt: string, 
  style: string = "modern"
): Promise<{ success: boolean; imageUrl?: string; error?: string }> {
  try {
    console.log("Starting infograph generation with Gemini 2.5 Flash Image")
    console.log("Prompt length:", prompt?.length || 0)
    console.log("Selected style:", style)

    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable not set")
    }

    // Style-specific prompt enhancements
    const stylePrompts = {
      modern: "Create a modern, clean infograph with bold typography, vibrant colors, and sleek design elements.",
      minimal: "Design a minimal, clean infograph with lots of white space, simple typography, and muted colors.",
      corporate: "Generate a professional corporate infograph with business colors (blues, grays), formal typography, and structured layout.",
      creative: "Create a creative, artistic infograph with unique layouts, vibrant colors, and innovative design elements.",
      dark: "Design a dark-themed infograph with dark backgrounds, bright accent colors, and modern contrast.",
      colorful: "Generate a bright, colorful infograph with vibrant colors, playful elements, and engaging visual design."
    }

    const styleEnhancement = stylePrompts[style as keyof typeof stylePrompts] || stylePrompts.modern
    const enhancedPrompt = `Create a professional infograph image. ${styleEnhancement}

${prompt}

Requirements:
- High-resolution infograph format (vertical or horizontal layout)
- Clear, readable typography with proper font hierarchy
- Use icons, charts, diagrams, and visual elements appropriately
- Include a compelling title at the top
- Organize information in logical sections or flows
- Use consistent color scheme and spacing
- Ensure all text is legible and well-contrasted
- Professional, clean, and modern design
- Include visual elements like arrows, dividers, or shapes to guide the eye
- Make it informative, engaging, and easy to understand at a glance`

    console.log("Enhanced prompt length:", enhancedPrompt.length)

    const ai = new GoogleGenAI({ apiKey })

    // Use Gemini 2.5 Flash Image model for image generation
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image-preview",
      contents: enhancedPrompt,
    })

    console.log("Received response from Gemini 2.5 Flash Image")

    // Process the response to extract image data
    if (response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.text) {
          console.log("Response text:", part.text)
        } else if (part.inlineData) {
          console.log("Found image data in response")
          const imageData = part.inlineData.data
          
          // Convert base64 to data URI for immediate display
          const mimeType = part.inlineData.mimeType || "image/png"
          const dataUri = `data:${mimeType};base64,${imageData}`
          
          console.log("Successfully generated infograph image")
          return {
            success: true,
            imageUrl: dataUri
          }
        }
      }
    }

    // If no image was found in the response
    throw new Error("No image data found in the response")

  } catch (error) {
    console.error("Error generating infograph with Gemini 2.5 Flash Image:", error)
    
    // Provide more specific error messages
    let errorMessage = "Failed to generate infograph"
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        errorMessage = "Invalid API key. Please check your Gemini API configuration."
      } else if (error.message.includes("quota")) {
        errorMessage = "API quota exceeded. Please try again later."
      } else if (error.message.includes("model")) {
        errorMessage = "Image generation model is not available. Please try again."
      } else {
        errorMessage = `Image generation failed: ${error.message}`
      }
    }
    
    return {
      success: false,
      error: errorMessage
    }
  }
}

export async function generateInfographicFromTranscript(transcript: string): Promise<InfographicData> {
  console.log("[v0] Starting infograph generation process")
  console.log("[v0] Transcript length:", transcript?.length || 0)
  console.log(
    "[v0] Environment variables available:",
    Object.keys(process.env).filter((key) => key.includes("GEMINI")),
  )

  const apiKey = process.env.GEMINI_API_KEY

  console.log("[v0] API key found:", apiKey ? "Yes" : "No")
  console.log("[v0] API key length:", apiKey?.length || 0)

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable not set")
  }

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
  })

  const fullPrompt = INFOGRAPHIC_PROMPT.replace("{{TRANSCRIPT}}", transcript)
  console.log("[v0] Generated prompt length:", fullPrompt.length)

  try {
    console.log("[v0] Attempting to generate content with Gemini API")

    const textResult = await model.generateContent([fullPrompt])
    const textResponse = await textResult.response
    const summary = textResponse.text()

    console.log("[v0] Successfully generated summary")
    console.log("[v0] Summary length:", summary?.length || 0)
    console.log("[v0] Summary preview:", summary?.slice(0, 100) + "...")

    console.log("[v0] Using static placeholder image (Gemini doesn't support image generation)")
    const imageUrl = "/infograph-placeholder.jpg"

    console.log("[v0] Generated image URL:", imageUrl)

    const result = {
      imageUrl,
      summary: summary || "Summary could not be generated. Please try again.",
    }

    console.log("[v0] Final result object:", {
      imageUrlLength: result.imageUrl?.length || 0,
      summaryLength: result.summary?.length || 0,
      hasImageUrl: !!result.imageUrl,
      hasSummary: !!result.summary,
    })

    return result
  } catch (error) {
    console.error("[v0] Error generating content:", error)
    throw new Error(
      `Failed to generate infograph content: ${error instanceof Error ? error.message : "Unknown error"}`,
    )
  }
}
