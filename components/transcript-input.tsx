"use client"

import { Loader2 } from "lucide-react"

interface TranscriptInputProps {
  transcript: string
  onTranscriptChange: (value: string) => void
  onSubmit: () => void
  isLoading: boolean
}

export default function TranscriptInput({ transcript, onTranscriptChange, onSubmit, isLoading }: TranscriptInputProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-6">
      <label htmlFor="transcript" className="block text-sm font-medium text-black mb-3">
        Transcript Content
      </label>
      <textarea
        id="transcript"
        value={transcript}
        onChange={(e) => onTranscriptChange(e.target.value)}
        placeholder="Paste your video transcript here..."
        className="w-full h-48 p-3 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none disabled:bg-gray-50 disabled:text-gray-500"
        disabled={isLoading}
      />
      <div className="flex items-center justify-between mt-3">
        <div className="text-xs text-gray-500">
          {transcript.length.toLocaleString()} characters
        </div>
        <button
          onClick={onSubmit}
          disabled={isLoading || !transcript.trim()}
          className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate Infographic"
          )}
        </button>
      </div>
    </div>
  )
}
