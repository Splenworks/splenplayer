import React from "react"
import CommitHash from "virtual:commit-hash"
import { MoonIcon, SunIcon } from "@heroicons/react/16/solid"

const Footer: React.FC = () => {
  return (
    <footer className="absolute bottom-0 left-0 right-0 bg-white dark:bg-neutral-900">
      <div className="flex items-center justify-between h-16 px-16">
        <p className="text-black dark:text-white text-sm">
          Version {APP_VERSION}.{CommitHash.substring(0, 7)}
        </p>
        <div className="flex items-center justify-end">
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
    </footer>
  )
}

export default Footer
