import React from "react"
import CommitHash from "virtual:commit-hash"

const Footer: React.FC = () => {
  return (
    <footer className="absolute bottom-0 left-0 right-0 bg-white dark:bg-neutral-900">
      <div className="flex relative items-center justify-center h-16 mx-8 md:mx-16">
        <p className="text-black dark:text-white text-sm">
          Version {APP_VERSION}.{CommitHash.substring(0, 7)}
        </p>
      </div>
    </footer>
  )
}

export default Footer
