import { useState, useEffect } from "react";
import { WindowIsFullscreen } from "@/../wailsjs/runtime/runtime";

export const useFullScreen = () => {
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Add a resize observer and use WindowIsFullscreen to determine if the window is fullscreen
  // If the window is fullscreen, set the sidebar to be open
  // If the window is not fullscreen, set the sidebar to be closed
  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      const checkFullscreen = async () => {
        if (await WindowIsFullscreen()) {
          setIsFullScreen(true);
        } else {
          setIsFullScreen(false);
        }
      };
      checkFullscreen();
    });
    resizeObserver.observe(document.body);
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return isFullScreen;
};
