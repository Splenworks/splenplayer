import React from "react"
import DarkModeSwitch from "./DarkModeSwitch"
import LanguageSelect from "./LanguageSelect"
import { ArrowUturnLeftIcon } from "@heroicons/react/16/solid"
import { useTranslation } from "react-i18next"

interface HeaderProps {
  exited: boolean
  goBack: () => void
}

const Header: React.FC<HeaderProps> = ({ exited, goBack }) => {
  const { t } = useTranslation()
  return (
    <header className="absolute top-0 right-0 left-0 bg-white dark:bg-neutral-900">
      <div className="mx-8 flex h-16 items-center justify-center md:mx-16">
        <div className="flex flex-1">
          {exited && (
            <div className="flex cursor-pointer items-center gap-2" onClick={goBack}>
              <ArrowUturnLeftIcon className="h-5 w-5 text-black dark:text-white" />
              <span className="text-md font-semibold text-black dark:text-white">
                {t("header.goBack")}
              </span>
            </div>
          )}
        </div>
        <p className="text-xl font-semibold text-black dark:text-white">
          <span className="bg-gradient-to-r from-pink-700 to-pink-900 bg-clip-text text-transparent dark:from-pink-700 dark:to-pink-500">
            Splen
          </span>
          Player
        </p>
        <div className="flex flex-1 items-center justify-end gap-1">
          <LanguageSelect />
          <DarkModeSwitch />
        </div>
      </div>
    </header>
  )
}

export default Header
