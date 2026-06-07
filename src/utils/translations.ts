/**
 * Localization Translations for shafinbd TV App
 * Supports Bengali (bn) and English (en) languages.
 */

export type Language = "bn" | "en";

export interface TranslationDictionary {
  manage_feeds: string;
  playlists_loaded: string;
  app_install: string;
  watch: string;
  stations: string;
  feeds: string;
  search_placeholder: string;
  all_categories: string;
  favorites: string;
  recent_history: string;
  no_favorites: string;
  no_history: string;
  clear_history: string;
  adaptive_subtitle: string;
  active_source_default: string;
  active_source_playlist: string;
  cloud_channels_stat: string;
  live_stations_header: string;
  select_playlist: string;
  total_categories: string;
  play_count: string;
  online_status: string;
  search: string;
  most_popular_channels: string;
  no_clicks_yet: string;
  views: string;
}

export const translations: Record<Language, TranslationDictionary> = {
  bn: {
    manage_feeds: "ফিড পরিচালনা",
    playlists_loaded: "প্লেলিস্ট লোড হয়েছে",
    app_install: "অ্যাপ ইন্সটল করুন",
    watch: "দেখুন",
    stations: "চ্যানেল লিস্ট",
    feeds: "ফিডস",
    search_placeholder: "চ্যানেল খুঁজুন...",
    all_categories: "সব ক্যাটাগরি",
    favorites: "ফেভারিটস",
    recent_history: "সাম্প্রতিক হিস্টোরি",
    no_favorites: "আপনার পছন্দের চ্যানেল লিস্টটি বর্তমানে খালি রয়েছে।",
    no_history: "হিস্টোরি ক্লিয়ার আছে। চ্যানেল প্লে করলে এখানে দেখাবে।",
    clear_history: "হিস্টোরি মুছুন",
    adaptive_subtitle: "অ্যাডাপ্টিভ আইপিটিভি প্লেব্যাক এবং মাল্টি-প্লেলিস্ট সেন্টার",
    active_source_default: "🌍 shafinbd ডিফল্ট পাবলিক লাইভ স্টেশন",
    active_source_playlist: "📂 কাস্টম প্লেলিস্ট লোড স্ট্যাটাস",
    cloud_channels_stat: "মোট কাস্টম চ্যানেল সংখ্যা:",
    live_stations_header: "লাইভ স্টেশনসমূহ",
    select_playlist: "প্লেলিস্ট নির্বাচন করুন",
    total_categories: "মোট ক্যাটাগরি",
    play_count: "প্লেব্যাক বার",
    online_status: "অনলাইন",
    search: "অনুসন্ধান",
    most_popular_channels: "সর্বাধিক জনপ্রিয় চ্যানেলসমূহ",
    no_clicks_yet: "এখনো কোনো চ্যানেল চালানো হয়নি। আপনার সর্বাধিক দেখা চ্যানেলগুলি এখানে দেখাবে।",
    views: "বার চালানো হয়েছে",
  },
  en: {
    manage_feeds: "Manage Feeds",
    playlists_loaded: "Playlists Loaded",
    app_install: "App Install",
    watch: "Watch",
    stations: "Channel List",
    feeds: "Feeds",
    search_placeholder: "Search channels...",
    all_categories: "All Categories",
    favorites: "Favorites",
    recent_history: "Recent History",
    no_favorites: "Your favorite streams list is currently empty.",
    no_history: "History is clean. Play some streams to populate this list.",
    clear_history: "Clear History",
    adaptive_subtitle: "Adaptive IPTV Playback and Multi-Playlist Center",
    active_source_default: "🌍 shafinbd Default Public Live Stations",
    active_source_playlist: "📂 Custom Loaded Playlist Channels",
    cloud_channels_stat: "Total Managed Cloud Channels:",
    live_stations_header: "Live Stations",
    select_playlist: "Select Playlist Source",
    total_categories: "Total Categories",
    play_count: "Play count",
    online_status: "Online",
    search: "Search",
    most_popular_channels: "Most Popular Channels",
    no_clicks_yet: "No channels streamed yet. Your most watched channels will generate and show here dynamically.",
    views: "views",
  }
};
