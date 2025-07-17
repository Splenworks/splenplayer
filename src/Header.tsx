import React from "react"
import DarkModeSwitch from "./DarkModeSwitch"

const Header: React.FC = () => {
  return (
    <header className="absolute left-0 right-0 top-0 bg-white dark:bg-neutral-900">
      <div className="mx-8 flex h-16 items-center justify-center md:mx-16">
        <div className="flex-1"></div>
        <p className="text-xl font-semibold text-black dark:text-white">
          <span className="bg-gradient-to-r from-pink-700 to-pink-900 dark:from-pink-700 dark:to-pink-500 text-transparent bg-clip-text">Splen</span>
          Player
        </p>
        <div className="flex flex-1 items-center justify-end">
          <DarkModeSwitch />
        </div>
      </div>
    </header>
  )
}

export default Header
