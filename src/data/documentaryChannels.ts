/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Channel } from "../types";

export const DOCUMENTARY_CHANNELS: Channel[] = [
  {
    id: "bbc_earth_us",
    name: "BBC Earth US",
    url: "https://amg00793-amg00793c6-xumo-us-2669.playouts.now.amagi.tv/BBCStudios-BBCEarthA-hls/playlist540p.m3u8",
    category: "Documentary",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/BBC_Earth_2016.svg/200px-BBC_Earth_2016.svg.png",
    description: "Incredible stories from our planet, showcasing nature, science, and the wonders of the world.",
    groupTitle: "Documentary"
  },
  {
    id: "cna_originals",
    name: "CNA Originals",
    url: "https://amg01082-cna-amg01082c1-rlaxx-us-11304.playouts.now.amagi.tv/playlist480p.m3u8",
    category: "Documentary",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Channel_News_Asia_Logo.svg/240px-Channel_News_Asia_Logo.svg.png",
    description: "Deep-dive investigative documentaries and human interest features from across Asia.",
    groupTitle: "Documentary"
  },
  {
    id: "history_tv_18",
    name: "History TV 18",
    url: "https://live.thebosstv.com:30443/dwlive/HISTORY/chunks.m3u8",
    category: "Documentary",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/History_Logo.svg/150px-History_Logo.svg.png",
    description: "Enthusiastic history, technology, survival, and adventure programs.",
    groupTitle: "Documentary"
  },
  {
    id: "wild_nature_custom",
    name: "Wild Nature",
    url: "https://wildearth-plex.amagi.tv/master.m3u8",
    category: "Documentary",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/WildEarth_logo_white.png/220px-WildEarth_logo_white.png",
    description: "Unfiltered, interactive daily wildlife safaris and nature expeditions live from South Africa.",
    groupTitle: "Documentary"
  }
];
