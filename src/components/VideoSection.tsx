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
  isFloating?: boolean;
  onRestore?: () => void;
}

export default function VideoSection({ 
  activeChannel,
  popupConfig,
  showFbPopup,
  showCustomPopup,
  showFbSharePopup,
  onFbDismiss,
  onCustomDismiss,
  onFbShareDismiss,
  isFloating = false,
  onRestore
}: VideoSectionProps) {
  return (
    <div className="w-full sticky top-[56px] sm:top-[64px] md:top-[80px] lg:top-24 z-40 bg-[#050505] lg:self-start transform-gpu shadow-lg shadow-black/80">
      <IPTVPlayer 
        channel={activeChannel} 
        popupConfig={popupConfig}
        showFbPopup={showFbPopup}
        showCustomPopup={showCustomPopup}
        showFbSharePopup={showFbSharePopup}
        onFbDismiss={onFbDismiss}
        onCustomDismiss={onCustomDismiss}
        onFbShareDismiss={onFbShareDismiss}
        isFloating={isFloating}
        onRestore={onRestore}
        onAutoPlayFailed={() => {
          // Custom prompt handled gracefully by player internally
        }}
      />
    </div>
  );
}
