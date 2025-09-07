"use client"

import YoutubeTranscript from "@/components/youtube-transcript"

export default function Home() {

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="border border-black rounded-lg px-8 py-12">
          {/* Header */}
          <header className="mb-20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-6 bg-black rounded-sm flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-[1px]"></div>
              </div>
              <h1 className="text-3xl font-semibold text-black tracking-tight">
                Infograph Generator
              </h1>
            </div>
            <p className="text-gray-600 text-lg max-w-2xl leading-relaxed">
              Transform YouTube video transcripts into beautiful visual infographs with AI-powered summarization and style customization.
            </p>
          </header>

          {/* Main Content */}
          <main>
            <YoutubeTranscript />
          </main>

          {/* Footer */}
          <footer className="mt-24 pt-8 border-t border-gray-100">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
              <span>Powered by</span>
              <span className="font-medium text-black">Gemini 2.5 Flash Image</span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  )
}
