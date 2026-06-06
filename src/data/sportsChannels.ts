/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Channel } from "../types";

export const SPORTS_CHANNELS: Channel[] = [
  {
    id: "bein_sports_xtra_esp",
    name: "beIN Sports XTRA En Español",
    url: "https://bein-esp-xumo.amagi.tv/playlistR1080p.m3u8",
    category: "Sports",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/BeIN_Sports_logo.svg/320px-BeIN_Sports_logo.svg.png",
    description: "beIN Sports XTRA offering world class live sports programming in Spanish.",
    groupTitle: "Sports"
  },
  {
    id: "dd_sports",
    name: "DD Sports",
    url: "https://cdn-6.pishow.tv/live/13/master.m3u8",
    category: "Sports",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/DD_Sports_Logo.svg/300px-DD_Sports_Logo.svg.png",
    description: "Prasar Bharati's public service sports broadcaster offering domestic and international coverage in India.",
    groupTitle: "Sports"
  },
  {
    id: "real_madrid_tv",
    name: "Real Madrid TV",
    url: "https://rmtv.akamaized.net/hls/live/2043153/rmtv-es-web/bitrate_3.m3u8",
    category: "Sports",
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Real_Madrid_CF.svg/200px-Real_Madrid_CF.svg.png",
    description: "Official television channel of the Spanish football club Real Madrid containing match replays and lifestyle broadcasts.",
    groupTitle: "Sports"
  },
  {
    id: "redbull_tv_custom",
    name: "Red Bull TV",
    url: "https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master_3360.m3u8",
    category: "Sports",
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/f/f5/Red_Bull_TV_logo.svg/198px-Red_Bull_TV_logo.svg.png",
    description: "Dynamic live events, sports coverage, and adventures from Red Bull's official television platform.",
    groupTitle: "Sports"
  }
];
