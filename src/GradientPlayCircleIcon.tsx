import React from "react"

interface GradientPlayCircleIconProps {
  className?: string
}

const GradientPlayCircleIcon: React.FC<GradientPlayCircleIconProps> = ({
  className = "h-6 w-6",
}) => {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Gradient for light mode */}
        <linearGradient id="playGradientLight" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#be185d" /> {/* pink-700 */}
          <stop offset="100%" stopColor="#831843" /> {/* pink-900 */}
        </linearGradient>

        {/* Gradient for dark mode */}
        <linearGradient id="playGradientDark" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#be185d" /> {/* pink-700 */}
          <stop offset="100%" stopColor="#ec4899" /> {/* pink-500 */}
        </linearGradient>
      </defs>

      {/* Light mode circle */}
      <circle
        cx="12"
        cy="12"
        r="10"
        fill="url(#playGradientLight)"
        className="dark:hidden"
      />

      {/* Dark mode circle */}
      <circle
        cx="12"
        cy="12"
        r="10"
        fill="url(#playGradientDark)"
        className="hidden dark:block"
      />

      {/* Play triangle */}
      <path
        d="M10.8 8.25a.75.75 0 0 0-1.136.643v6.214a.75.75 0 0 0 1.136.643l4.423-3.107a.75.75 0 0 0 0-1.286L10.8 8.25z"
        fill="white"
      />
    </svg>
  )
}

export default GradientPlayCircleIcon
