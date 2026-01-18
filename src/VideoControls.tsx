import React from "react"
import { twMerge } from "tailwind-merge"
import CaptionButton from "./CaptionButton"
import FullScreenButton from "./FullScreenButton"
import PlayPauseButton from "./PlayPauseButton"
import PlaySpeedControl from "./PlaySpeedControl"
import PrevNextButton from "./PrevNextButton"
import VolumeControl from "./VolumeControl"

interface VideoControlsProps {
  showControls: boolean
  isPaused: boolean
  togglePlayPause: () => void
  mediaFilesCount: number
  currentMediaIndex: number
  setCurrentMediaIndex: (index: number) => void
  currentTime: string
  totalTime: string
  volume: string
  handleVolumeChange: (volume: string) => void
  hasSubtitles: boolean
  showSubtitle: boolean
  toggleShowSubtitle: () => void
  playSpeed: number
  handlePlaybackSpeed: (speed: number) => void
  isFullScreen: boolean
  toggleFullScreen: () => void
}

const VideoControls: React.FC<VideoControlsProps> = ({
  showControls,
  isPaused,
  togglePlayPause,
  mediaFilesCount,
  currentMediaIndex,
  setCurrentMediaIndex,
  currentTime,
  totalTime,
  volume,
  handleVolumeChange,
  hasSubtitles,
  showSubtitle,
  toggleShowSubtitle,
  playSpeed,
  handlePlaybackSpeed,
  isFullScreen,
  toggleFullScreen,
}) => {
  return (
    <div className="absolute right-0 bottom-11 left-0 mx-4 flex items-end justify-between">
      <div className="flex items-center justify-center gap-2">
        <PlayPauseButton
          isPaused={isPaused}
          showControls={showControls}
          togglePlayPause={togglePlayPause}
        />
        {mediaFilesCount > 1 && currentMediaIndex > 0 && (
          <PrevNextButton
            direction="prev"
            showControls={showControls}
            currentIndex={currentMediaIndex}
            setCurrentIndex={setCurrentMediaIndex}
          />
        )}
        {mediaFilesCount > 1 && currentMediaIndex < mediaFilesCount - 1 && (
          <PrevNextButton
            direction="next"
            showControls={showControls}
            currentIndex={currentMediaIndex}
            setCurrentIndex={setCurrentMediaIndex}
          />
        )}
        <div className="hidden pl-2 font-mono text-sm font-semibold sm:block">
          <span className="pr-2">{currentTime}</span>/
          <span className="pl-2">{totalTime}</span>
        </div>
      </div>
      <div className="flex items-end justify-center gap-2">
        <VolumeControl volume={volume} handleVolumeChange={handleVolumeChange} />
        {hasSubtitles && (
          <div className="mr-0.5">
            <CaptionButton
              filled={showSubtitle}
              onToggle={toggleShowSubtitle}
            />
          </div>
        )}
        <div className={twMerge("relative", !hasSubtitles && "mr-0.5")}>
          <PlaySpeedControl playSpeed={playSpeed} handlePlaybackSpeed={handlePlaybackSpeed} />
        </div>
        <FullScreenButton
          isFullScreen={isFullScreen}
          onClick={() => {
            if (showControls) {
              toggleFullScreen()
            }
          }}
        />
      </div>
    </div>
  )
}

export default VideoControls
