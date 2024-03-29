import React from "react"
import { MoonIcon, SunIcon } from "@heroicons/react/16/solid"

const Header: React.FC = () => {
  return (
    <header className="absolute top-0 left-0 right-0 bg-white dark:bg-neutral-900">
      <div className="flex items-center h-16 px-16 text-lg font-semibold">
        <div className="flex-auto"></div>
        <p className="text-black dark:text-white">SplenPlayer</p>
        <div className="flex-auto flex items-center justify-end">
          <span
            onClick={() => {
              document.documentElement.classList.toggle("dark")
              localStorage.setItem(
                "theme",
                document.documentElement.classList.contains("dark")
                  ? "dark"
                  : "light",
              )
            }}
            className="flex group items-center justify-center rounded-full hover:bg-gray-200 cursor-pointer h-8 w-8"
          >
            <SunIcon className="hidden dark:block text-gray-300 group-hover:text-gray-600 h-4 w-4" />
            <MoonIcon className="dark:hidden text-gray-400 group-hover:text-gray-600 h-4 w-4" />
          </span>
        </div>
      </div>
    </header>
  )
}

export default Header
