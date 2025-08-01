import React from "react"
import { twJoin } from "tailwind-merge"

const Spinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center">
      <div
        className={twJoin(
          "inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gray-300 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]",
        )}
        role="status"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  )
}

export default Spinner
