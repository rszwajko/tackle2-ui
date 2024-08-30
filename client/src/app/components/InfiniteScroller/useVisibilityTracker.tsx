import { useEffect, useRef, useState } from "react";

export function useVisibilityTracker({ enable }: { enable: boolean }) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const node = nodeRef.current;

  useEffect(() => {
    if (!enable || !node) {
      console.log("useVisibilityTracker - disabled");
      return undefined;
    }

    // observer with default options - the whole view port used
    // using a parent is hard
    const observer = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]) =>
        entries.forEach(({ isIntersecting, ...rest }) => {
          if (isIntersecting) {
            setVisible(true);
            console.log("useVisibilityTracker - intersection", rest);
          } else {
            setVisible(false);
            console.log("useVisibilityTracker - out-of-box", rest);
          }
        })
    );
    observer.observe(node);

    console.log("useVisibilityTracker - observe");

    return () => {
      observer.disconnect();
      setVisible(false);
      console.log("useVisibilityTracker - disconnect");
    };
  }, [enable, node]);

  return { visible, nodeRef };
}
