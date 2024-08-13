import React, { ReactNode, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useInfiniteScroll } from "./useInfiniteScroller";
import "./InfiniteScroller.css";

export interface InfiniteScrollerProps {
  children: ReactNode;
  className?: string;
  fetchMore: () => void;
  hasMore: boolean;
}

export const InfiniteScroller = ({
  children,
  className,
  fetchMore,
  hasMore,
}: InfiniteScrollerProps) => {
  const { t } = useTranslation();
  // Handle the infinite scroll and pagination
  const [page, sentinelStillInView, sentinelRef, scrollerRef] =
    useInfiniteScroll({
      hasMore,
    });
  const pageRef = useRef(0);

  useEffect(() => {
    if (pageRef.current < page) {
      fetchMore();
      pageRef.current = page;
    }
  }, [page, fetchMore]);

  // useEffect(() => {
  //   if (sentinelStillInView && hasMore) {
  //     fetchMore();
  //   }
  // }, [hasMore, sentinelStillInView, fetchMore]);

  return (
    <div ref={scrollerRef} className={className}>
      {children}
      {hasMore && (
        <div ref={sentinelRef} className={"infinite-scroll-sentinel"}>
          {t("message.loadingTripleDot")}
        </div>
      )}
    </div>
  );
};
