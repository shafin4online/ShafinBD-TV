/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import VideoSection from "./components/VideoSection";
import ChannelSidebar from "./components/ChannelSidebar";
import PlaylistManager from "./components/PlaylistManager";
import Header from "./components/Header";
import Footer from "./components/Footer";
import MobileBottomNav from "./components/MobileBottomNav";
import PWAInstallModal from "./components/PWAInstallModal";
import DisclaimerModal from "./components/DisclaimerModal";
import ActiveSourceBar from "./components/ActiveSourceBar";
import useSecurityShield from "./hooks/useSecurityShield";
import useIPTVState from "./hooks/useIPTVState";
import usePWAInstall from "./hooks/usePWAInstall";

export default function App() {
  // --- SECURITY ENHANCEMENTS ---
  // Apply Right-Click block & Developer Tools Keyboard shortcuts prevention
  useSecurityShield();

  // --- COMPACT IPTV STATE ---
  const {
    playlists,
    activePlaylistId,
    history,
    favorites,
    activeChannel,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    activeControlTab,
    setActiveControlTab,
    activeImportMethod,
    setActiveImportMethod,
    mobileActiveTab,
    setMobileActiveTab,
    directStreamUrl,
    setDirectStreamUrl,
    directStreamName,
    setDirectStreamName,
    directStreamCategory,
    setDirectStreamCategory,
    playlistUrlInput,
    setPlaylistUrlInput,
    playlistNameInput,
    setPlaylistNameInput,
    importStatus,
    activeChannels,
    categories,
    filteredChannels,
    handleSelectChannel,
    selectPlaylist,
    toggleFavorite,
    handleDeletePlaylist,
    handlePlayDirectStream,
    handleM3UFileUpload,
    handleImportRemotePlaylist,
    handleClearHistory,
  } = useIPTVState();

  // --- PWA INSTALLATION SYSTEM ---
  const {
    showInstallBtn,
    isInstallDocOpen,
    setIsInstallDocOpen,
    handleInstallClick,
  } = usePWAInstall();

  return (
    <div id="shafinbd-tv-root" className="min-h-screen bg-[#050505] text-neutral-100 font-sans selection:bg-cyan-500 selection:text-neutral-950 flex flex-col antialiased">
      
      {/* 🚀 Sleek Header */}
      <Header 
        playlistsCount={playlists.length + 1} 
        showInstallBtn={showInstallBtn}
        onInstallClick={handleInstallClick}
      />

      {/* 💻 Main Layout Grid Block */}
      <main id="app-main-layout" className="flex-1 max-w-7xl w-full mx-auto px-4 py-4 md:py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pb-24 lg:pb-6">
        
        {/* Left Side: Video Host & Configurations (8/12 Columns) */}
        <div 
          id="player-and-import-panel" 
          className="lg:col-span-8 flex flex-col gap-4 md:gap-6 w-full sticky top-[64px] md:top-[80px] lg:relative lg:top-0 z-30 bg-[#050505]/95 backdrop-blur-md pb-4 lg:pb-0 border-b border-white/5 lg:border-none px-1 lg:px-0 transform-gpu"
        >
          
          {/* Main IPTV player */}
          <VideoSection activeChannel={activeChannel} />

          {/* Quick Playlist Selection Bar & Info Statuses */}
          <ActiveSourceBar
            mobileActiveTab={mobileActiveTab}
            activePlaylistId={activePlaylistId}
            playlists={playlists}
            activeChannelsCount={activeChannels.length}
            selectPlaylist={selectPlaylist}
            importStatus={importStatus}
          />

          {/* Configuration Desk (Playlists import & Links payload) */}
          <div className={`${mobileActiveTab === "playlists" ? "block" : "hidden lg:block"}`}>
            <PlaylistManager
              playlists={playlists}
              activePlaylistId={activePlaylistId}
              history={history}
              favorites={favorites}
              activeControlTab={activeControlTab}
              setActiveControlTab={setActiveControlTab}
              activeImportMethod={activeImportMethod}
              setActiveImportMethod={setActiveImportMethod}
              directStreamUrl={directStreamUrl}
              setDirectStreamUrl={setDirectStreamUrl}
              directStreamName={directStreamName}
              setDirectStreamName={setDirectStreamName}
              directStreamCategory={directStreamCategory}
              setDirectStreamCategory={setDirectStreamCategory}
              playlistUrlInput={playlistUrlInput}
              setPlaylistUrlInput={setPlaylistUrlInput}
              playlistNameInput={playlistNameInput}
              setPlaylistNameInput={setPlaylistNameInput}
              activeChannels={activeChannels}
              handleSelectChannel={handleSelectChannel}
              selectPlaylist={selectPlaylist}
              toggleFavorite={toggleFavorite}
              handleDeletePlaylist={handleDeletePlaylist}
              handlePlayDirectStream={handlePlayDirectStream}
              handleM3UFileUpload={handleM3UFileUpload}
              handleImportRemotePlaylist={handleImportRemotePlaylist}
              handleClearHistory={handleClearHistory}
            />
          </div>

        </div>

        {/* Right Side: Channel Sidebar (4/12 Columns) */}
        <div className={`lg:col-span-4 w-full ${mobileActiveTab === "channels" ? "block" : "hidden lg:block"}`}>
          <ChannelSidebar
            filteredChannels={filteredChannels}
            activeChannels={activeChannels}
            activeChannel={activeChannel}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            handleSelectChannel={handleSelectChannel}
          />
        </div>

      </main>

      {/* 📱 Mobile & Tablet View bottom navigation menu bar */}
      <MobileBottomNav 
        mobileActiveTab={mobileActiveTab}
        setMobileActiveTab={setMobileActiveTab}
      />

      {/* 🔮 Deep Footer */}
      <Footer />

      {/* 📱 PWA Manual Installation Walkthrough Dialog Modal */}
      <PWAInstallModal 
        isOpen={isInstallDocOpen}
        onClose={() => setIsInstallDocOpen(false)}
      />

      {/* 📜 First-time User Terms Notice & Disclaimer Modal */}
      <DisclaimerModal />
    </div>
  );
}
