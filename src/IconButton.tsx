import React from "react"
import { twMerge } from "tailwind-merge"

interface IconButtonProps {
  svgIcon: React.FunctionComponent<{ className?: string }>
  id?: string
  className?: string
  iconClassName?: string
  disabled?: boolean
  onClick?: () => void
}

const IconButton: React.FC<IconButtonProps> = ({
  svgIcon,
  id,
  className,
  iconClassName,
  disabled = false,
  onClick,
}) => {
  return (
    <button
      id={id}
      tabIndex={-1}
      disabled={disabled}
      className={twMerge(
        "hover:bg-opacity-50 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full outline-hidden transition-colors duration-300 ease-in-out hover:bg-zinc-500/50 focus:outline-hidden",
        "disabled:cursor-default disabled:bg-transparent disabled:hover:bg-transparent disabled:opacity-70",
        className,
      )}
      onClick={onClick}
      onKeyDown={(e) => {
        e.preventDefault()
      }}
    >
      {React.createElement(svgIcon, {
        className: twMerge("h-6 w-6 text-white", disabled && "text-white/35", iconClassName),
      })}
    </button>
  )
}

export default IconButton
