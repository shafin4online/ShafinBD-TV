import { useEffect } from "react";

/**
 * Custom hook to protect the application from inspection/source viewing.
 * Blocks right-click context menu and standard DevTools keyboard shortcuts.
 */
export default function useSecurityShield() {
  useEffect(() => {
    // 1. Prevent Right-Click Context Menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // 2. Prevent Developer Tools Keyboard Shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Key code or direct keys
      const isF12 = e.key === "F12" || e.keyCode === 123;
      
      // Ctrl+Shift+I or Cmd+Opt+I (Chrome/Safari DevTools)
      const isDevToolsShortCut = 
        (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "i" || e.keyCode === 73)) ||
        (e.metaKey && e.altKey && (e.key === "I" || e.key === "i" || e.keyCode === 73));

      // Ctrl+Shift+J or Cmd+Opt+J (Console window)
      const isConsoleShortcut = 
        (e.ctrlKey && e.shiftKey && (e.key === "J" || e.key === "j" || e.keyCode === 74)) ||
        (e.metaKey && e.altKey && (e.key === "J" || e.key === "j" || e.keyCode === 74));

      // Ctrl+Shift+C or Cmd+Opt+C (Inspector element select)
      const isInspectorShortcut = 
        (e.ctrlKey && e.shiftKey && (e.key === "C" || e.key === "c" || e.keyCode === 67)) ||
        (e.metaKey && e.altKey && (e.key === "C" || e.key === "c" || e.keyCode === 67));

      // Ctrl+U or Cmd+Opt+U (View Page Source)
      const isSourceCodeShortcut = 
        (e.ctrlKey && (e.key === "U" || e.key === "u" || e.keyCode === 85)) ||
        (e.metaKey && e.altKey && (e.key === "U" || e.key === "u" || e.keyCode === 85));

      // Ctrl+S or Cmd+S (Save page)
      const isSaveShortcut = 
        (e.ctrlKey && (e.key === "S" || e.key === "s" || e.keyCode === 83)) ||
        (e.metaKey && (e.key === "S" || e.key === "s" || e.keyCode === 83));

      if (
        isF12 || 
        isDevToolsShortCut || 
        isConsoleShortcut || 
        isInspectorShortcut || 
        isSourceCodeShortcut ||
        isSaveShortcut
      ) {
        e.preventDefault();
      }
    };

    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
}
