import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getAllReports } from "@/api/admin";
import { getErrorMessage } from "@/utils/getErrorMessage";

const PAGE_LIMIT = 20;

export const useAdminReports = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [reports, setReports] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const filters = {
    status: searchParams.get("status") || "",
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

  const fetchReports = useCallback(
    (signal) => {
      setIsLoading(true);
      setIsError(false);

      getAllReports({ status: filters.status || undefined, page: filters.page, limit: PAGE_LIMIT }, { signal })
        .then((response) => {
          setReports(response.data.data.reports);
          setTotal(response.data.data.total);
          setIsLoading(false);
        })
        .catch((error) => {
          if (error.code === "ERR_CANCELED") return;
          setIsError(true);
          setErrorMessage(getErrorMessage(error, "Failed to load reports"));
          setIsLoading(false);
        });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [filterKey]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchReports(controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey]);

  const updateReportLocally = useCallback((reportId, patch) => {
    setReports((current) => current.map((report) => (report._id === reportId ? { ...report, ...patch } : report)));
  }, []);

  const removeReportLocally = useCallback((reportId) => {
    setReports((current) => current.filter((report) => report._id !== reportId));
    setTotal((current) => Math.max(0, current - 1));
  }, []);

  return {
    reports,
    total,
    limit: PAGE_LIMIT,
    filters,
    setFilter,
    isLoading,
    isError,
    errorMessage,
    refetch: () => fetchReports(),
    updateReportLocally,
    removeReportLocally,
  };
};
