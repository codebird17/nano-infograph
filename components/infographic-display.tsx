import type { InfographicData } from "@/types/infographic"

interface InfographicDisplayProps {
  data: InfographicData
}

export default function InfographicDisplay({ data }: InfographicDisplayProps) {
  console.log("[v0] InfographicDisplay: Rendering with data:", {
    hasData: !!data,
    imageUrl: data?.imageUrl,
    imageUrlType: typeof data?.imageUrl,
    summaryLength: data?.summary?.length || 0,
    hasSummary: !!data?.summary,
  })

  return (
    <div className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-white/10 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Infographic Image */}
        <div className="w-full">
          <h3 className="text-2xl font-semibold mb-6 text-white">Generated Infograph</h3>
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
            <img
              src={data.imageUrl || "/infograph-placeholder.jpg"}
              alt="Generated Infograph"
              className="w-full h-auto rounded-lg shadow-xl"
              onLoad={() => {
                console.log("[v0] InfographicDisplay: Image loaded successfully:", data.imageUrl)
              }}
              onError={(e) => {
                console.log("[v0] InfographicDisplay: Image failed to load")
                console.log("[v0] InfographicDisplay: Original URL:", data.imageUrl)
                console.log("[v0] InfographicDisplay: Error event:", e)
                const target = e.target as HTMLImageElement
                console.log("[v0] InfographicDisplay: Falling back to placeholder image")
                target.src = "/infograph-placeholder.jpg"
              }}
            />
          </div>
        </div>

        {/* Summary Text */}
        <div className="w-full">
          <h3 className="text-2xl font-semibold mb-6 text-white">AI Summary</h3>
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 max-h-[600px] overflow-y-auto">
            <div className="space-y-4">
              {data.summary.split("\n").map(
                (paragraph, index) =>
                  paragraph.trim() && (
                    <p key={index} className="text-white/90 leading-relaxed text-sm">
                      {paragraph}
                    </p>
                  ),
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
