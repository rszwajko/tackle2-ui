import React, { ReactNode, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useVisibilityTracker } from "./useVisibilityTracker";
import "./InfiniteScroller.css";

export interface InfiniteScrollerProps {
  children: ReactNode;
  className?: string;
  fetchMore: () => void;
  hasMore: boolean;
  isReadyToFetch: boolean;
}

export const InfiniteScroller = ({
  children,
  className,
  fetchMore,
  hasMore,
  isReadyToFetch,
}: InfiniteScrollerProps) => {
  const { t } = useTranslation();
  const {
    isVisible,
    loaderRef: sentinelRef,
    visibleZoneRef,
    hiddenZoneRef,
  } = useVisibilityTracker({
    enable: hasMore,
  });

  useEffect(() => {
    if (isVisible && isReadyToFetch) {
      fetchMore();
    }
    console.log("infinite", isVisible);
  }, [isVisible, fetchMore]);

  return (
    <div className={className}>
      <div style={{ position: "relative" }}>
        <div ref={visibleZoneRef} className={"infinite-scroll-visible-zone"} />
        <div ref={hiddenZoneRef} className={"infinite-scroll-hidden-zone"} />
      </div>

      {children}
      {hasMore && (
        <div ref={sentinelRef} className={"infinite-scroll-sentinel"}>
          {t("message.loadingTripleDot")}
        </div>
      )}
    </div>
  );
};
