"use client"

import { useState, useEffect } from "react"
import { Loader2, X, ChevronLeft, ChevronRight } from "lucide-react"
import { fetchYoutubeTranscript, summarizeTranscript, generateInfographicPrompt, generateInfographicFromPrompt } from "@/lib/actions"

interface YoutubeTranscriptProps {
  onTranscriptFetched?: (transcript: string) => void
}

export default function YoutubeTranscript({ onTranscriptFetched }: YoutubeTranscriptProps) {
  const [url, setUrl] = useState("")
  const [transcript, setTranscript] = useState("")
  const [summary, setSummary] = useState("")
  const [infographicPrompt, setInfographicPrompt] = useState("")
  const [generatedImages, setGeneratedImages] = useState<Array<{id: string, imageUrl: string, prompt: string, style: string}>>([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [selectedStyle, setSelectedStyle] = useState("modern")
  const [isLoading, setIsLoading] = useState(false)
  const [isSummarizing, setIsSummarizing] = useState(false)
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const [error, setError] = useState("")
  const [summaryError, setSummaryError] = useState("")
  const [promptError, setPromptError] = useState("")
  const [imageError, setImageError] = useState("")
  const [success, setSuccess] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editPrompt, setEditPrompt] = useState("")
  const [editStyle, setEditStyle] = useState("modern")

  // Handle Escape key to close modals
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isEditModalOpen) {
          setIsEditModalOpen(false)
        } else if (isModalOpen) {
          setIsModalOpen(false)
        }
      }
    }

    if (isModalOpen || isEditModalOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isModalOpen, isEditModalOpen])

  // YouTube URL validation
  const isValidYouTubeUrl = (url: string): boolean => {
    const patterns = [
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
      /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
    ]
    return patterns.some(pattern => pattern.test(url))
  }

  const handleSummarize = async (transcriptText: string) => {
    setIsSummarizing(true)
    setSummaryError("")
    setSummary("")

    try {
      const result = await summarizeTranscript(transcriptText)

      if (result.success && result.summary) {
        setSummary(result.summary)
      } else {
        setSummaryError(result.error || "Failed to generate summary")
      }
    } catch (err) {
      setSummaryError("An unexpected error occurred while generating summary")
    } finally {
      setIsSummarizing(false)
    }
  }

  const handleGeneratePrompt = async (transcriptText: string) => {
    setIsGeneratingPrompt(true)
    setPromptError("")
    setInfographicPrompt("")

    try {
      const result = await generateInfographicPrompt(transcriptText)

      if (result.success && result.prompt) {
        setInfographicPrompt(result.prompt)
      } else {
        setPromptError(result.error || "Failed to generate infographic prompt")
      }
    } catch (err) {
      setPromptError("An unexpected error occurred while generating prompt")
    } finally {
      setIsGeneratingPrompt(false)
    }
  }

  const handleGenerateImage = async (customPrompt?: string, customStyle?: string) => {
    const promptToUse = customPrompt || infographicPrompt
    const styleToUse = customStyle || selectedStyle
    if (!promptToUse) return

    setIsGeneratingImage(true)
    setImageError("")

    try {
      const result = await generateInfographicFromPrompt(promptToUse, styleToUse)

      if (result.success && result.imageUrl) {
        const newImage = {
          id: Date.now().toString(),
          imageUrl: result.imageUrl,
          prompt: promptToUse,
          style: styleToUse
        }
        
        setGeneratedImages(prev => {
          const updated = [...prev, newImage]
          setCurrentImageIndex(updated.length - 1)
          return updated
        })
        
        // Close edit modal if it was open
        if (customPrompt) {
          setIsEditModalOpen(false)
          setEditPrompt("")
        }
      } else {
        setImageError(result.error || "Failed to generate infographic image")
      }
    } catch (err) {
      setImageError("An unexpected error occurred while generating image")
    } finally {
      setIsGeneratingImage(false)
    }
  }

  const handleEditImage = () => {
    setEditPrompt(infographicPrompt)
    setEditStyle(selectedStyle)
    setIsEditModalOpen(true)
  }

  const handleSubmitEdit = () => {
    if (editPrompt.trim()) {
      handleGenerateImage(editPrompt.trim(), editStyle)
    }
  }

  const handleFetchTranscript = async () => {
    if (!url.trim()) {
      setError("Please enter a YouTube URL")
      return
    }

    if (!isValidYouTubeUrl(url)) {
      setError("Please enter a valid YouTube URL")
      return
    }

    setIsLoading(true)
    setError("")
    setSuccess(false)
    setTranscript("")
    setSummary("")
    setSummaryError("")
    setInfographicPrompt("")
    setPromptError("")
    setGeneratedImages([])
    setCurrentImageIndex(0)
    setImageError("")

    try {
      const result = await fetchYoutubeTranscript(url, 50000) // Max 50k characters

      if (result.success) {
        const fetchedTranscript = result.transcript || ""
        setTranscript(fetchedTranscript)
        setSuccess(true)
        setError("")
        
        // Notify parent component if callback is provided
        if (onTranscriptFetched && fetchedTranscript) {
          onTranscriptFetched(fetchedTranscript)
        }

        // Automatically generate summary and infographic prompt
        if (fetchedTranscript) {
          handleSummarize(fetchedTranscript)
          handleGeneratePrompt(fetchedTranscript)
        }
      } else {
        setError(result.error || "Failed to fetch transcript")
        setTranscript("")
      }
    } catch (err) {
      setError("An unexpected error occurred while fetching the transcript")
      setTranscript("")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearAll = () => {
    setUrl("")
    setTranscript("")
    setSummary("")
    setInfographicPrompt("")
    setGeneratedImages([])
    setCurrentImageIndex(0)
    setError("")
    setSummaryError("")
    setPromptError("")
    setImageError("")
    setSuccess(false)
    setIsModalOpen(false)
    setIsEditModalOpen(false)
    setEditPrompt("")
    setEditStyle("modern")
  }

  const copyToClipboard = async () => {
    if (transcript) {
      try {
        await navigator.clipboard.writeText(transcript)
        // Could add a toast notification here
      } catch (err) {
        console.error("Failed to copy text: ", err)
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* URL Input Section */}
      <div className="border border-gray-200 rounded-lg p-6">
        <div className="flex gap-3">
          <input
            type="url"
            placeholder="https://www.youtube.com/watch?v=..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isLoading}
            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
          />
          <button
            onClick={handleFetchTranscript}
            disabled={isLoading || !url.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Fetching...
              </>
            ) : (
              "Fetch Transcript"
            )}
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className="mt-4 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}

        {/* Success State */}
        {success && (
          <div className="mt-4 p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md">
            Transcript fetched successfully! ({transcript.length.toLocaleString()} characters)
          </div>
        )}
      </div>

      {/* 2x2 Grid Layout: Transcript, Summary, Prompt, Generated Image */}
      {transcript && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Row */}
          
          {/* Top Left - Transcript */}
          <div className="border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-sm font-medium text-black">Video Transcript</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyToClipboard}
                  className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Copy
                </button>
                {onTranscriptFetched && (
                  <button
                    onClick={() => onTranscriptFetched(transcript)}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-black rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                  >
                    Use for Infograph
                  </button>
                )}
                <button
                  onClick={handleClearAll}
                  className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Clear
                </button>
              </div>
            </div>
            <div className="p-4">
              <textarea
                value={transcript}
                readOnly
                className="w-full h-64 p-3 text-sm font-mono border border-gray-200 rounded-md resize-none focus:outline-none bg-gray-50"
                placeholder="Transcript will appear here..."
              />
              <div className="mt-2 text-xs text-gray-500">
                {transcript.length.toLocaleString()} characters
              </div>
            </div>
          </div>

          {/* Top Right - Summary */}
          <div className="border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-sm font-medium text-black">
                AI Summary
                {isSummarizing && (
                  <span className="ml-2 text-xs text-gray-500">
                    <Loader2 className="w-3 h-3 animate-spin inline mr-1" />
                    Generating...
                  </span>
                )}
              </h3>
              {summary && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigator.clipboard.writeText(summary)}
                    className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    Copy Summary
                  </button>
                  <button
                    onClick={() => handleSummarize(transcript)}
                    disabled={isSummarizing}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-black rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:bg-gray-300"
                  >
                    Re-generate
                  </button>
                </div>
              )}
            </div>
            <div className="p-4">
              {summaryError ? (
                <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-3">
                  {summaryError}
                </div>
              ) : summary ? (
                <div className="h-64 p-3 text-sm border border-gray-200 rounded-md bg-gray-50 overflow-y-auto">
                  <div className="whitespace-pre-wrap">{summary}</div>
                </div>
              ) : isSummarizing ? (
                <div className="h-64 flex items-center justify-center border border-gray-200 rounded-md bg-gray-50">
                  <div className="text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-500">Generating AI summary...</p>
                  </div>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center border border-gray-200 rounded-md bg-gray-50">
                  <p className="text-sm text-gray-500">Summary will appear here after transcript is processed</p>
                </div>
              )}
              {summary && (
                <div className="mt-2 text-xs text-gray-500">
                  Summary: {summary.length.toLocaleString()} characters
                </div>
              )}
            </div>
          </div>

          {/* Bottom Row */}
          
          {/* Bottom Left - Infographic Prompt */}
          <div className="border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-sm font-medium text-black">
                Infograph Prompt
                {isGeneratingPrompt && (
                  <span className="ml-2 text-xs text-gray-500">
                    <Loader2 className="w-3 h-3 animate-spin inline mr-1" />
                    Generating...
                  </span>
                )}
              </h3>
              {infographicPrompt && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigator.clipboard.writeText(infographicPrompt)}
                    className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    Copy Prompt
                  </button>
                  <button
                    onClick={() => handleGeneratePrompt(transcript)}
                    disabled={isGeneratingPrompt}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-black rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:bg-gray-300"
                  >
                    Re-generate
                  </button>
                </div>
              )}
            </div>
            <div className="p-4">
              {promptError ? (
                <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-3">
                  {promptError}
                </div>
              ) : infographicPrompt ? (
                <>
                  <div className="h-48 p-3 text-sm border border-gray-200 rounded-md bg-gray-50 overflow-y-auto mb-4">
                    <div className="whitespace-pre-wrap">{infographicPrompt}</div>
                  </div>
                  
                  {/* Style Selection */}
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Infograph Style
                    </label>
                    <select
                      value={selectedStyle}
                      onChange={(e) => setSelectedStyle(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                    >
                      <option value="modern">🔥 Modern & Bold</option>
                      <option value="minimal">✨ Minimal & Clean</option>
                      <option value="corporate">💼 Corporate & Professional</option>
                      <option value="creative">🎨 Creative & Artistic</option>
                      <option value="dark">🌙 Dark Theme</option>
                      <option value="colorful">🌈 Bright & Colorful</option>
                    </select>
                  </div>

                  {/* Generate Button */}
                  <button
                    onClick={() => handleGenerateImage()}
                    disabled={isGeneratingImage || !infographicPrompt}
                    className="w-full px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {isGeneratingImage ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                        Generating Infograph...
                      </>
                    ) : (
                      "Generate Infograph"
                    )}
                  </button>
                </>
              ) : isGeneratingPrompt ? (
                <div className="h-64 flex items-center justify-center border border-gray-200 rounded-md bg-gray-50">
                  <div className="text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-500">Generating infograph prompt...</p>
                  </div>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center border border-gray-200 rounded-md bg-gray-50">
                  <p className="text-sm text-gray-500">Infograph prompt will appear here after transcript is processed</p>
                </div>
              )}
              {infographicPrompt && (
                <div className="mt-2 text-xs text-gray-500">
                  Prompt: {infographicPrompt.length.toLocaleString()} characters
                </div>
              )}
            </div>
          </div>

          {/* Bottom Right - Generated Image */}
          <div className="border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-medium text-black">
                  Generated Infograph
                  {isGeneratingImage && (
                    <span className="ml-2 text-xs text-gray-500">
                      <Loader2 className="w-3 h-3 animate-spin inline mr-1" />
                      Creating...
                    </span>
                  )}
                </h3>
                {generatedImages.length > 1 && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <span>{currentImageIndex + 1} of {generatedImages.length}</span>
                  </div>
                )}
              </div>
              {generatedImages.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleEditImage}
                    className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      // Download the current generated image
                      const currentImage = generatedImages[currentImageIndex]
                      if (currentImage) {
                        const link = document.createElement('a')
                        link.href = currentImage.imageUrl
                        link.download = `infograph-${currentImage.id}.png`
                        document.body.appendChild(link)
                        link.click()
                        document.body.removeChild(link)
                      }
                    }}
                    className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    Download
                  </button>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-black rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                  >
                    View Full Size
                  </button>
                </div>
              )}
            </div>
            <div className="p-4">
              {imageError ? (
                <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-3">
                  {imageError}
                </div>
              ) : generatedImages.length > 0 ? (
                <div className="space-y-4">
                  {/* Image Navigation */}
                  {generatedImages.length > 1 && !isGeneratingImage && (
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => setCurrentImageIndex(prev => Math.max(0, prev - 1))}
                        disabled={currentImageIndex === 0}
                        className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <div className="flex gap-1">
                        {generatedImages.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-2 h-2 rounded-full transition-all ${
                              index === currentImageIndex 
                                ? 'bg-black' 
                                : 'bg-gray-300 hover:bg-gray-400'
                            }`}
                          />
                        ))}
                        {isGeneratingImage && (
                          <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                        )}
                      </div>
                      <button
                        onClick={() => setCurrentImageIndex(prev => Math.min(generatedImages.length - 1, prev + 1))}
                        disabled={currentImageIndex === generatedImages.length - 1}
                        className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  
                  {/* Current Image or Loading */}
                  <div className="h-64 rounded-md bg-gray-50 overflow-hidden border border-gray-200 relative">
                    {isGeneratingImage ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-90">
                        <div className="text-center">
                          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-gray-400" />
                          <p className="text-sm text-gray-500 font-medium">Creating new version...</p>
                          <p className="text-xs text-gray-400 mt-1">Please wait</p>
                        </div>
                      </div>
                    ) : null}
                    <img
                      src={generatedImages[currentImageIndex]?.imageUrl}
                      alt={`Generated Infograph ${currentImageIndex + 1}`}
                      className={`w-full h-full object-contain transition-all duration-200 cursor-pointer ${
                        isGeneratingImage ? 'opacity-50' : 'hover:scale-105'
                      }`}
                      onClick={() => !isGeneratingImage && setIsModalOpen(true)}
                    />
                  </div>
                  
                  {/* Image Info */}
                  {!isGeneratingImage && (
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>Style: <span className="capitalize">{generatedImages[currentImageIndex]?.style}</span></div>
                      <div>Prompt: {generatedImages[currentImageIndex]?.prompt.slice(0, 100)}...</div>
                    </div>
                  )}
                </div>
              ) : isGeneratingImage ? (
                <div className="h-64 flex items-center justify-center border border-gray-200 rounded-md bg-gray-50">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-gray-400" />
                    <p className="text-sm text-gray-500 font-medium">Creating your infograph...</p>
                    <p className="text-xs text-gray-400 mt-1">This may take a few moments</p>
                  </div>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center border border-gray-200 rounded-md bg-gray-50">
                  <div className="text-center">
                    <div className="w-8 h-8 mx-auto mb-3 bg-gray-300 rounded-md"></div>
                    <p className="text-sm text-gray-500">Generated infograph will appear here</p>
                    <p className="text-xs text-gray-400 mt-1">Choose a style and click Generate</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Full Size Image Modal */}
      {isModalOpen && generatedImages.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75">
          <div className="relative max-w-7xl max-h-full w-full h-full flex items-center justify-center">
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black"
            >
              <X className="w-6 h-6 text-black" />
            </button>
            
            {/* Image */}
            <img
              src={generatedImages[currentImageIndex]?.imageUrl}
              alt={`Generated Infograph ${currentImageIndex + 1} - Full Size`}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            
            {/* Download Button */}
            <button
              onClick={() => {
                const currentImage = generatedImages[currentImageIndex]
                if (currentImage) {
                  const link = document.createElement('a')
                  link.href = currentImage.imageUrl
                  link.download = `infograph-${currentImage.id}.png`
                  document.body.appendChild(link)
                  link.click()
                  document.body.removeChild(link)
                }
              }}
              className="absolute bottom-4 right-4 z-10 px-4 py-2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black"
            >
              <span className="text-black font-medium">Download</span>
            </button>
          </div>
          
          {/* Background Overlay - Click to Close */}
          <div 
            className="absolute inset-0 -z-10" 
            onClick={() => setIsModalOpen(false)}
          />
        </div>
      )}

      {/* Edit Prompt Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75">
          <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-black">Edit Infograph Prompt</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-md transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            {/* Content */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Prompt
                </label>
                <textarea
                  value={editPrompt}
                  onChange={(e) => setEditPrompt(e.target.value)}
                  className="w-full h-32 p-3 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none"
                  placeholder="Describe the infograph you want to generate..."
                />
                <div className="mt-2 text-xs text-gray-500">
                  {editPrompt.length} characters
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Infograph Style
                </label>
                <select
                  value={editStyle}
                  onChange={(e) => setEditStyle(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                >
                  <option value="modern">🔥 Modern & Bold</option>
                  <option value="minimal">✨ Minimal & Clean</option>
                  <option value="corporate">💼 Corporate & Professional</option>
                  <option value="creative">🎨 Creative & Artistic</option>
                  <option value="dark">🌙 Dark Theme</option>
                  <option value="colorful">🌈 Bright & Colorful</option>
                </select>
                <div className="mt-2 text-xs text-gray-500">
                  Choose the visual style for your custom infograph
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitEdit}
                disabled={!editPrompt.trim() || isGeneratingImage}
                className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isGeneratingImage ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate New Version"
                )}
              </button>
            </div>
          </div>
          
          {/* Background Overlay - Click to Close */}
          <div 
            className="absolute inset-0 -z-10" 
            onClick={() => setIsEditModalOpen(false)}
          />
        </div>
      )}
    </div>
  )
}
