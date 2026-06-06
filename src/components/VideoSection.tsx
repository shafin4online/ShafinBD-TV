import React from "react";
import IPTVPlayer from "./IPTVPlayer";
import { Channel } from "../types";

interface VideoSectionProps {
  activeChannel: Channel | null;
  onChannelOffline?: (channelId: string) => void;
}

export default function VideoSection({ activeChannel, onChannelOffline }: VideoSectionProps) {
  return (
    <div className="w-full relative lg:sticky lg:top-24 z-30 lg:self-start">
      <IPTVPlayer 
        channel={activeChannel} 
        onAutoPlayFailed={() => {
          // Custom prompt handled gracefully by player internally
        }}
        onChannelOffline={onChannelOffline}
      />
    </div>
  );
}
