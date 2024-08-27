import { useEffect, useRef, useState } from "react";

const intersectionCallback =
  (stateCallback: () => void) => (entries: IntersectionObserverEntry[]) => {
    entries.forEach(({ isIntersecting }) => {
      if (isIntersecting) {
        stateCallback();
      }
    });
  };

export function useVisibilityTracker({ enable }: { enable: boolean }) {
  const loaderRef = useRef<HTMLDivElement>(null);
  const visibleZoneRef = useRef<HTMLDivElement>(null);
  const hiddenZoneRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (
      !enable ||
      !loaderRef.current ||
      !visibleZoneRef.current ||
      !hiddenZoneRef.current
    ) {
      console.log("useVisibilityTracker - disabled");
      return undefined;
    }

    const visibleZoneObserver = new IntersectionObserver(
      intersectionCallback(() => setIsVisible(true)),
      { root: visibleZoneRef.current, rootMargin: "0px", threshold: 1.0 }
    );
    const hiddenZoneObserver = new IntersectionObserver(
      intersectionCallback(() => setIsVisible(false)),
      { root: hiddenZoneRef.current, rootMargin: "0px", threshold: 1.0 }
    );
    visibleZoneObserver.observe(loaderRef.current);
    hiddenZoneObserver.observe(loaderRef.current);

    console.log("useVisibilityTracker - observe");

    return () => {
      visibleZoneObserver.disconnect();
      hiddenZoneObserver.disconnect();
      console.log("useVisibilityTracker - disconnect");
    };
  }, [enable]);

  return { isVisible, loaderRef, visibleZoneRef, hiddenZoneRef };
}
