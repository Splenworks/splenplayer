import DarkModeSwitchIcon from "./DarkModeSwitchIcon"
import { useState } from "react"
import { twJoin } from "tailwind-merge"
import { getDarkmode, toggleDarkmode } from "./utils/darkmode"

const DarkModeSwitch = () => {
  const [darkMode, setDarkMode] = useState(getDarkmode())
  return (
    <div className="relative inline-block w-[75px] text-left">
      <input
        type="checkbox"
        className="peer hidden"
        name="darkModeSwitch"
        id="darkModeSwitch"
        checked={darkMode}
        onChange={() => {
          setDarkMode((darkMode) => !darkMode)
          toggleDarkmode()
        }}
      />
      <label
        className="group block cursor-pointer overflow-hidden rounded-full"
        htmlFor="darkModeSwitch"
      >
        <span
          className={twJoin(
            "inner -ml-[100%] block w-[200%] transition-[margin] duration-300 ease-in",
            "both:float-left both:box-border both:block both:h-9 both:w-1/2 both:p-0 both:font-bold both:leading-9 both:text-white both:content-['']",
            "before:bg-neutral-600 before:pl-[10px] after:bg-neutral-200 after:pr-[10px] after:text-right",
            "peer-checked:group-[]:ml-0",
          )}
        />
        <span className="absolute bottom-0 right-10 top-0 m-[5px] block w-6 rounded-full bg-white transition-all duration-300 ease-in peer-checked:group-[]:right-0">
          <DarkModeSwitchIcon
            darkMode={darkMode}
            sunColor="black"
            moonColor="black"
          />
        </span>
      </label>
    </div>
  )
}

export default DarkModeSwitch
