import React from "react";
import IPTVPlayer from "./IPTVPlayer";
import { Channel } from "../types";

interface VideoSectionProps {
  activeChannel: Channel | null;
  popupConfig: any;
  showFbPopup: boolean;
  showCustomPopup: boolean;
  onFbDismiss: () => void;
  onCustomDismiss: () => void;
}

export default function VideoSection({ 
  activeChannel,
  popupConfig,
  showFbPopup,
  showCustomPopup,
  onFbDismiss,
  onCustomDismiss
}: VideoSectionProps) {
  return (
    <div className="w-full relative lg:sticky lg:top-24 z-30 lg:self-start">
      <IPTVPlayer 
        channel={activeChannel} 
        popupConfig={popupConfig}
        showFbPopup={showFbPopup}
        showCustomPopup={showCustomPopup}
        onFbDismiss={onFbDismiss}
        onCustomDismiss={onCustomDismiss}
        onAutoPlayFailed={() => {
          // Custom prompt handled gracefully by player internally
        }}
      />
    </div>
  );
}
