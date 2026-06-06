/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Channel } from "../types";

/**
 * Parses a standard M3U or M3U8 playlist string into structured Channel items.
 */
export function parseM3U(content: string, playlistName: string): Channel[] {
  const lines = content.split(/\r?\n/);
  const channels: Channel[] = [];
  
  let currentInfo: {
    name: string;
    logoUrl?: string;
    category?: string;
    groupTitle?: string;
  } | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (line.startsWith("#EXTINF:")) {
      // Extract metadata from #EXTINF line
      // E.g., #EXTINF:-1 tvg-id="12" tvg-name="HBO-HD" tvg-logo="https://..." group-title="Movies", HBO HD
      
      const logoMatch = line.match(/tvg-logo="([^"]+)"/i);
      const groupMatch = line.match(/group-title="([^"]+)"/i);
      
      // The channel name is usually the last part of the EXINF line after the comma
      const commaIndex = line.lastIndexOf(",");
      let name = "";
      if (commaIndex !== -1) {
        name = line.substring(commaIndex + 1).trim();
      }

      // If name is empty, try to match tvg-name
      if (!name) {
        const tvgNameMatch = line.match(/tvg-name="([^"]+)"/i);
        name = tvgNameMatch ? tvgNameMatch[1] : `Channel ${channels.length + 1}`;
      }

      const logoUrl = logoMatch ? logoMatch[1] : undefined;
      const groupTitle = groupMatch ? groupMatch[1] : undefined;
      const category = groupTitle || "Uncategorized";

      currentInfo = {
        name,
        logoUrl,
        category,
        groupTitle,
      };
    } else if (line.startsWith("#")) {
      // Other metadata/comment lines, ignore for now
      continue;
    } else if (line.startsWith("http://") || line.startsWith("https://") || line.includes(".m3u8") || line.includes(".ts")) {
      // This is a stream URL line
      if (currentInfo) {
        channels.push({
          id: `${playlistName.replace(/\s+/g, "_")}_${channels.length}_${Date.now()}`,
          name: currentInfo.name,
          url: line,
          category: currentInfo.category || "General",
          logoUrl: currentInfo.logoUrl,
          groupTitle: currentInfo.groupTitle,
        });
        currentInfo = null;
      } else {
        // Direct stream URL without preceding EXINF info
        const urlName = line.split("/").pop() || "Direct Stream";
        channels.push({
          id: `direct_${channels.length}_${Date.now()}`,
          name: urlName.length > 30 ? "Direct Stream" : urlName,
          url: line,
          category: "Direct Streams",
        });
      }
    }
  }

  return channels;
}
