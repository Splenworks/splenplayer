import DarkModeSwitchIcon from "./DarkModeSwitchIcon"
import { useState } from "react"
import { twJoin } from "tailwind-merge"

const DarkModeSwitch = () => {
  const [darkMode, setDarkMode] = useState(
    document.documentElement.classList.contains("dark"),
  )
  return (
    <div className="relative inline-block text-left w-[75px]">
      <input
        type="checkbox"
        className="hidden peer"
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
      <label
        className="block overflow-hidden cursor-pointer rounded-full group"
        htmlFor="darkModeSwitch"
      >
        <span
          className={twJoin(
            "inner block w-[200%] -ml-[100%] transition-[margin] ease-in duration-300",
            "both:content-[''] both:block both:float-left both:w-1/2 both:h-9 both:p-0 both:leading-9 both:text-white both:font-bold both:box-border",
            "before:pl-[10px] before:bg-neutral-600 after:pr-[10px] after:bg-neutral-200 after:text-right",
            "peer-checked:group-[]:ml-0",
          )}
        />
        <span className="block w-6 m-[5px] bg-white absolute top-0 bottom-0 right-10 rounded-full transition-all duration-300 ease-in peer-checked:group-[]:right-0">
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
