import React from "react"
import { twMerge } from "tailwind-merge"
import CaptionControl from "./CaptionControl"
import FullScreenButton from "./FullScreenButton"
import PlayPauseButton from "./PlayPauseButton"
import PlaySpeedControl from "./PlaySpeedControl"
import PrevNextButton from "./PrevNextButton"
import RepeatButton from "./RepeatButton"
import SubtitleSyncControl from "./SubtitleSyncControl"
import VolumeControl from "./VolumeControl"

interface VideoControlsBottomProps {
  showControls: boolean
  isPaused: boolean
  togglePlayPause: () => void
  hasMultipleMedia: boolean
  isPreviousMediaDisabled: boolean
  isNextMediaDisabled: boolean
  goToPreviousMedia: () => void
  goToNextMedia: () => void
  isRepeatEnabled: boolean
  toggleRepeatEnabled: () => void
  currentTime: string
  totalTime: string
  volume: string
  handleVolumeChange: (volume: string) => void
  hasSubtitles: boolean
  showSubtitle: boolean
  toggleShowSubtitle: () => void
  subtitleTracks: string[]
  selectedSubtitleTrack: string | null
  handleSubtitleTrackChange: (track: string) => void
  subtitleOffsetMs: number
  changeSubtitleOffsetBy: (deltaMs: number) => void
  playSpeed: number
  handlePlaybackSpeed: (speed: number) => void
  isFullScreen: boolean
  toggleFullScreen: () => void
}

const VideoControlsBottom: React.FC<VideoControlsBottomProps> = ({
  showControls,
  isPaused,
  togglePlayPause,
  hasMultipleMedia,
  isPreviousMediaDisabled,
  isNextMediaDisabled,
  goToPreviousMedia,
  goToNextMedia,
  isRepeatEnabled,
  toggleRepeatEnabled,
  currentTime,
  totalTime,
  volume,
  handleVolumeChange,
  hasSubtitles,
  showSubtitle,
  toggleShowSubtitle,
  subtitleTracks,
  selectedSubtitleTrack,
  handleSubtitleTrackChange,
  subtitleOffsetMs,
  changeSubtitleOffsetBy,
  playSpeed,
  handlePlaybackSpeed,
  isFullScreen,
  toggleFullScreen,
}) => {
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
