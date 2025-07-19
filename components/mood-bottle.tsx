"use client"

import { useState, useEffect } from "react"

interface MoodBottleProps {
  scent: {
    name: string
    description: string
    colors: string[]
    mood: string
    intensity: number
  }
  size?: "small" | "medium" | "large"
  showAnimation?: boolean
  onClick?: () => void
  isSelected?: boolean
}

export function MoodBottle({
  scent,
  size = "medium",
  showAnimation = false,
  onClick,
  isSelected = false,
}: MoodBottleProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (showAnimation) {
      setIsAnimating(true)
      const timer = setTimeout(() => setIsAnimating(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [showAnimation])

  const sizeClasses = {
    small: "w-16 h-20",
    medium: "w-24 h-32",
    large: "w-32 h-40",
  }

  const bottleSize = sizeClasses[size]

  return (
    <div
      className={`relative cursor-pointer transition-all duration-300 ${
        onClick ? "hover:scale-105" : ""
      } ${isSelected ? "scale-110" : ""}`}
      onClick={onClick}
    >
      {/* Bottle Container */}
      <div className={`${bottleSize} relative mx-auto`}>
        {/* Bottle Body */}
        <div
          className="absolute inset-x-2 bottom-0 top-6 rounded-b-2xl border-2 border-gray-300 overflow-hidden"
          style={{
            background: `linear-gradient(to bottom, ${scent.colors.join(", ")})`,
          }}
        >
          {/* Liquid Level */}
          <div
            className="absolute bottom-0 left-0 right-0 transition-all duration-1000"
            style={{
              height: `${scent.intensity * 100}%`,
              background: `linear-gradient(to top, ${scent.colors[0]}, ${scent.colors[1] || scent.colors[0]})`,
            }}
          />

          {/* Shimmer Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
        </div>

        {/* Bottle Neck */}
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-4 h-6 bg-gray-200 border border-gray-300 rounded-t-sm" />

        {/* Bottle Cap */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-6 h-3 bg-gradient-to-b from-gray-400 to-gray-500 rounded-t-md border border-gray-600" />

        {/* Spray Animation */}
        {isAnimating && (
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
            <div
              className="w-16 h-16 rounded-full opacity-60 animate-ping"
              style={{
                background: `radial-gradient(circle, ${scent.colors[0]}40, transparent)`,
              }}
            />
            <div
              className="absolute top-2 left-2 w-12 h-12 rounded-full opacity-40 animate-pulse"
              style={{
                background: `radial-gradient(circle, ${scent.colors[1] || scent.colors[0]}60, transparent)`,
              }}
            />
          </div>
        )}

        {/* Selection Ring */}
        {isSelected && <div className="absolute -inset-2 rounded-full border-2 border-purple-400 animate-pulse" />}
      </div>

      {/* Label */}
      <div className="mt-3 text-center">
        <div
          className={`font-medium text-gray-800 ${
            size === "small" ? "text-xs" : size === "medium" ? "text-sm" : "text-base"
          }`}
        >
          {scent.name}
        </div>
        {size !== "small" && <div className="text-xs text-gray-500 mt-1 italic">{scent.mood}</div>}
      </div>
    </div>
  )
}
