import { useEffect } from "react";

export function useKeyboardShortcuts(shortcuts) {
  useEffect(() => {
    function handleKeyDown(event) {
      for (const shortcut of shortcuts) {
        const matches =
          event.key === shortcut.key &&
          (shortcut.ctrlKey === undefined ||
            shortcut.ctrlKey === event.ctrlKey) &&
          (shortcut.metaKey === undefined ||
            shortcut.metaKey === event.metaKey) &&
          (shortcut.shiftKey === undefined ||
            shortcut.shiftKey === event.shiftKey);

        if (matches) {
          event.preventDefault();
          shortcut.handler();
          break;
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts]);
}
