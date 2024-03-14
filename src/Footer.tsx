import React from "react"
import CommitHash from "virtual:commit-hash"

const Footer: React.FC = () => {
  return (
    <footer className="absolute bottom-0 left-0 right-0">
      <div className="flex items-center justify-center h-14 px-10 text-sm">
        <p>
          Version {APP_VERSION}.{CommitHash.substring(0, 7)}
        </p>
      </div>
    </footer>
  )
}

export default Footer
