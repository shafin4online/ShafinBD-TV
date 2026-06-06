/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Channel } from "../types";
import { SPORTS_CHANNELS } from "./sportsChannels";
import { BANGLADESH_CHANNELS } from "./bangladeshChannels";
import { DOCUMENTARY_CHANNELS } from "./documentaryChannels";
import { INDIA_CHANNELS } from "./indiaChannels";
import { ISLAMIC_CHANNELS } from "./islamicChannels";
import { KIDS_CHANNELS } from "./kidsChannels";
import { MUSIC_CHANNELS } from "./musicChannels";
import { PAKISTAN_CHANNELS } from "./pakistanChannels";
import { OTHERS_CHANNELS } from "./othersChannels";

export const DEFAULT_CHANNELS: Channel[] = [
  ...SPORTS_CHANNELS,
  ...BANGLADESH_CHANNELS,
  ...DOCUMENTARY_CHANNELS,
  ...INDIA_CHANNELS,
  ...ISLAMIC_CHANNELS,
  ...KIDS_CHANNELS,
  ...MUSIC_CHANNELS,
  ...PAKISTAN_CHANNELS,
  ...OTHERS_CHANNELS
];
