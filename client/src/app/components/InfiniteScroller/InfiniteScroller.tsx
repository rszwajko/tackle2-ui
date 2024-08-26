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
  const [visibilityCounter, sentinelRef] = useVisibilityTracker({
    enable: hasMore && isReadyToFetch,
  });

  useEffect(() => {
    if (visibilityCounter) {
      fetchMore();
    }
    console.log("infinite", visibilityCounter);
  }, [visibilityCounter, fetchMore]);

  return (
    <div className={className}>
      {children}
      {hasMore && (
        <div ref={sentinelRef} className={"infinite-scroll-sentinel"}>
          {t("message.loadingTripleDot")}
        </div>
      )}
    </div>
  );
};
