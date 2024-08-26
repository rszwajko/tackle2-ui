import { RefObject, useEffect, useRef, useState } from "react";

export function useVisibilityTracker({
  enable,
}: {
  enable: boolean;
}): [boolean, RefObject<HTMLDivElement>] {
  const loaderRef = useRef<HTMLDivElement>(null);
  const [intersectionDetected, setIntersectionDetected] = useState(false);

  useEffect(() => {
    const loaderNode = loaderRef.current;
    if (!loaderNode || !enable || intersectionDetected) {
      console.log("infinite - clear", loaderNode, enable, intersectionDetected);
      setIntersectionDetected(false);
      return undefined;
    }

    const intersectionCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(({ isIntersecting }) => {
        if (isIntersecting) {
          setIntersectionDetected(true);
          // loaderNode && observer.unobserve(loaderNode);
          console.log("infinite - isVisible");
        } else {
          console.log("infinite - no change");
        }
      });
    };

    const observer = new IntersectionObserver(intersectionCallback);
    observer.observe(loaderNode);
    console.log("infinite - observe");

    return () => {
      observer.disconnect();
      console.log("infinite - disconnect");
    };
  }, [enable, intersectionDetected]);

  return [intersectionDetected, loaderRef];
}
