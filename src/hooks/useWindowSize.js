import { useState, useEffect } from "react";

export function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener("resize", handleResize);

    // Call handler right away so state gets updated with initial window size
    handleResize();

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []); // Empty array ensures that effect is only run on mount

  return windowSize;
}

// Helper function to determine device type based on width
export function getDeviceType(width) {
  if (width < 640) return "mobile";
  if (width < 768) return "tablet-small";
  if (width < 1024) return "tablet";
  if (width < 1280) return "laptop";
  return "desktop";
}

// Custom hook that combines window size with device type detection
export function useDeviceType() {
  const { width } = useWindowSize();
  return {
    width,
    deviceType: getDeviceType(width),
    isMobile: width < 640,
    isTablet: width >= 640 && width < 1024,
    isLaptop: width >= 1024 && width < 1280,
    isDesktop: width >= 1280,
  };
}
