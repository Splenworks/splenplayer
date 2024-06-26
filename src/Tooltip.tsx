import React, { PropsWithChildren } from "react"
import { twJoin } from "tailwind-merge"

interface TooltipProps {
  text: string
  place?: "bottom" | "top"
  align?: "left" | "right" | "center"
}

const Tooltip: React.FC<PropsWithChildren<TooltipProps>> = ({
  children,
  text,
  place = "top",
  align = "center",
}) => {
  if (!text) {
    return <>{children}</>
  }

  return (
    <div className="relative cursor-pointer">
      <div className="peer">{children}</div>
      <div
        className={twJoin(
          "absolute transform opacity-0 peer-hover:opacity-100 transition-opacity duration-300 ease-in-out",
          place === "top"
            ? "bottom-full -translate-y-2"
            : "top-full translate-y-2",
          align === "left"
            ? "left-0"
            : align === "right"
              ? "right-0"
              : "left-1/2 -translate-x-1/2",
        )}
        style={{ width: "max-content" }}
      >
        <div className="px-2 py-1 bg-zinc-500 rounded bg-opacity-50">
          <p className="font-normal text-xs text-white">{text}</p>
        </div>
      </div>
      <div
        className={twJoin(
          "absolute border-solid border-opacity-50 border-x-transparent border-x-[6px] left-1/2 transform -translate-x-1/2 opacity-0 peer-hover:opacity-100 transition-opacity duration-300 ease-in-out",
          place === "bottom"
            ? "border-b-zinc-500 border-b-[6px] border-t-0 top-full translate-y-[2px]"
            : "border-t-zinc-500 border-t-[6px] border-b-0 bottom-full -translate-y-[2px]",
        )}
      ></div>
    </div>
  )
}

export default Tooltip
