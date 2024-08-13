import { RefObject, useEffect, useRef, useState } from "react";

const isSentinelInView = (
  loader: HTMLDivElement | null,
  scrollContainer: HTMLDivElement | null
) => {
  if (!scrollContainer || !loader) {
    return false;
  }

  //
  // If a page fetch doesn't pull enough entities to push the sentinel out of view
  // underlying IntersectionObserver doesn't fire another event, and the scroller
  // gets stuck.  Manually check if the sentinel is in view, and if it is, fetch
  // more data.  The effect is only run when the `vms` part of the redux store is
  // updated.
  //
  const scrollRect = scrollContainer.getBoundingClientRect();
  const scrollVisibleTop = scrollRect.y;
  const scrollVisibleBottom = scrollRect.y + scrollRect.height;

  const sentinelRect = loader.getBoundingClientRect();
  const sentinelTop = sentinelRect.y;
  const sentinelBottom = sentinelRect.y + sentinelRect.height;

  return (
    sentinelBottom >= scrollVisibleTop && sentinelTop <= scrollVisibleBottom
  );
};

export function useInfiniteScroll({
  hasMore,
  reset = false,
  distance = 0,
}: {
  hasMore: boolean;
  reset?: boolean;
  distance?: number;
}): [number, boolean, RefObject<HTMLDivElement>, RefObject<HTMLDivElement>] {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);

  if (reset && page !== 0) {
    setPage(0);
  }

  const sentinelStillInView = isSentinelInView(
    loaderRef.current,
    scrollContainerRef.current
  );

  useEffect(() => {
    const loaderNode = loaderRef.current;
    const scrollContainerNode = scrollContainerRef.current;
    if (!scrollContainerNode || !loaderNode || !hasMore) return;

    const options = {
      // root: scrollContainerNode,
      // rootMargin: `0px 0px ${distance}px 0px`,
    };

    let previousY: number | undefined = 0;
    let previousRatio = 0;

    const listener = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(
        ({
          isIntersecting,
          intersectionRatio,
          boundingClientRect = { y: 0 },
        }) => {
          const { y = 0 } = boundingClientRect;
          if (
            isIntersecting &&
            intersectionRatio >= previousRatio &&
            (!previousY || y < previousY)
          ) {
            setPage((page) => page + 1);
          }
          previousY = y;
          previousRatio = intersectionRatio;
        }
      );
    };

    const observer = new IntersectionObserver(listener, options);
    observer.observe(loaderNode);

    return () => observer.disconnect();
  }, [hasMore, distance]);

  return [page, sentinelStillInView, loaderRef, scrollContainerRef];
}
