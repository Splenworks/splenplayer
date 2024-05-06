import React from "react"
import { twMerge } from "tailwind-merge"

interface IconButtonProps {
  svgIcon: React.FunctionComponent
  id?: string
  className?: string
  onClick?: () => void
}

const IconButton: React.FC<IconButtonProps> = ({
  svgIcon,
  id,
  className,
  onClick,
}) => {
  return (
    <button
      id={id}
      className={twMerge(
        "w-10 h-10 flex justify-center items-center hover:bg-zinc-500 hover:bg-opacity-50 rounded-full transition-colors duration-300 ease-in-out outline-none focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-opacity-50",
        className,
      )}
      onClick={onClick}
    >
      {svgIcon({ className: "w-6 h-6 text-white" })}
    </button>
  )
}

export default IconButton
