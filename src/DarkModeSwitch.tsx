import { DarkModeSwitch as DarkModeSwitchIcon } from "react-toggle-dark-mode"
import "./DarkModeSwitch.pcss"
import { useState } from "react"

const DarkModeSwitch = () => {
  const [darkMode, setDarkMode] = useState(
    document.documentElement.classList.contains("dark"),
  )
  return (
    <div className="darkmode-switch">
      <input
        type="checkbox"
        className="checkbox"
        name="darkModeSwitch"
        id="darkModeSwitch"
        checked={darkMode}
        onChange={() => {
          setDarkMode((darkMode) => !darkMode)
          document.documentElement.classList.toggle("dark")
          localStorage.setItem(
            "theme",
            document.documentElement.classList.contains("dark")
              ? "dark"
              : "light",
          )
        }}
      />
      <label className="label" htmlFor="darkModeSwitch">
        <span className="inner" />
        <span className="switch">
          <DarkModeSwitchIcon
            size={16}
            checked={darkMode}
            sunColor="black"
            moonColor="black"
            style={{ margin: "4px" }}
            onChange={() => {}}
            className="text-black"
          />
        </span>
      </label>
    </div>
  )
}

export default DarkModeSwitch
