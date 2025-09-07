"use client"

import React from "react"

export default function Loader() {
  const messages = [
    "Analyzing transcript...",
    "Brainstorming visual concepts...",
    "Sketching out the infograph...",
    "Adding colors and icons...",
    "Finalizing the summary...",
    "Almost there!",
  ]
  const [message, setMessage] = React.useState(messages[0])

  React.useEffect(() => {
    let index = 0
    const interval = setInterval(() => {
      index = (index + 1) % messages.length
      setMessage(messages[index])
    }, 2500)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="text-center flex flex-col items-center justify-center p-8">
      <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin"></div>
      <p className="mt-4 text-sm text-gray-600">{message}</p>
    </div>
  )
}
