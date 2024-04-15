import React from "react"
import { Trans } from "react-i18next"
import CommitHash from "virtual:commit-hash"

const otherProducts = [
  {
    name: "SplenView",
    url: "https://splenview.com",
  },
  {
    name: "txtpad.io",
    url: "https://txtpad.io",
  },
]

const Footer: React.FC = () => {
  const randomProduct =
    otherProducts[Math.floor(Math.random() * otherProducts.length)]
  return (
    <footer className="absolute bottom-0 left-0 right-0 bg-white dark:bg-neutral-900">
      <div className="flex items-center justify-center h-16 mx-8 md:mx-16">
        <div className="flex-1 hidden sm:block"></div>
        <p className="text-black dark:text-white text-sm">
          <Trans
            i18nKey="footer.checkOutProduct"
            components={{
              link: (
                <a
                  href={randomProduct.url}
                  target="_blank"
                  className="underline"
                >
                  {randomProduct.name}
                </a>
              ),
            }}
          />
        </p>
        <div className="flex-1 text-sm text-right text-white dark:text-neutral-900 hidden sm:block">
          Version {APP_VERSION}.{CommitHash.substring(0, 7)}
        </div>
      </div>
    </footer>
  )
}

export default Footer
