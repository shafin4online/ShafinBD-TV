/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Channel {
  id: string;
  name: string;
  url: string;
  category: string;
  logoUrl?: string;
  description?: string;
  groupTitle?: string;
}

export interface PlayHistoryItem {
  channelId: string;
  name: string;
  url: string;
  category: string;
  logoUrl?: string;
  timestamp: number;
}

export interface SavedPlaylist {
  id: string;
  name: string;
  channels: Channel[];
  importDate: string;
  isActive: boolean;
}
