import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getAllVisitors } from "@/api/admin";
import { getErrorMessage } from "@/utils/getErrorMessage";

const PAGE_LIMIT = 20;

// Same URL-params-as-source-of-truth pattern as useAdminUsers.js /
// useAdminReports.js — shareable, survives refresh. Sorting is always
// newest-first server-side (visitorController.js getAllVisitors), so
// there's no sort filter here, matching the spec.
export const useAdminVisitors = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [visitors, setVisitors] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const filters = {
    search: searchParams.get("search") || "",
    isGuest: searchParams.get("isGuest") || "",
    permissionStatus: searchParams.get("permissionStatus") || "",
    deviceType: searchParams.get("deviceType") || "",
    startDate: searchParams.get("startDate") || "",
    endDate: searchParams.get("endDate") || "",
    page: Number(searchParams.get("page")) || 1,
  };

  const setFilter = useCallback(
    (key, value) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (value === "" || value === null || value === undefined) {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }
        if (key !== "page") next.delete("page");
        return next;
      });
    },
    [setSearchParams]
  );

  const filterKey = JSON.stringify(filters);

  const fetchVisitors = useCallback(
    (signal) => {
      setIsLoading(true);
      setIsError(false);

      getAllVisitors(
        {
          search: filters.search || undefined,
          isGuest: filters.isGuest || undefined,
          permissionStatus: filters.permissionStatus || undefined,
          deviceType: filters.deviceType || undefined,
          startDate: filters.startDate || undefined,
          endDate: filters.endDate || undefined,
          page: filters.page,
          limit: PAGE_LIMIT,
        },
        { signal }
      )
        .then((response) => {
          setVisitors(response.data.data.visitors);
          setTotal(response.data.data.total);
          setIsLoading(false);
        })
        .catch((error) => {
          if (error.code === "ERR_CANCELED") return;
          setIsError(true);
          setErrorMessage(getErrorMessage(error, "Failed to load visitors"));
          setIsLoading(false);
        });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [filterKey]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchVisitors(controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey]);

  const removeVisitorLocally = useCallback((visitorId) => {
    setVisitors((current) => current.filter((visitor) => visitor._id !== visitorId));
    setTotal((current) => Math.max(0, current - 1));
  }, []);

  return {
    visitors,
    total,
    limit: PAGE_LIMIT,
    filters,
    setFilter,
    isLoading,
    isError,
    errorMessage,
    refetch: () => fetchVisitors(),
    removeVisitorLocally,
  };
};
