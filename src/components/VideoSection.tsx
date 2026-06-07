import React from "react";
import IPTVPlayer from "./IPTVPlayer";
import { Channel } from "../types";

interface VideoSectionProps {
  activeChannel: Channel | null;
  popupConfig: any;
  showFbPopup: boolean;
  showCustomPopup: boolean;
  showFbSharePopup: boolean;
  onFbDismiss: () => void;
  onCustomDismiss: () => void;
  onFbShareDismiss: () => void;
}

export default function VideoSection({ 
  activeChannel,
  popupConfig,
  showFbPopup,
  showCustomPopup,
  showFbSharePopup,
  onFbDismiss,
  onCustomDismiss,
  onFbShareDismiss
}: VideoSectionProps) {
  return (
    <div className="w-full relative lg:sticky lg:top-24 z-30 lg:self-start">
      <IPTVPlayer 
        channel={activeChannel} 
        popupConfig={popupConfig}
        showFbPopup={showFbPopup}
        showCustomPopup={showCustomPopup}
        showFbSharePopup={showFbSharePopup}
        onFbDismiss={onFbDismiss}
        onCustomDismiss={onCustomDismiss}
        onFbShareDismiss={onFbShareDismiss}
        onAutoPlayFailed={() => {
          // Custom prompt handled gracefully by player internally
        }}
      />
    </div>
  );
}
