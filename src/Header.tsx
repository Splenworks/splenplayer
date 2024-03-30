import React from "react"
import DarkModeSwitch from "./DarkModeSwitch"

const Header: React.FC = () => {
  return (
    <header className="absolute top-0 left-0 right-0 bg-white dark:bg-neutral-900">
      <div className="flex items-center justify-center h-16 px-16 text-lg font-semibold">
        <div className="flex-1"></div>
        <p className="text-black dark:text-white">SplenPlayer</p>
        <div className="flex-1 flex justify-end items-center">
          <DarkModeSwitch />
        </div>
      </div>
    </header>
  )
}

export default Header
