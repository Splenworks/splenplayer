import React from "react"
import CommitHash from "virtual:commit-hash"

const Footer: React.FC = () => {
  return (
    <footer className="absolute bottom-0 left-0 right-0 bg-white dark:bg-neutral-900">
      <div className="flex items-center justify-center h-16 mx-8 md:mx-16">
        <div className="flex-1 hidden sm:block"></div>
        <p className="text-black dark:text-white text-sm">
          Check out our other product{" "}
          <a href="https://splenview.com" target="_blank" className="underline">
            SplenView
          </a>
        </p>
        <div className="flex-1 text-sm text-right text-white dark:text-neutral-900 hidden sm:block">
          Version {APP_VERSION}.{CommitHash.substring(0, 7)}
        </div>
      </div>
    </footer>
  )
}

export default Footer
