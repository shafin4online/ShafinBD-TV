/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Channel } from "../types";

export const ISLAMIC_CHANNELS: Channel[] = [
  {
    id: "islamic_tv",
    name: "Islamic TV",
    url: "https://owrcovcrpy.gpcdn.net/bpk-tv/1724/output/1724-audio_113542_eng=113200-video=2202800.m3u8",
    category: "Islamic",
    description: "Bangladeshi Islamic television channel featuring religious discussions, Quran recitations, and lectures.",
    groupTitle: "Islamic"
  },
  {
    id: "makkah_live",
    name: "Makkah Live",
    url: "https://app24.jagobd.com.bd/c3VydmVyX8RpbEU9Mi8xNy8yMFDEEHGcfRgzQ6NTAgdEoaeFzbF92YWxIZTO0U0ezN1IzMyfvcEdsEfeDeKiNkVN3PTOmdFseWRtaW51aiPhnPTI2/makkah.stream/tracks-v1a1/mono.m3u8",
    category: "Islamic",
    description: "Live 24/7 broadcast from the Masjid al-Haram in Mecca, Saudi Arabia.",
    groupTitle: "Islamic"
  },
  {
    id: "madina_live",
    name: "Madina Live",
    url: "https://cdn-globecast.akamaized.net/live/eds/saudi_sunnah/hls_roku/index.m3u8",
    category: "Islamic",
    description: "Live 24/7 streaming from Al-Masjid an-Nabawi (The Prophet's Mosque) in Medina, Saudi Arabia.",
    groupTitle: "Islamic"
  },
  {
    id: "peace_tv_bangla",
    name: "Peace TV Bangla",
    url: "https://dzkyvlfyge.erbvr.com/PeaceTvBangla/tracks-v3a1/mono.m3u8",
    category: "Islamic",
    description: "Islamic sermon channel focused on peaceful inter-faith and moral education in Bengali.",
    groupTitle: "Islamic"
  },
  {
    id: "quran_tv",
    name: "Quran TV",
    url: "https://live.kwikmotion.com/sharjahtvquranlive/shqurantv.smil/playlist.m3u8",
    category: "Islamic",
    description: "Specialized feed dedicated to continuous Quran recitations with translation and interpretation.",
    groupTitle: "Islamic"
  },
  {
    id: "waz_tv",
    name: "WAZ TV",
    url: "https://tplay.live/originals/ilm-tv/index.m3u8",
    category: "Islamic",
    description: "Providing Islamic lectures, Islamic music, values-oriented and sermon programs.",
    groupTitle: "Islamic"
  }
];
