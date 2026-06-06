import { useState, useEffect } from "react";

/**
 * Custom hook to manage PWA setup, installation event hooks,
 * and standard trigger triggers/notifications.
 */
export default function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);
  const [isInstallDocOpen, setIsInstallDocOpen] = useState(false);

  useEffect(() => {
    // Listen for the chrome prompt trigger
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // Check if running inside installed application window directly
    const isStandalone = 
      window.matchMedia("(display-mode: standalone)").matches || 
      (navigator as any).standalone === true;
      
    if (!isStandalone) {
      setShowInstallBtn(true);
    }

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setShowInstallBtn(false);
      setIsInstallDocOpen(false);
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
          setDeferredPrompt(null);
          setShowInstallBtn(false);
        }
      } catch (err) {
        console.error("Installation request failed", err);
        setIsInstallDocOpen(true);
      }
    } else {
      setIsInstallDocOpen(true);
    }
  };

  return {
    showInstallBtn,
    isInstallDocOpen,
    setIsInstallDocOpen,
    handleInstallClick,
  };
}
