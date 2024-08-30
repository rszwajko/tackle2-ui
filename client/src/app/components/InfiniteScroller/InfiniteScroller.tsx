import React, { ReactNode, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useVisibilityTracker } from "./useVisibilityTracker";
import "./InfiniteScroller.css";

export interface InfiniteScrollerProps {
  children: ReactNode;
  fetchMore: () => boolean;
  hasMore: boolean;
  itemCount: number;
}

export const InfiniteScroller = ({
  children,
  fetchMore,
  hasMore,
  itemCount,
}: InfiniteScrollerProps) => {
  const { t } = useTranslation();
  // track how many items were known at time of triggering the fetch
  // parent is expected to display empty state until some items are available
  // initializing with zero ensures that the effect will be triggered immediately
  const itemCountRef = useRef(0);
  const { visible: isSentinelVisible, nodeRef: sentinelRef } =
    useVisibilityTracker({
      enable: hasMore,
    });

  console.log("infinite props ", hasMore, itemCount, itemCountRef.current);
  useEffect(() => {
    console.log(
      `infinite [visible= >${isSentinelVisible}<] `,
      itemCount,
      itemCountRef.current
    );
    if (
      isSentinelVisible &&
      itemCountRef.current !== itemCount &&
      fetchMore()
    ) {
      itemCountRef.current = itemCount;
    } else if (isSentinelVisible && itemCountRef.current === itemCount) {
      // network call may fail which would block fetching
      // TODO: implement reset based on hit counter  i.e.
      // if (hitCounter > maxHits) itemCountRef.current = 0
    }
  }, [isSentinelVisible, fetchMore, itemCount]);

  return (
    <div>
      {children}
      {hasMore && (
        <div ref={sentinelRef} className="infinite-scroll-sentinel">
          {t("message.loadingTripleDot")}
        </div>
      )}
    </div>
  );
};
