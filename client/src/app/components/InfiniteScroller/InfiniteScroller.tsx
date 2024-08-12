import React, { ReactNode, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useInfiniteScroll } from "./useInfiniteScroller";
import "./InfiniteScroller.css";

export interface InfiniteScrollerProps<T> {
  children: ReactNode;
  className: string;
  fetchMore: () => undefined;
  entities: T[];
  hasMore: boolean;
}

export const InfiniteScroller = <T,>({
  children,
  className,
  fetchMore,
  entities,
  hasMore,
}: InfiniteScrollerProps<T>) => {
  const { t } = useTranslation();
  const hasDataChanged = false;
  // Handle the infinite scroll and pagination
  const [page, sentinelStillInView, sentinelRef, scrollerRef] =
    useInfiniteScroll({
      hasMore,
      hasDataChanged,
    });

  useEffect(() => {
    // parent will not display this component until the first page of data is loaded
    if (page > 0) {
      fetchMore();
    }
  }, [page, fetchMore]);

  useEffect(() => {
    if (sentinelStillInView) {
      fetchMore();
    }
  }, [entities, sentinelStillInView, fetchMore]);

  return (
    <div ref={scrollerRef} className={className}>
      {children}
      {hasMore && (
        <div ref={sentinelRef} className={"infinite-scroll-sentinel"}>
          {t("loadingTripleDot")}
        </div>
      )}
    </div>
  );
};
