import React from "react"
import { twMerge } from "tailwind-merge"
import CaptionControl from "./CaptionControl"
import FullScreenButton from "./FullScreenButton"
import { useFullScreen } from "./hooks/useFullScreen"
import { usePlayback } from "./hooks/usePlayback"
import PlayPauseButton from "./PlayPauseButton"
import PlaySpeedControl from "./PlaySpeedControl"
import PrevNextButton from "./PrevNextButton"
import RepeatButton from "./RepeatButton"
import SubtitleSyncControl from "./SubtitleSyncControl"
import VolumeControl from "./VolumeControl"

interface VideoControlsBottomProps {
  showControls: boolean
  hasMultipleMedia: boolean
  isPreviousMediaDisabled: boolean
  isNextMediaDisabled: boolean
  goToPreviousMedia: () => void
  goToNextMedia: () => void
  isRepeatEnabled: boolean
  toggleRepeatEnabled: () => void
  hasSubtitles: boolean
  showSubtitle: boolean
  toggleShowSubtitle: () => void
  subtitleTracks: string[]
  selectedSubtitleTrack: string | null
  handleSubtitleTrackChange: (track: string) => void
  subtitleOffsetMs: number
  changeSubtitleOffsetBy: (deltaMs: number) => void
}

const VideoControlsBottom: React.FC<VideoControlsBottomProps> = ({
  showControls,
  hasMultipleMedia,
  isPreviousMediaDisabled,
  isNextMediaDisabled,
  goToPreviousMedia,
  goToNextMedia,
  isRepeatEnabled,
  toggleRepeatEnabled,
  hasSubtitles,
  showSubtitle,
  toggleShowSubtitle,
  subtitleTracks,
  selectedSubtitleTrack,
  handleSubtitleTrackChange,
  subtitleOffsetMs,
  changeSubtitleOffsetBy,
}) => {
  const { isPaused, togglePlayPause, currentTime, totalTime, volume, handleVolumeChange, playSpeed, handlePlaybackSpeed } = usePlayback()
  const { isFullScreen, toggleFullScreen } = useFullScreen()
  return (
    <div className="absolute right-0 bottom-11 left-0 mx-4 flex items-end justify-between">
      <div className="flex items-center justify-center gap-2">
        {hasMultipleMedia && (
          <PrevNextButton
            direction="prev"
            showControls={showControls}
            disabled={isPreviousMediaDisabled}
            onClick={goToPreviousMedia}
          />
        )}
        <PlayPauseButton
          isPaused={isPaused}
          showControls={showControls}
          togglePlayPause={togglePlayPause}
        />
        {hasMultipleMedia && (
          <PrevNextButton
            direction="next"
            showControls={showControls}
            disabled={isNextMediaDisabled}
            onClick={goToNextMedia}
          />
        )}
        <RepeatButton
          showControls={showControls}
          isRepeatEnabled={isRepeatEnabled}
          toggleRepeat={toggleRepeatEnabled}
        />
        <div className="hidden pl-2 font-mono text-sm font-semibold sm:block">
          <span className="pr-2">{currentTime}</span>/<span className="pl-2">{totalTime}</span>
        </div>
      </div>
      <div className="flex items-end justify-center gap-2">
        <VolumeControl volume={volume} handleVolumeChange={handleVolumeChange} />
        {hasSubtitles && (
          <div className="relative mr-0.5">
            <CaptionControl
              filled={showSubtitle}
              onToggle={toggleShowSubtitle}
              subtitleTracks={subtitleTracks}
              selectedSubtitleTrack={selectedSubtitleTrack}
              onSelectSubtitleTrack={handleSubtitleTrackChange}
            />
          </div>
        )}
        {hasSubtitles && (
          <div className="relative mr-0.5">
            <SubtitleSyncControl
              subtitleOffsetMs={subtitleOffsetMs}
              changeSubtitleOffsetBy={changeSubtitleOffsetBy}
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

export default VideoControlsBottom
